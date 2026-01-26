"use client";

import { supabase } from "@/utils/supabase/client";
import { GuestPropertyData, Property } from "@/types";
import { normalizeSido, normalizeDong } from "@/app/manage/components/filters/util/AddressFilter";


/**
 * ✅ 손님 매물 조건 기반 추천 매물 리스트 가져오기 (최신 안정 버전)
 * - 콤마 포함 문자열 금액 → JS에서 숫자 변환 후 비교
 * - DB는 그대로 유지
 */

function normalizeAddressFull(address: string) {
    // 주소 전체를 “서울특별시 → 서울” + “삼성1동 → 삼성동” 으로 정규화
    const parts = address.split(" ");
    const sido = normalizeSido(parts[0] || "");
    const sigugun = parts[1] || "";
    const dong = parts[2] ? normalizeDong(parts[2]) : "";
    return `${sido} ${sigugun} ${dong}`.trim();
}

function matchLocation(guestLoc: string, propertyAddress: string) {
    const normalizedGuest = normalizeAddressFull(guestLoc.replace("전체", "").trim());
    const normalizedProperty = normalizeAddressFull(propertyAddress);

    // ✅ “전체” 선택한 경우엔 구 단위까지만 비교
    if (guestLoc.includes("전체")) {
        const [, sigugun] = normalizedGuest.split(" ");
        return normalizedProperty.includes(sigugun);
    }

    // ✅ 각 단어가 모두 포함되면 통과
    return normalizedGuest
        .split(" ")
        .filter(Boolean)
        .every((part) => normalizedProperty.includes(part));
}


function cleanNumber(v?: string | number | null) {
    if (!v) return 0;
    return Number(v.toString().replace(/,/g, ""));
}

// ✅ 날짜 파싱 및 비교용 함수
function parseDateOnly(value: string | number | Date | null | undefined): Date | null {
    if (!value) return null;
    const text = value.toString().trim();

    // "즉시" / "협의" 제외
    if (text.includes("즉시") || text.includes("협의")) return null;

    try {
        const d = new Date(text);
        if (isNaN(d.getTime())) return null;

        // ✅ UTC → 로컬(KST) 변환 후 시간 제거
        const local = new Date(d.getTime() + 9 * 60 * 60 * 1000); // UTC +9
        local.setHours(0, 0, 0, 0);
        return local;
    } catch {
        return null;
    }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function normalizeAddress(_str: string): string {
    return _str
        .replace(/\s+/g, "")        // 공백 제거
        .replace("서울시", "서울특별시")
        .replace("부산시", "부산광역시")
        .replace("경기", "경기도")
        .trim();
}



export async function fetchRecommendedProperties(
    data: GuestPropertyData,
    companyId?: number | null
): Promise<Property[]> {
    try {
        // ✅ company_id 기반으로 같은 회사의 직원 ID 목록 가져오기
        let companyEmployeeIds: number[] = [];
        if (companyId !== null && companyId !== undefined) {
            const { data: employees } = await supabase
                .from("employee")
                .select("id")
                .eq("company_id", companyId);
            
            if (employees) {
                companyEmployeeIds = employees
                    .map((emp) => emp.id)
                    .filter((id): id is number => id !== undefined && id !== null);
            }
        }

        let query = supabase.from("property").select("*");

        // ✅ 광고중 매물만 필터
        query = query.filter("on_board_state->>on_board_state", "eq", "true");
        
        // ✅ company_id가 있으면 같은 company_id를 가진 employee의 매물만 필터링 (employee_id 기반)
        if (companyId !== null && companyId !== undefined && companyEmployeeIds.length > 0) {
            query = query.in("employee_id", companyEmployeeIds);
        } else if (companyId !== null && companyId !== undefined && companyEmployeeIds.length === 0) {
            // company_id가 있지만 해당 회사의 직원이 없으면 빈 결과 반환
            return [];
        }

        // ✅ 1️⃣ 대분류 매물타입 매핑
        if (data.type) {
            let mappedTypes: string[] = [];

            switch (data.type) {
                case "주거":
                    mappedTypes = ["아파트", "오피스텔", "공동주택(아파트 외)", "단독주택(임대)"];
                    break;
                case "상가/사무실/산업":
                    mappedTypes = ["상업/업무/공업용"];
                    break;
                case "건물":
                    mappedTypes = ["건물"];
                    break;
                case "토지":
                    mappedTypes = ["토지"];
                    break;
            }

            if (mappedTypes.length > 0) {
                query = query.in("property_type", mappedTypes);
            }
        }

        // ✅ 2️⃣ 세부 매물유형 (propertys_check)
        if (data.propertys_check && data.propertys?.length > 0) {
            const mapped = data.propertys.flatMap((p) => {
                switch (p) {
                    case "아파트":
                        return ["아파트"];
                    case "오피스텔":
                        return ["오피스텔"];
                    case "빌라":
                        return ["공동주택", "단독주택"];
                    case "상가":
                        return ["상가"];
                    case "사무실":
                        return ["사무실"];
                    case "산업용":
                        return ["공장", "창고", "산업용"];
                    case "건물":
                        return ["건물"];
                    case "토지":
                        return ["토지"];
                    default:
                        return [p];
                }
            });

            query = query.in("data->>type", mapped);
        }

        // ✅ 3️⃣ 사용용도 (estate_check)
        if (data.estate_check && data.estate_use?.length > 0) {
            const mappedEstateUses = data.estate_use.flatMap((use) => {
                switch (use) {
                    case "아파트":
                        return ["아파트", "도시생활주택", "분양권", "기타"];
                    case "오피스텔":
                        return ["분양권", "오피스텔(주거용)", "오피스텔(사업자)", "기타"];
                    case "공동주택":
                    case "단독주택":
                    case "빌라":
                        return [
                            "도시생활주택", "분양권", "다세대", "연립",
                            "다가구", "다중주택", "단독주택", "근린생활시설", "기타",
                        ];
                    case "상가":
                    case "사무실":
                    case "산업용":
                        return [
                            "1종근린생활", "2종근린생활", "업무시설",
                            "대형빌딩", "꼬마빌딩", "의료시설", "공장", "창고",
                            "숙박", "지식산업센터", "기타",
                        ];
                    case "건물":
                        return [
                            "상가주택", "다세대 통", "단독주택(다가구)",
                            "근린생활시설", "중소형빌딩", "대형빌딩",
                            "공장", "창고", "기타",
                        ];
                    case "토지":
                        return [
                            "대", "전", "답", "임야", "과수원", "목장용지", "광천지", "염전",
                            "공장용지", "학교용지", "주유소용지", "창고용지", "도로", "철도용지",
                            "제방", "하천", "구거", "유지", "양어장", "수도용지", "공원",
                            "체육용지", "유원지", "종교용지", "사적지", "묘지", "잡종지", "기타",
                        ];
                    default:
                        return [use];
                }
            });

            // ✅ 핵심: estate_use를 data->>estate_use 기준으로 매칭
            query = query.in("data->>estate_use", mappedEstateUses);
        }

        // ✅ 5️⃣ 거래종류 (trade_types)
        // 주의: 데이터베이스 쿼리 단계에서는 거래종류 필터링을 하지 않고,
        // 클라이언트 필터링 단계에서 정확하게 처리합니다.
        // 이는 JSON 배열 필드의 정확한 검색이 복잡하고, 전세/월세를 모두 선택한 경우
        // OR 조건으로 처리해야 하기 때문입니다.

        // ✅ 🔟 면적 조건 (area_check)
        if (data.area_check) {
            const ref = Number(data.area_reference || 0);
            if (ref > 0) query = query.filter("data->>area_reference", "gte", ref.toString());
        }

        // ✅ ⑪ 방/욕실/거실 조건 (room_check)
        if (data.room_check) {

            // -------------------------------
            // ✔ 방 개수: 설정한 값 이상
            // -------------------------------
            if (data.room_number) {
                query = query.filter(
                    "data->>structure_room",
                    "gte",
                    data.room_number.toString()
                );
            }

            // -------------------------------
            // ✔ 욕실 개수: 설정한 값 이상
            // -------------------------------
            if (data.room_bathroom_number) {
                query = query.filter(
                    "data->>structure_bathroom",
                    "gte",
                    data.room_bathroom_number.toString()
                );
            }

            // -------------------------------
            // ✔ 거실 여부 (기존 그대로 유지)
            // -------------------------------
            if (data.room_is_livingroom === "Y") {
                query = query.filter("data->>structure_living_room", "eq", "거실있음");
            }
            if (data.room_is_livingroom === "N") {
                query = query.filter("data->>structure_living_room", "eq", "거실없음");
            }
        }


        // ✅ ⑬ 주차 조건 (parking_check)
        if (data.parking_check) {
            if (data.parking_is_car === "Y") {
                // ✅ 손님이 "주차 가능(Y)" 선택 → 가능 or 협의 매물만
                query = query.or("data->>parking_available.eq.가능,data->>parking_available.eq.협의");
            }
            // ✅ 손님이 "불가(N)" 선택한 경우는 모든 매물 허용 → 아무 필터도 안 걸음

            if (data.parking_number) {
                query = query.filter("data->>parking_number", "gte", data.parking_number.toString());
            }
        }


        // ✅ ⑭ 애완동물 (pet_check)
        if (data.pet_check) {
            if (data.pet_is_pet === "Y") {
                // ✅ 손님이 '가능' 선택 → 가능, 모름, 협의 매물 표시
                query = query.or(
                    "data->>pet_allowed.eq.가능,data->>pet_allowed.eq.모름,data->>pet_allowed.eq.협의"
                );
            } else if (data.pet_is_pet === "N") {
                // ✅ 손님이 '불가' 선택 → 불가 매물만 표시
                query = query.filter("data->>pet_allowed", "eq", "불가");
            }
        }

        // ✅ ⑱ 전대여부 (sublease_check)
        if (data.sublease_check && data.sublease) {
            query = query.filter("data->>sublease", "eq", data.sublease);
        }

        // ✅ 쿼리 실행
        const { data: properties, error } = await query;

        if (error) {
            console.error("❌ 추천 매물 쿼리 실패:", error.message || error);
            throw error;
        }

        let filtered = properties || [];

        // ✅ 선택된 거래종류 목록 생성
        const selectedTradeTypes: string[] = [];
        if (data.trade_price_check) selectedTradeTypes.push("매매");
        if (data.trade_deposit_check) selectedTradeTypes.push("전세");
        if (data.trade_rent_check) selectedTradeTypes.push("월세");

        // ✅ 선택된 거래종류가 있으면, 해당 거래종류가 있는 매물만 필터링
        if (selectedTradeTypes.length > 0 && data.trade_types?.length > 0) {
            const enabledTypes = data.trade_types.filter((t) => selectedTradeTypes.includes(t));
            
            if (enabledTypes.length > 0) {
                filtered = filtered.filter((p) => {
                    const tradeTypes = Array.isArray(p.data?.trade_types) 
                        ? p.data.trade_types 
                        : [];
                    // 매물이 선택된 거래종류 중 하나라도 있으면 통과
                    return enabledTypes.some((type) => tradeTypes.includes(type));
                });
            }
        }

        // ✅ (클라이언트 필터링) 매매가
        if (data.trade_price_check) {
            const min = cleanNumber(data.trade_price_min);
            const max = cleanNumber(data.trade_price_max);

            filtered = filtered.filter((p) => {
                // ✅ 매물의 trade_types에 "매매"가 있는지 확인
                const tradeTypes = Array.isArray(p.data?.trade_types) 
                    ? p.data.trade_types 
                    : [];
                const hasSale = tradeTypes.includes("매매");
                
                // 매매 매물이 아니면 통과 (다른 필터에서 처리)
                if (!hasSale) return true;
                
                const raw = p.data?.trade_price ?? "0";
                const num = Number(raw.toString().replace(/,/g, "")) || 0;
                if (min > 0 && num < min) return false;
                if (max > 0 && num > max) return false;
                return true;
            });
        }

        // ✅ (클라이언트 필터링) 전세보증금
        if (data.trade_deposit_check) {
            const min = cleanNumber(data.trade_deposit_min);
            const max = cleanNumber(data.trade_deposit_max);

            filtered = filtered.filter((p) => {
                // ✅ 매물의 trade_types에 "전세"가 있는지 확인
                const tradeTypes = Array.isArray(p.data?.trade_types) 
                    ? p.data.trade_types 
                    : [];
                const hasJeonse = tradeTypes.includes("전세");
                
                // 전세 매물이 아니면 통과 (다른 필터에서 처리)
                if (!hasJeonse) return true;
                
                const raw = p.data?.trade_deposit ?? "0";
                const num = Number(raw.toString().replace(/,/g, "")) || 0;
                if (min > 0 && num < min) return false;
                if (max > 0 && num > max) return false;
                return true;
            });
        }
        
        // ✅ (클라이언트 필터링) 월세 조건 — NEW LOGIC
        function matchesMonthlyRent(p: Property, data: GuestPropertyData) {
            const rentMin = cleanNumber(data.trade_rent_min);
            const rentMax = cleanNumber(data.trade_rent_max);
            const depositMin = cleanNumber(data.trade_rent_deposit_min);
            const depositMax = cleanNumber(data.trade_rent_deposit_max);
        
            const d = p.data;
        
            const depMinVal = cleanNumber(d.trade_rent_deposit); 
            const depMaxRaw = cleanNumber(d.trade_rent_deposit_sub);
            const depMaxVal = depMaxRaw || depMinVal;
        
            const rentAtMin = cleanNumber(d.trade_rent);
            const rentAtMaxRaw = cleanNumber(d.trade_rent_sub);
            const rentAtMax = rentAtMaxRaw || rentAtMin;
        
            const hasDep = depositMin > 0 || depositMax > 0;
            const hasRent = rentMin > 0 || rentMax > 0;
        
            // 월세 관련 조건 없음 → 통과
            if (!hasDep && !hasRent) return true;
        
            // 값 부족 → 제외
            if (!depMinVal || !rentAtMin) return false;
        
            const matchCombo = (dep: number, rent: number) => {
                const depOK =
                    (!hasDep) ||
                    ((depositMin === 0 || dep >= depositMin) &&
                     (depositMax === 0 || dep <= depositMax));
        
                const rentOK =
                    (!hasRent) ||
                    ((rentMin === 0 || rent >= rentMin) &&
                     (rentMax === 0 || rent <= rentMax));
        
                return depOK && rentOK;
            };
        
            // A 엔드포인트
            const A_rent = depMinVal === depMaxVal ? rentAtMax : rentAtMin;
        
            return (
                matchCombo(depMinVal, A_rent) ||
                matchCombo(depMaxVal, rentAtMax)
            );
        }        

        if (data.trade_rent_check) {
            filtered = filtered.filter((p) => {
                // ✅ 매물의 trade_types에 "월세"가 있는지 확인
                const tradeTypes = Array.isArray(p.data?.trade_types) 
                    ? p.data.trade_types 
                    : [];
                const hasMonthly = tradeTypes.includes("월세");
                
                // 월세 매물이 아니면 통과 (다른 필터에서 처리)
                if (!hasMonthly) return true;
                
                return matchesMonthlyRent(p, data);
            });
        }


        
        // ✅ (클라이언트 필터링) 입주가능일
        if (data.enter_date_check && data.enter_date) {
            const selectedDate = new Date(data.enter_date);
            selectedDate.setHours(0, 0, 0, 0); // 시간 제거

            filtered = filtered.filter((p) => {
                const enterDateRaw = p.data?.enter_date ?? "";
                const enterIsNow = p.data?.enter_is_now === true;
                const enterIsDiscuss = p.data?.enter_is_discuss === true;

                // ✅ 즉시입주나 협의입주면 무조건 통과
                if (enterIsNow || enterIsDiscuss) return true;

                // ✅ 매물 입주일이 손님 희망일보다 같거나 빠르면 통과
                const propertyDate = parseDateOnly(enterDateRaw);
                if (propertyDate && propertyDate <= selectedDate) {
                    return true;
                }

                return false;
            });
        }

        // ✅ (클라이언트 필터링) 손님이 "즉시입주"만 선택한 경우
        if (data.enter_date_check && data.enter_is_now && !data.enter_is_discuss) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            filtered = filtered.filter((p) => {
                const enterIsNow = p.data?.enter_is_now === true;
                const enterIsDiscuss = p.data?.enter_is_discuss === true;
                const propertyDate = parseDateOnly(p.data?.enter_date);

                // ✅ 즉시입주 or 협의입주 매물 통과
                if (enterIsNow || enterIsDiscuss) return true;

                // ✅ 입주예정일이 오늘 이전(= 이미 입주 가능)
                if (propertyDate && propertyDate <= today) {
                    return true;
                }

                return false;
            });
        }

        // ✅ (클라이언트 필터링) 위치(주소) 기준 필터
        if (data.locations_check && data.locations?.length > 0) {
            filtered = filtered.filter((p) => {
                const propertyAddress = p.data?.address || "";
                if (!propertyAddress) return false;

                // 손님이 선택한 지역 중 하나라도 매물 주소와 일치하면 통과
                return data.locations.some((guestLoc) => matchLocation(guestLoc, propertyAddress));
            });
        }
        

        // ✅ (클라이언트 필터링) 참고면적 ±5평
        if (data.area_check && data.area_reference) {
            const ref = Number(data.area_reference);
            if (!isNaN(ref) && ref > 0) {
                const min = ref - 5;
                const max = ref + 5;

                filtered = filtered.filter((p) => {
                    const raw = p.data?.area_reference ?? "0";
                    const num = Number(raw.toString().replace(/,/g, "")) || 0;
                    return num >= min && num <= max;
                });
            }
        }


        // ✅ (클라이언트 필터링) 층수 조건
        if (data.floor_check && data.floor_types?.length > 0) {
            const floorTypes = data.floor_types;

            // ✅ 상관없음 or 지상+지하 → 전체 통과
            if (
                floorTypes.includes("상관없음") ||
                (floorTypes.includes("지상") && floorTypes.includes("지하"))
            ) {
                // 전체 허용 (필터링 없음)
            } else {
                filtered = filtered.filter((p) => {
                    const d = p.data;
                    const floorApplicable = d.floor_applicable?.toString().trim() ?? "";
                    const floorSemi = d.floor_semibasement === true;
                    const floorRoof = d.floor_rooftop === true;

                    // 🔹 "5", "3" 같은 경우 숫자 파싱
                    let floorNum = Number(floorApplicable);
                    if (isNaN(floorNum)) {
                        // "B1", "지하1" 등 텍스트 패턴 보정
                        if (/B\d|지하/i.test(floorApplicable)) floorNum = -1;
                        else floorNum = 1; // 숫자 못 읽으면 기본값 = 지상
                    }

                    // ✅ 1️⃣ "1층" 선택 시 — 1층 매물만 표시
                    if (floorTypes.includes("1층")) {
                        return floorNum === 1;
                    }

                    // ✅ 2️⃣ "지상" 선택 시 — 1층 이상 or 옥탑 true or 반지하 false
                    if (floorTypes.includes("지상")) {
                        return floorNum >= 1 || floorRoof || !floorSemi;
                    }

                    // ✅ 3️⃣ "지하" 선택 시 — 0층 이하 or 반지하 true
                    if (floorTypes.includes("지하")) {
                        return floorNum < 1 || floorSemi;
                    }

                    // ✅ 4️⃣ "단층" 선택 시 — 지상층 + 옥탑 없음 + 반지하 없음
                    if (floorTypes.includes("단층")) {
                        return floorNum === 1 && !floorRoof && !floorSemi;
                    }

                    // ✅ 5️⃣ "연층" 선택 시 — 2층 이상 (복층, 다층 등)
                    if (floorTypes.includes("연층")) {
                        return floorNum >= 2;
                    }

                    return true; // fallback
                });
            }
        }


        // ✅ (클라이언트 필터링) E/V 여부
        if (data.elevator_check && data.elevator_is) {
            const selected = data.elevator_is; // Y / N / 상관없음

            if (selected !== "상관없음") {
                filtered = filtered.filter((p) => {
                    const houseOther = Array.isArray(p.data?.house_other)
                        ? p.data.house_other
                        : [];

                    const hasElevator = houseOther.includes("엘리베이터");

                    if (selected === "Y") return hasElevator;
                    if (selected === "N") return !hasElevator;

                    return true;
                });
            }
        }

        // ✅ 4️⃣ 용도지역 (land_use_check)
        if (data.land_use_check && data.land_use?.length > 0) {
            const selectedLandUses = data.land_use.map((v) => v.trim());

            filtered = filtered.filter((p) => {
                const landUse = p.data?.land_use;

                if (!landUse) return false;

                // landUse가 문자열이면 부분 포함 검사
                if (typeof landUse === "string") {
                    return selectedLandUses.some((sel) => landUse.includes(sel));
                }

                // landUse가 배열일 경우
                if (Array.isArray(landUse)) {
                    return selectedLandUses.some((sel) =>
                        landUse.some((u) => u.includes(sel))
                    );
                }

                return false;
            });
        }

        // ✅ ⑯ 인테리어 (interior_check)
        if (data.interior_check && data.interior) {
            filtered = filtered.filter((p) => {
                const propertyInterior = p.data?.interior?.toString().trim() ?? "";

                switch (data.interior) {
                    case "필요":
                        return propertyInterior === "Y";

                    case "필요없음":
                        return propertyInterior === "N";

                    // 손님이 "직접예정" 선택 → 인테리어 여부 무관 (Y, N 모두 통과)
                    case "직접예정":
                        return ["Y", "N", ""].includes(propertyInterior);

                    default:
                        return true;
                }
            });
        }


        // ✅ ⑰ 진입도로 (enter_load_check)
        if (data.enter_load_check && data.enter_load) {
            filtered = filtered.filter((p) => {
                const propertyEnterLoad = p.data?.enterload?.toString().trim() ?? "";

                // ✅ 손님이 "Y" 선택 → "있음" 매물만 표시
                if (data.enter_load === "Y") {
                    return propertyEnterLoad === "있음";
                }

                // ✅ 손님이 "N" 선택 → "없음" 매물만 표시
                if (data.enter_load === "N") {
                    return propertyEnterLoad === "없음";
                }

                // ✅ 손님이 "상관없음" 선택 → 전부 허용
                if (data.enter_load === "상관없음") {
                    return true;
                }

                return true; // fallback
            });
        }


        return filtered;
    } catch (err) {
        console.error("❌ 추천 매물 쿼리 실패 (try/catch):", err);
        return [];
    }
}

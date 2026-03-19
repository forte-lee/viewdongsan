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
        
        // ✅ 등록된 매물만 필터 (is_register가 TRUE인 매물만)
        query = query.filter("is_register", "eq", true);
        
        // ✅ employee_id가 NULL이 아닌 매물만 필터링
        query = query.not("employee_id", "is", null);
        
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
        // 체크박스가 체크되어 있어야만 해당 거래종류의 필터가 활성화됨
        // 거래종류 버튼에서 선택한 것과 체크박스가 체크된 것의 교집합만 사용
        const selectedTradeTypes: string[] = [];
        const enabledTradeTypes = data.trade_types || [];
        
        // 거래종류 버튼에서 선택했고, 해당 체크박스가 체크된 것만 포함
        if (enabledTradeTypes.includes("매매") && data.trade_price_check) {
            selectedTradeTypes.push("매매");
        }
        if (enabledTradeTypes.includes("전세") && data.trade_deposit_check) {
            selectedTradeTypes.push("전세");
        }
        // 월세는 월세보증금 체크박스가 체크되어 있어야만 활성화
        // 월세 금액은 체크박스가 없으므로, 월세보증금 체크박스만 확인
        if (enabledTradeTypes.includes("월세") && data.trade_rent_deposit_check) {
            selectedTradeTypes.push("월세");
        }

        // ✅ 선택된 거래종류가 있으면, 해당 거래종류가 있는 매물만 필터링
        // 전체 매물 리스트와 동일한 로직: selectedTradeTypes를 직접 사용
        // 체크박스가 체크되어 있어야만 해당 거래종류가 selectedTradeTypes에 포함되므로,
        // 여기서 필터링하면 체크박스가 체크되지 않은 거래종류의 매물은 제외됨
        if (selectedTradeTypes.length > 0) {
            filtered = filtered.filter((p) => {
                const tradeTypes = Array.isArray(p.data?.trade_types) 
                    ? p.data.trade_types 
                    : [];
                // 매물이 선택된 거래종류 중 하나라도 있으면 통과
                return selectedTradeTypes.some((type) => tradeTypes.includes(type));
            });
        } else {
            // selectedTradeTypes가 비어있으면 모든 거래종류의 매물을 제외
            // (체크박스가 하나도 체크되지 않은 경우)
            filtered = [];
        }

        // ✅ (클라이언트 필터링) 가격 조건 — 전체 매물 리스트와 동일한 OR 로직 적용
        // ─────────────────────────────────────────────────────────────────────────────
        // 매매/전세/월세 조건을 각각 평가하고, 선택된 유형들에 대해 OR(합집합) 처리
        // ─────────────────────────────────────────────────────────────────────────────
        
        // 매매 조건 평가 함수 — 전체 매물 리스트와 동일한 로직
        function matchesSale(p: Property): boolean {
            const tradeTypes = Array.isArray(p.data?.trade_types) 
                ? p.data.trade_types 
                : [];
            const isSaleItem = tradeTypes.includes("매매");
            
            // 매매 매물이 아니면 매매 분기에서는 false
            if (!isSaleItem) return false;
            
            // 매매 조건이 체크되어 있는지 확인
            if (!data.trade_price_check) return true; // 조건이 없으면 매매 매물은 통과
            
            // 사용자 입력 범위 (null 체크)
            const min = data.trade_price_min ? cleanNumber(data.trade_price_min) : null;
            const max = data.trade_price_max ? cleanNumber(data.trade_price_max) : null;
            const hasSale = min !== null || max !== null;
            
            // 조건이 없으면 매매 매물은 통과
            if (!hasSale) return true;
            
            // 매물 값 파싱 (NaN 반환 가능)
            const parseNum = (raw: unknown): number => {
                if (raw === null || raw === undefined || raw === "") return NaN;
                const str = String(raw).replace(/,/g, "");
                const num = Number(str);
                return Number.isNaN(num) ? NaN : num;
            };
            
            const num = parseNum(p.data?.trade_price);
            
            // 사용자가 범위를 넣었는데 매물 값이 없으면 제외
            if (Number.isNaN(num)) return false;
            
            if (min !== null && num < min) return false;
            if (max !== null && num > max) return false;
            return true;
        }

        // 전세 조건 평가 함수 — 전체 매물 리스트와 동일한 로직
        function matchesJeonse(p: Property): boolean {
            const tradeTypes = Array.isArray(p.data?.trade_types) 
                ? p.data.trade_types 
                : [];
            const isJeonseItem = tradeTypes.includes("전세");
            
            // 전세 매물이 아니면 전세 분기에서는 false
            if (!isJeonseItem) return false;
            
            // 전세 조건이 체크되어 있는지 확인
            if (!data.trade_deposit_check) return true; // 조건이 없으면 전세 매물은 통과
            
            // 사용자 입력 범위 (null 체크)
            const min = data.trade_deposit_min ? cleanNumber(data.trade_deposit_min) : null;
            const max = data.trade_deposit_max ? cleanNumber(data.trade_deposit_max) : null;
            const hasJeonse = min !== null || max !== null;
            
            // 조건이 없으면 전세 매물은 통과
            if (!hasJeonse) return true;
            
            // 매물 값 파싱 (NaN 반환 가능)
            const parseNum = (raw: unknown): number => {
                if (raw === null || raw === undefined || raw === "") return NaN;
                const str = String(raw).replace(/,/g, "");
                const num = Number(str);
                return Number.isNaN(num) ? NaN : num;
            };
            
            const num = parseNum(p.data?.trade_deposit);
            
            // 사용자가 범위를 넣었는데 매물 값이 없으면 제외
            if (Number.isNaN(num)) return false;
            
            if (min !== null && num < min) return false;
            if (max !== null && num > max) return false;
            return true;
        }

        // 월세 조건 평가 함수 — 전체 매물 리스트와 동일한 로직
        function matchesMonthlyRent(p: Property): boolean {
            const tradeTypes = Array.isArray(p.data?.trade_types) 
                ? p.data.trade_types 
                : [];
            const isMonthlyItem = tradeTypes.includes("월세");
            
            // 월세 매물이 아니면 월세 분기에서는 false
            if (!isMonthlyItem) return false;
            
            // 월세보증금 체크박스가 체크되어 있지 않으면 false
            // 체크박스가 체크되어 있어야만 필터가 활성화됨
            // 월세 금액은 체크박스가 없으므로 월세보증금 체크박스만 확인
            if (!data.trade_rent_deposit_check) return false;
            
            // 사용자 입력 범위 (null 체크)
            // - 월세보증금: 체크박스가 체크되어 있을 때만 사용
            // - 월세 금액: UI에 체크박스가 없으므로, 값이 있으면 적용 (월세 선택 시 월세 입력란에 입력한 범위)
            const depositMin = (data.trade_rent_deposit_check && data.trade_rent_deposit_min) ? cleanNumber(data.trade_rent_deposit_min) : null;
            const depositMax = (data.trade_rent_deposit_check && data.trade_rent_deposit_max) ? cleanNumber(data.trade_rent_deposit_max) : null;
            const rentMin = data.trade_rent_min ? cleanNumber(data.trade_rent_min) : null;
            const rentMax = data.trade_rent_max ? cleanNumber(data.trade_rent_max) : null;
        
            const hasDep = depositMin !== null || depositMax !== null;
            const hasRent = rentMin !== null || rentMax !== null;
        
            // 월세 관련 조건이 전혀 없으면 월세 매물은 통과 (체크박스는 체크되어 있지만 값이 없는 경우)
            if (!(hasDep || hasRent)) return true;
        
            const d = p.data;
        
            // 매물 엔드포인트 값(콤마 안전 파싱) — NaN 반환 가능
            const parseNum = (raw: unknown): number => {
                if (raw === null || raw === undefined || raw === "") return NaN;
                const str = String(raw).replace(/,/g, "");
                const num = Number(str);
                return Number.isNaN(num) ? NaN : num;
            };
        
            const depMinVal = parseNum(d.trade_rent_deposit);      // 보증금 최소
            const depMaxRaw = parseNum(d.trade_rent_deposit_sub);  // 보증금 최대(없으면 NaN)
            const depMaxVal = Number.isNaN(depMaxRaw) ? depMinVal : depMaxRaw;
        
            const rentAtMin0 = parseNum(d.trade_rent);              // 최소 보증금 시 월세
            const rentAtMin = Number.isNaN(rentAtMin0) ? NaN : rentAtMin0;
            const rentAtMax0 = parseNum(d.trade_rent_sub);          // 최대 보증금 시 월세(없으면 NaN)
            const rentAtMax = Number.isNaN(rentAtMax0) ? rentAtMin : rentAtMax0;
        
            // 엔드포인트 판단 불가(필요값 없음)면 제외
            const endpointsUsable =
                !Number.isNaN(depMinVal) && !Number.isNaN(depMaxVal) &&
                !Number.isNaN(rentAtMin) && !Number.isNaN(rentAtMax);
            if (!endpointsUsable) return false;
        
            const depositSearchRange: [number | null, number | null] = [depositMin, depositMax];
            const rentSearchRange: [number | null, number | null] = [rentMin, rentMax];
        
            const [dMin, dMax] = depositSearchRange;
            const [rMin, rMax] = rentSearchRange;
        
            const comboMatches = (dep: number, rent: number) => {
                const depOk = (!hasDep) || ((dMin == null || dep >= dMin) && (dMax == null || dep <= dMax));
                const rentOk = (!hasRent) || ((rMin == null || rent >= rMin) && (rMax == null || rent <= rMax));
                // 입력된(활성) 조건들을 동시에 만족해야 함
                return depOk && rentOk;
            };
        
            // A: (보증금 최소, 그때 월세), B: (보증금 최대, 그때 월세)
            return (
                comboMatches(depMinVal, depMinVal === depMaxVal ? rentAtMax : rentAtMin) ||
                comboMatches(depMaxVal, rentAtMax)
            );
        }

        // ─────────────────────────────────────────────────────────────────────────────
        // 최종 가격 매칭: 선택된 유형들에 대해 OR(합집합) 처리
        // - 사용자가 거래유형을 선택했다면: 선택된 유형들에 대해 OR(합집합)
        // - 선택이 없다면: 유형별 가드된 AND (기존 UX 유사)
        // ─────────────────────────────────────────────────────────────────────────────
        if (selectedTradeTypes.length > 0) {
            filtered = filtered.filter((p) => {
                const tradeTypes = Array.isArray(p.data?.trade_types) 
                    ? p.data.trade_types 
                    : [];
                const isSaleItem = tradeTypes.includes("매매");
                const isJeonseItem = tradeTypes.includes("전세");
                const isMonthlyItem = tradeTypes.includes("월세");
                
                const selectedTypes = new Set(selectedTradeTypes);
                
                // 선택된 유형과 매물 유형의 교집합만 평가하고, 그 중 하나라도 조건 만족 시 노출
                const orResults: boolean[] = [];
                
                if (selectedTypes.has("매매") && isSaleItem) {
                    orResults.push(matchesSale(p));
                }
                if (selectedTypes.has("전세") && isJeonseItem) {
                    orResults.push(matchesJeonse(p));
                }
                if (selectedTypes.has("월세") && isMonthlyItem) {
                    orResults.push(matchesMonthlyRent(p));
                }
                
                // 교집합이 없으면 가격 기준으로는 매칭되지 않음 (matchTrade에서 걸러질 가능성 큼)
                return orResults.length > 0 ? orResults.some(Boolean) : false;
            });
        } else {
            // 유형 미선택: 해당 유형의 매물일 때만 그 조건을 확인, 해당 유형이 아니면 가격필터는 영향 없음
            filtered = filtered.filter((p) => {
                const tradeTypes = Array.isArray(p.data?.trade_types) 
                    ? p.data.trade_types 
                    : [];
                const isSaleItem = tradeTypes.includes("매매");
                const isJeonseItem = tradeTypes.includes("전세");
                const isMonthlyItem = tradeTypes.includes("월세");
                
                const saleOrIrrelevant = isSaleItem ? matchesSale(p) : true;
                const jeonseOrIrrelevant = isJeonseItem ? matchesJeonse(p) : true;
                const monthlyOrIrrelevant = isMonthlyItem ? matchesMonthlyRent(p) : true;
                
                return saleOrIrrelevant && jeonseOrIrrelevant && monthlyOrIrrelevant;
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

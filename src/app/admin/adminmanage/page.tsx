"use client";

import { Button, Separator } from "@/components/ui";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import { Property } from "@/types";
import { useAuthCheck, useGetPropertyAll, useGetCompanyId } from "@/hooks/apis";
import { Label } from "@radix-ui/react-label";
import { useAtomValue } from "jotai";
import { employeesAtom } from "@/store/atoms";
import AdminPropertyReadCard from "./components/AdminPropertyReadCard";
import { AllListFilterPanel } from "@/app/manage/components/filters";
import { MapPanel, MapPanelRef } from "@/app/manage/components/filters/MapPanel";
// 1회성 백업 기능 - 사용하지 않음 (백업 완료)
// import { backupAllProperties } from "@/utils/backupAllProperties";

import {
    normalizeAddressList,
    normalizeAddressKeyword,
    normalizeSingleAddress,
} from "@/app/manage/components/filters/util/AddressFilter";

function AdminManagePage() {
    const router = useRouter();
    const { propertysAll, getPropertysAll } = useGetPropertyAll();
    const { user } = useAuthCheck();
    const { company } = useGetCompanyId(user);
    const employees = useAtomValue(employeesAtom);

    const [sortKey, setSortKey] = useState<keyof Property>("update_at");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    const [addressSearchKeyword, setAddressSearchKeyword] = useState("");

    const [filterEmployeeId, setFilterEmployeeId] = useState<number | "">("");

    const [filterExpanded, setFilterExpanded] = useState<boolean>(false);

    const [mapExpanded, setMapExpanded] = useState<boolean>(true);

    const mapRef = useRef<MapPanelRef>(null);

    const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([]);
    const [isSelectedFromMap, setIsSelectedFromMap] = useState(false); // 지도에서 선택했는지 여부
    const propertyListRef = useRef<HTMLDivElement>(null); // 매물 리스트 컨테이너 참조

    const handleRegister = () => {
        router.push(`/manage/register`);
    };

    // 1회성 백업 기능 - 사용하지 않음 (백업 완료)
    // const [isBackingUp, setIsBackingUp] = useState(false);

    // const handleBackupAllProperties = async () => {
    //     if (isBackingUp) return;

    //     const confirmed = window.confirm(
    //         "property와 property_delete 테이블의 모든 데이터를 property_backup에 복사합니다.\n\n이 작업은 시간이 걸릴 수 있습니다. 계속하시겠습니까?"
    //     );

    //     if (!confirmed) return;

    //     setIsBackingUp(true);
    //     try {
    //         const result = await backupAllProperties();
            
    //         if (result.success) {
    //             toast({
    //                 title: "백업 완료",
    //                 description: `property ${result.propertyCount}개, property_delete ${result.propertyDeleteCount}개 데이터가 property_backup에 복사되었습니다.`,
    //             });
    //         } else {
    //             toast({
    //                 variant: "destructive",
    //                 title: "백업 실패",
    //                 description: result.error || "알 수 없는 오류가 발생했습니다.",
    //             });
    //         }
    //     } catch (error: any) {
    //         console.error("백업 중 오류:", error);
    //         toast({
    //             variant: "destructive",
    //             title: "백업 실패",
    //             description: error.message || "백업 중 오류가 발생했습니다.",
    //         });
    //     } finally {
    //         setIsBackingUp(false);
    //     }
    // };

    // 1) 타입 분리
    type FilterState = {
        mainTypes: string[];
        subTypes: string[];
        tradeTypes: string[];
        priceRange: {
            trade_price?: [number | null, number | null];
            trade_deposit?: [number | null, number | null];
            trade_rent_deposit?: [number | null, number | null];
            trade_rent?: [number | null, number | null];
            trade_rent_deposit_sub?: [number | null, number | null];
            trade_rent_sub?: [number | null, number | null];
        };
        addressList: string[];
        addressKeyword?: string;
        roomCounts: string[];
        sizeRanges: string[];
        sizeCustom?: [number | null, number | null]; // ✅ 직접 입력 (최소, 최대)
        floorTypes: string[];
        hasParking?: boolean;
        petAllowed?: boolean;
        onBoardedStates? : boolean[];
    };

    // 2) 초기값
    const initialTypeFilter: FilterState = {
        mainTypes: [],
        subTypes: [],
        tradeTypes: [],
        priceRange: {},         // 위의 모든 키가 optional이므로 빈 객체 가능
        addressList: [],
        addressKeyword: "",
        roomCounts: [],
        sizeRanges: [],
        sizeCustom: [null, null],
        floorTypes: [],
        hasParking: undefined,
        petAllowed: undefined,       
        onBoardedStates: [true, false], // ON/OFF 모두 표시
    };
    const [typeFilter, setTypeFilter] = useState<FilterState>(initialTypeFilter);

    const [filterPanelKey, setFilterPanelKey] = useState(0); // ✅ 패널 리셋용

    const handleResetFilters = () => {
        setTypeFilter(initialTypeFilter);      // 조건 초기화
        setAddressSearchKeyword("");           // 주소/건물명 검색어 초기화
        setFilterEmployeeId("");               // 직원 필터 초기화
        setSelectedPropertyIds([]);            // 선택된 카드 초기화
        // setFilterExpanded(false);              // (선택) 패널 닫기
        // setMapExpanded(true);               // (선택) 지도를 펼쳐두고 싶으면

        setFilterPanelKey((k) => k + 1);       // ✅ 패널 재마운트 → 체크/버튼 UI도 초기상태로
        // (선택) 지도도 초기화하고 싶으면 ref로 메서드 노출해 호출
        // mapRef.current?.reset?.();
    };

    const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);

    useEffect(() => {
        if (propertysAll.length === 0) {
            getPropertysAll();
        }
    }, [propertysAll, getPropertysAll]);

    useEffect(() => {
        const filter = () => {
            const keyword = normalizeAddressKeyword(addressSearchKeyword || "");
            const normalizedAddressList = normalizeAddressList(typeFilter.addressList);

            // company_id로 필터링: 같은 company_id를 가진 employee의 매물만 표시
            const companyEmployeeIds = company !== null
                ? employees
                    .filter((emp) => emp.company_id === company)
                    .map((emp) => emp.id)
                    .filter((id): id is number => id !== undefined && id !== null)
                : [];

            const filtered = propertysAll.filter((p) => {
                const d = p.data || {};

                // 소속 부동산 매물만 표시 (company_id가 null이면 매물 표시 안 함)
                const matchCompany = company === null
                    ? false
                    : (p.employee_id !== null && p.employee_id !== undefined
                        ? companyEmployeeIds.includes(p.employee_id)
                        : false);

                // 직원 필터: 선택 시 해당 직원의 매물만 표시
                const matchEmployee =
                    filterEmployeeId === "" ||
                    (p.employee_id != null && p.employee_id === filterEmployeeId);

                const matchMain =
                    typeFilter.mainTypes.length === 0 || typeFilter.mainTypes.includes(d.type);
                const matchSub =
                    typeFilter.subTypes.length === 0 || typeFilter.subTypes.includes(d.estate_use);
                const matchTrade =
                    typeFilter.tradeTypes.length === 0 ||
                    typeFilter.tradeTypes.some((t) => d.trade_types?.includes(t));
                const matchAddressList =
                    normalizedAddressList.length === 0 ||
                    (() => {
                        if (!d.address) return false;
                        const normalizedPropertyAddress = normalizeSingleAddress(d.address);
                        // 필터 주소와 매물 주소 매칭
                        return normalizedAddressList.some((filterAddr) => {
                            // 필터 주소가 시군구만 있는 경우 (예: "서울 송파구")
                            if (filterAddr.split(" ").length === 2) {
                                // 매물 주소가 해당 시군구로 시작하는지 확인
                                return normalizedPropertyAddress.startsWith(filterAddr);
                            }
                            // 필터 주소가 시군구 + 동이 있는 경우 (예: "서울 송파구 신천동")
                            return normalizedPropertyAddress.startsWith(filterAddr);
                        });
                    })();
                const matchKeyword =
                    !keyword ||
                    [
                        d.address,
                        d.address_roadname,
                        d.address_detail,
                        d.complex_name,
                        d.address_dong,
                        d.address_ho,
                    ].some((f) => f?.toLowerCase().includes(keyword.toLowerCase()));

                const matchisRegister = p.is_register === true;

                const matchRoomCount =
                    typeFilter.roomCounts.length === 0 ||
                    typeFilter.roomCounts.some((roomLabel) => {
                        const val = p.data?.structure_room;
                        if (!val) return false;

                        const roomNum = Number(val);
                        if (isNaN(roomNum)) return false;

                        if (roomLabel === "원룸") return roomNum === 1;
                        if (roomLabel === "투룸") return roomNum === 2;
                        if (roomLabel === "쓰리룸") return roomNum === 3;
                        if (roomLabel === "4룸 이상") return roomNum >= 4;

                        return false;
                    });

                const matchSizeRange =
                    // 프리셋/직접입력 아무 것도 없으면 패스
                    (typeFilter.sizeRanges.length === 0 &&
                        (!typeFilter.sizeCustom || (typeFilter.sizeCustom[0] == null && typeFilter.sizeCustom[1] == null)))
                    ||
                    (() => {
                        const raw = p.data?.area_reference;
                        const pyeong = typeof raw === "string" ? parseFloat(raw) : Number(raw);
                        if (isNaN(pyeong)) return false;

                        // 1) 직접 입력 범위가 있으면 우선 적용
                        const [minC, maxC] = typeFilter.sizeCustom ?? [null, null];
                        const hasCustom = minC != null || maxC != null;
                        if (hasCustom) {
                            const minOk = minC == null || pyeong >= minC;
                            const maxOk = maxC == null || pyeong <= maxC;
                            if (!(minOk && maxOk)) return false;
                            // 직접 입력 통과하면 OK (프리셋 선택이 있어도 통과로 간주)
                            return true;
                        }

                        // 2) 프리셋(버튼) 선택이 있으면 기존 로직
                        return typeFilter.sizeRanges.some((label) => {
                            if (label === "0~5") return pyeong <= 5;
                            if (label === "5~10") return pyeong > 5 && pyeong <= 10;
                            if (label === "10~15") return pyeong > 10 && pyeong <= 15;
                            if (label === "15~20") return pyeong > 15 && pyeong <= 20;
                            if (label === "20~25") return pyeong > 20 && pyeong <= 25;
                            if (label === "25~30") return pyeong > 25 && pyeong <= 30;
                            if (label === "30~40") return pyeong > 30 && pyeong <= 40;
                            if (label === "40~50") return pyeong > 40 && pyeong <= 50;
                            if (label === "50~60") return pyeong > 50 && pyeong <= 60;
                            if (label === "60~70") return pyeong > 60 && pyeong <= 70;
                            if (label === "70평 이상") return pyeong > 70;
                            return false;
                        });
                    })();


                const matchFloorType =
                    typeFilter.floorTypes.length === 0 ||
                    (() => {
                        const raw = p.data?.floor_applicable;
                        const floorNum = typeof raw === "string" ? parseInt(raw) : Number(raw);
                        const isSemi = p.data?.floor_semibasement === true;
                        const isRooftop = p.data?.floor_rooftop === true;

                        if (isNaN(floorNum) && !isSemi && !isRooftop) return false;

                        const labels: string[] = [];

                        if (isRooftop) labels.push("옥탑");

                        if (isSemi) {
                            labels.push("반지하");
                            // 반지하인 경우엔 1층/지상으로 간주하지 않음
                        } else {
                            if (floorNum < 0) {
                                labels.push("지하");
                            } else if (floorNum === 0) {
                                labels.push("반지하");
                            } else if (floorNum === 1) {
                                labels.push("1층", "지상"); // 반지하 아닌 1층은 지상 포함
                            } else if (floorNum >= 2) {
                                labels.push("지상");
                            }
                        }

                        return labels.some((label) => typeFilter.floorTypes.includes(label));
                    })();



                const matchParking =
                    typeFilter.hasParking === undefined ||
                    (typeFilter.hasParking === true ? p.data?.parking_available === "가능" : true);

                const matchPet =
                    typeFilter.petAllowed === undefined ||
                    (typeFilter.petAllowed === true ? p.data?.pet_allowed === "가능" : true);
                
                
                const matchOnBoardedStates =
                    !typeFilter.onBoardedStates || // undefined or 전체
                    typeFilter.onBoardedStates.length === 0 ||
                    typeFilter.onBoardedStates.length === 2 || // ON/OFF 모두 선택된 경우
                    typeFilter.onBoardedStates.includes(p.on_board_state?.on_board_state ?? false);

                
                // 안전 숫자 파서 (문자열에 콤마 있을 때도 처리)
                const parseNum = (raw: unknown): number => {
                    if (raw === null || raw === undefined) return NaN;
                    if (typeof raw === "number") return Number.isFinite(raw) ? raw : NaN;
                    if (typeof raw === "string") {
                        const s = raw.replace(/,/g, "").trim();
                        if (s === "") return NaN;
                        const n = Number(s);
                        return Number.isFinite(n) ? n : NaN;
                    }
                    return NaN;
                };

                // 해당 키에 대해 사용자가 범위를 실제로 입력했는지
                const hasActiveRange = (key: keyof typeof typeFilter.priceRange) => {
                    const range = typeFilter.priceRange[key];
                    return !!range && (range[0] !== null || range[1] !== null);
                };

                const priceInRange = (key: keyof typeof typeFilter.priceRange) => {
                    const [min, max] = typeFilter.priceRange[key] ?? [null, null];

                    const num = parseNum(d[key]); // d[key]가 "12,345" 같은 문자열이어도 OK

                    // ❗ 사용자가 범위를 넣었는데 매물 값이 없으면 제외
                    if (Number.isNaN(num)) return hasActiveRange(key) ? false : true;

                    if (min !== null && num < min) return false;
                    if (max !== null && num > max) return false;
                    return true;
                };

                // ─────────────────────────────────────────────────────────────────────────────
                // 거래유형: 매물/사용자 선택 파악
                // ─────────────────────────────────────────────────────────────────────────────
                const tradeTypesOfItem: string[] = Array.isArray(d.trade_types) ? d.trade_types : [];
                const isSaleItem = tradeTypesOfItem.includes("매매");
                const isJeonseItem = tradeTypesOfItem.includes("전세");
                const isMonthlyItem = tradeTypesOfItem.includes("월세");

                const selectedTypes = new Set(typeFilter.tradeTypes); // 사용자가 선택한 거래유형들

                // ─────────────────────────────────────────────────────────────────────────────
                // 매매 / 전세: "그 유형의 매물일 때만" 해당 가격조건 적용
                // ─────────────────────────────────────────────────────────────────────────────
                const hasSale = hasActiveRange("trade_price");
                const hasJeonse = hasActiveRange("trade_deposit");

                // 매물 유형이 매매일 때만 priceInRange 평가, 아니면 그 유형 분기에서는 false
                const saleCond =
                    isSaleItem
                        ? (hasSale ? priceInRange("trade_price") : true)    // 매매 조건이 없으면 매매 매물은 통과
                        : false;

                const jeonseCond =
                    isJeonseItem
                        ? (hasJeonse ? priceInRange("trade_deposit") : true) // 전세 조건이 없으면 전세 매물은 통과
                        : false;

                // ─────────────────────────────────────────────────────────────────────────────
                // 월세: 엔드포인트(최소/최대) 조합 중 하나라도 '동시에' 만족해야 통과 (월세 매물에만 적용)
                // ─────────────────────────────────────────────────────────────────────────────
                const hasDep = hasActiveRange("trade_rent_deposit");
                const hasRent = hasActiveRange("trade_rent");

                const monthlyCond = (() => {
                    if (!isMonthlyItem) return false; // 월세 매물이 아니면 월세 분기에서는 false

                    // 월세 관련 조건이 전혀 없으면 월세 매물은 통과
                    if (!(hasDep || hasRent)) return true;

                    // 사용자 입력 범위
                    const depositSearchRange: [number | null, number | null] = [
                        typeFilter.priceRange.trade_rent_deposit?.[0] ?? null,
                        typeFilter.priceRange.trade_rent_deposit?.[1] ?? null,
                    ];
                    const rentSearchRange: [number | null, number | null] = [
                        typeFilter.priceRange.trade_rent?.[0] ?? null,
                        typeFilter.priceRange.trade_rent?.[1] ?? null,
                    ];

                    // 매물 엔드포인트 값(콤마 안전 파싱)
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
                })();

                // ─────────────────────────────────────────────────────────────────────────────
                // 최종 가격 매칭
                // - 사용자가 거래유형을 선택했다면: 선택된 유형들에 대해 OR(합집합)
                // - 선택이 없다면: 유형별 가드된 AND (기존 UX 유사)
                // ─────────────────────────────────────────────────────────────────────────────
                let matchPrice: boolean;

                if (selectedTypes.size > 0) {
                    // 선택된 유형과 매물 유형의 교집합만 평가하고, 그 중 하나라도 조건 만족 시 노출
                    const orResults: boolean[] = [];
                    if (selectedTypes.has("매매") && isSaleItem) orResults.push(saleCond);
                    if (selectedTypes.has("전세") && isJeonseItem) orResults.push(jeonseCond);
                    if (selectedTypes.has("월세") && isMonthlyItem) orResults.push(monthlyCond);

                    // 교집합이 없으면 가격 기준으로는 매칭되지 않음 (matchTrade에서 걸러질 가능성 큼)
                    matchPrice = orResults.length ? orResults.some(Boolean) : false;
                } else {
                    // 유형 미선택: 해당 유형의 매물일 때만 그 조건을 확인, 해당 유형이 아니면 가격필터는 영향 없음
                    const saleOrIrrelevant = isSaleItem ? saleCond : true;
                    const jeonseOrIrrelevant = isJeonseItem ? jeonseCond : true;
                    const monthlyOrIrrelevant = isMonthlyItem ? monthlyCond : true;

                    matchPrice = saleOrIrrelevant && jeonseOrIrrelevant && monthlyOrIrrelevant;
                }


                return (
                    matchCompany &&
                    matchEmployee &&
                    matchMain &&
                    matchSub &&
                    matchTrade &&
                    matchAddressList &&
                    matchKeyword &&
                    matchPrice &&
                    matchisRegister &&
                    matchRoomCount &&
                    matchSizeRange &&
                    matchFloorType &&
                    matchParking &&
                    matchPet &&
                    matchOnBoardedStates
                );
            });

            setFilteredProperties(filtered);
        };

        filter();
    }, [typeFilter, propertysAll, addressSearchKeyword, company, employees, filterEmployeeId]);

    // 직원 필터 적용 시 "전체" 개수 표시용
    const companyEmployeeIdsForCount = company !== null
        ? employees
            .filter((emp) => emp.company_id === company)
            .map((emp) => emp.id)
            .filter((id): id is number => id != null)
        : [];
    const totalCompanyPropertyCount = propertysAll.filter(
        (p) => p.employee_id != null && companyEmployeeIdsForCount.includes(p.employee_id) && p.is_register === true
    ).length;

    const sortedPropertys = [...filteredProperties].sort((a, b) => {
        // 지도에서 선택한 경우에만 선택된 매물을 최상단으로 이동
        if (isSelectedFromMap) {
            const aIsSelected = selectedPropertyIds.includes(String(a.id));
            const bIsSelected = selectedPropertyIds.includes(String(b.id));

            if (aIsSelected && !bIsSelected) return -1;
            if (!aIsSelected && bIsSelected) return 1;
        }

        // 둘 다 선택되었거나 둘 다 선택되지 않은 경우, 기존 정렬 로직 사용
        const isDateCompatible = (value: unknown): value is string | number | Date => {
            return typeof value === "string" || typeof value === "number" || value instanceof Date;
        };

        const dateA = isDateCompatible(a[sortKey]) ? new Date(a[sortKey]).getTime() : 0;
        const dateB = isDateCompatible(b[sortKey]) ? new Date(b[sortKey]).getTime() : 0;

        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    return (
        <>
            <div className="page__manage__header !pb-2">
                {/* 1행: 페이지 제목 + 새 매물등록 */}
                <div className="flex flex-row justify-between items-center">
                    <div className="flex flex-row justify-between items-start">
                        <Button
                            variant={"outline"}
                            size={"icon"}
                            onClick={() => router.push("/admin/adminmanage")}
                        >
                            <ChevronLeft />
                        </Button>
                        <div className="flex flex-row justify-start items-end gap-3 pl-4">
                            <Label className={"text-3xl font-bold"}>매물 관리</Label>
                            <Label className={"text-lg text-blue-600 font-semibold"}>
                                (매물수 : {filteredProperties.length}개
                                {filterEmployeeId !== "" && ` / 전체 ${totalCompanyPropertyCount}개`}
                                )
                            </Label>
                        </div>
                    </div>
                    <Button
                        variant={"outline"}
                        className={"font-normal text-white bg-blue-600 hover:text-white hover:bg-blue-400"}
                        onClick={handleRegister}
                    >
                        새 매물등록
                    </Button>
                </div>

                <div className="page__manage__header__top mt-1">
                    <div className="flex flex-col gap-4 w-full">

                        {/* 상단 버튼 영역 */}
                        <div className="flex justify-between items-center w-full">
                            <div className="flex items-center gap-2">
                                {/* 검색 조건 버튼 */}
                                <Button
                                    variant="outline"
                                    className="text-sm bg-gray-100 text-gray-800 hover:bg-gray-200 flex items-center gap-2 px-4 py-2"
                                    onClick={() => setFilterExpanded((prev: boolean) => !prev)}
                                >
                                    검색 조건
                                    {filterExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </Button>

                                {/* ✅ 초기화 버튼 */}
                                <Button
                                    variant="outline"
                                    className="text-sm bg-gray-100 text-gray-800 hover:bg-gray-200 px-3 py-2"
                                    onClick={handleResetFilters}
                                >
                                    초기화
                                </Button>

                                {/* 오른쪽: 지도 토글 + 검색창 */}
                                <Button
                                    variant="outline"
                                    className="text-sm bg-gray-100 text-gray-800 hover:bg-gray-200 flex items-center gap-2 px-3 py-2"
                                    onClick={() => setMapExpanded((prev: boolean) => !prev)}
                                >
                                    지도
                                    {mapExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </Button>
                                <input
                                    type="text"
                                    placeholder="주소 또는 건물명 검색"
                                    className="border border-gray-300 rounded px-3 py-2 text-sm w-[220px] focus:outline-none focus:ring-2 focus:ring-blue-300"
                                    value={addressSearchKeyword}
                                    onChange={(e) => setAddressSearchKeyword(e.target.value)}
                                />
                            </div>


                            {/* 정렬 옵션 */}
                            <div className="flex items-center gap-2">
                                <select
                                    value={filterEmployeeId}
                                    onChange={(e) =>
                                        setFilterEmployeeId(e.target.value === "" ? "" : Number(e.target.value))
                                    }
                                    className="border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 min-w-[120px]"
                                    title="직원별 매물 필터"
                                >
                                    <option value="">전체 직원</option>
                                    {employees
                                        .filter((emp) => emp.company_id === company)
                                        .map((emp) => (
                                            <option key={emp.id} value={emp.id}>
                                                {emp.name || emp.kakao_name || `직원 #${emp.id}`}
                                            </option>
                                        ))}
                                </select>
                                <select
                                    value={sortKey}
                                    onChange={(e) => setSortKey(e.target.value as keyof Property)}
                                    className="border border-gray-300 bg-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                >
                                    <option value="update_at">최근 수정일</option>
                                    <option value="create_at">등록일</option>
                                </select>
                                <select
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                                    className="border border-gray-300 bg-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                >
                                    <option value="desc">내림차순</option>
                                    <option value="asc">오름차순</option>
                                </select>
                            </div>
                        </div>

                        {/* 검색 조건 패널 */}
                        <div className={filterExpanded ? "block" : "hidden"}>
                            <AllListFilterPanel
                                key={filterPanelKey}
                                initialFilter={initialTypeFilter}
                                onFilterChange={setTypeFilter} />
                        </div>

                        {/* 지도 패널: 검색 조건 아래, 매물 리스트 위에 표시 */}
                        <div className={mapExpanded ? "block" : "hidden"} style={{ minHeight: "400px", width: "100%" }}>
                            <MapPanel
                                ref={mapRef}
                                mapId="admin-manage-all-list-map"
                                properties={filteredProperties}
                                selectedPropertyIds={selectedPropertyIds}
                                onSelectProperties={(group) => {
                                    const ids = group.map((p) => String(p.id));
                                    setSelectedPropertyIds(ids);
                                    setIsSelectedFromMap(true); // 지도에서 선택했음을 표시
                                    // 매물 리스트 스크롤을 최상단으로 이동
                                    if (propertyListRef.current) {
                                        propertyListRef.current.scrollTop = 0;
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>

            </div>
            <Separator className="-mt-2.5 mb-1" />
            <div className="page__manage__body">
                <div className="flex flex-col w-full items-center justify-start gap-1">
                    {sortedPropertys.length !== 0 ? (
                        <div className="page__manage__body__isData" ref={propertyListRef}>
                            {sortedPropertys.map((property: Property) => (
                                <div
                                    key={property.id}
                                    id={`property-${property.id}`}
                                    className={`mb-2 rounded-md transition-colors ${selectedPropertyIds.includes(String(property.id))
                                        ? "border-blue-500 ring-2 ring-blue-300"
                                        : "border-gray-200"
                                        } border`}
                                    onClick={() => {
                                        // 매물 리스트에서 클릭했을 때는 지도로만 이동
                                        setIsSelectedFromMap(false);
                                        const id = String(property.id);
                                        setSelectedPropertyIds([id]);
                                        mapRef.current?.focusOnProperty(property);
                                    }}
                                >
                                    <AdminPropertyReadCard
                                        property={property}
                                        selected={selectedPropertyIds.includes(String(property.id))}
                                        onRefresh={getPropertysAll}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="page__manage__body__noData">
                            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                                등록된 매물이 없습니다.
                            </h3>
                            <small className="text-sm font-medium leading-none text-[#6d6d6d] mt-3 mb-7">
                                매물등록하기
                            </small>
                            <button onClick={handleRegister}>
                                <Image
                                    src={"/assets/images/button.svg"}
                                    width={74}
                                    height={74}
                                    alt="rounded-button"
                                />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default AdminManagePage;


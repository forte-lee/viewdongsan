"use client";

import { Button } from "@/components/ui";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState, useRef, Suspense } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import Image from "next/image";
import { Property } from "@/types";
import { useAuthCheck, useGetPropertyAll, useGetCompanyId, useCompanyAddressCoords, useApprovedCompaniesCoords } from "@/hooks/apis";
import FranchiseModal from "@/components/common/popup/FranchiseModal";
import { CompanyInfoPanel } from "@/app/components/CompanyInfoPanel";
import type { CompanyMarkerItem } from "@/hooks/kakaomap/useKakaoMap";
import PropertyMainCard from "@/app/manage/components/propertycard/PropertyMainCard";
import { AllListFilterPanel } from "@/app/manage/components/filters";
import { MapPanel, MapPanelRef } from "@/app/manage/components/filters/MapPanel";
import { useAtomValue } from "jotai";
import { employeesAtom, userEmailAtom } from "@/store/atoms";

import {
    normalizeAddressList,
    normalizeAddressKeyword,
    normalizeSingleAddress,
} from "@/app/manage/components/filters/util/AddressFilter";

function InitPage() {
    const router = useRouter();
    const { propertysAll, getPropertysAll } = useGetPropertyAll();

    const [sortKey, setSortKey] = useState<keyof Property>("update_at");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    const { user } = useAuthCheck();
    
    // Employee 확인: 현재 사용자가 employee 테이블에 등록되어 있는지 확인 (UUID 우선, 이메일 폴백)
    const employees = useAtomValue(employeesAtom);
    const userEmail = useAtomValue(userEmailAtom);
    const isRegisteredEmployee = user && (
        (user.id && employees.some((e) => e.supabase_user_id === user.id)) ||
        (userEmail && employees.some((e) => e.kakao_email === userEmail))
    );
    
    // company_id 확인 (UUID 기반)
    const { company } = useGetCompanyId(user);
    const hasCompanyId = company !== null;

    // 지도 노출 승인된 회사 마커 (is_map_visible=true)
    const companyMarkers = useApprovedCompaniesCoords();
    const searchParams = useSearchParams();

    // URL 쿼리 ?company=123 으로 공유 링크 진입 시 해당 회사 패널 자동 표시 (초기 로드 시 1회만)
    const hasAppliedCompanyParam = useRef(false);
    useEffect(() => {
        if (hasAppliedCompanyParam.current || companyMarkers.length === 0) return;

        const companyIdParam = searchParams.get("company");
        if (!companyIdParam) return;

        const companyId = parseInt(companyIdParam, 10);
        if (isNaN(companyId)) return;

        const company = companyMarkers.find((c) => c.id === companyId);
        if (company) {
            hasAppliedCompanyParam.current = true;
            setSelectedCompany(company);
            // 지도 초기화 후 focus (약간 지연)
            requestAnimationFrame(() => {
                mapRef.current?.focusOnCompany?.(company);
            });
        }
    }, [searchParams, companyMarkers]);
    
    // company_id가 null이면 로그인하지 않은 상태와 동일하게 처리
    const shouldShowBlur = !hasCompanyId || !isRegisteredEmployee;

    // 로그인 시 소속 회사 주소를 초기 지도 중심으로 사용
    const companyCoords = useCompanyAddressCoords(company);

    const [addressSearchKeyword, setAddressSearchKeyword] = useState("");

    const [filterExpanded, setFilterExpanded] = useState<boolean>(false);

    const mapRef = useRef<MapPanelRef>(null);

    const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([]);
    const [isSelectedFromMap, setIsSelectedFromMap] = useState(false); // 지도에서 선택했는지 여부
    const [selectedCompany, setSelectedCompany] = useState<CompanyMarkerItem | null>(null);
    const propertyListRef = useRef<HTMLDivElement>(null); // 매물 리스트 컨테이너 참조

    const handleRegister = () => {
        router.push(`/manage/register`);
    };

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
        sizeCustom?: [number | null, number | null];
        floorTypes: string[];
        hasParking?: boolean;
        petAllowed?: boolean;
        onBoardedStates?: boolean[];
    };

    // 2) 초기값
    const initialTypeFilter: FilterState = {
        mainTypes: [],
        subTypes: [],
        tradeTypes: [],
        priceRange: {},
        addressList: [],
        addressKeyword: "",
        roomCounts: [],
        sizeRanges: [],
        sizeCustom: [null, null],
        floorTypes: [],
        hasParking: undefined,
        petAllowed: undefined,
        onBoardedStates: [],
    };
    const [typeFilter, setTypeFilter] = useState<FilterState>(initialTypeFilter);

    const [filterPanelKey, setFilterPanelKey] = useState(0);
    const [franchiseModalOpen, setFranchiseModalOpen] = useState(false);

    const handleResetFilters = () => {
        setTypeFilter(initialTypeFilter);
        setAddressSearchKeyword("");
        setSelectedPropertyIds([]);
        setFilterPanelKey((k) => k + 1);
    };

    const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);

    useEffect(() => {
        if (propertysAll.length === 0) {
            getPropertysAll();
        }
    }, [propertysAll]);


    // 매물 카운트 계산
    // 전체 / 비공개는 전체 등록 매물 기준, 매물수는 필터링된 결과 기준 ON 매물 수
    const totalRegisteredCount = propertysAll.filter((p) => p.is_register === true).length;
    const totalOffCount = propertysAll.filter(
        (p) => p.is_register === true && p.on_board_state?.on_board_state !== true
    ).length;

    const onCount = filteredProperties.filter(
        (p) => p.is_register === true && p.on_board_state?.on_board_state === true
    ).length;

    useEffect(() => {
        const filter = () => {
            const keyword = normalizeAddressKeyword(addressSearchKeyword || "");
            const normalizedAddressList = normalizeAddressList(typeFilter.addressList);

            const filtered = propertysAll.filter((p) => {
                const d = p.data || {};

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
                        return normalizedAddressList.some((filterAddr) => {
                            if (filterAddr.split(" ").length === 2) {
                                return normalizedPropertyAddress.startsWith(filterAddr);
                            }
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
                    (typeFilter.sizeRanges.length === 0 &&
                        (!typeFilter.sizeCustom || (typeFilter.sizeCustom[0] == null && typeFilter.sizeCustom[1] == null)))
                    ||
                    (() => {
                        const raw = p.data?.area_reference;
                        const pyeong = typeof raw === "string" ? parseFloat(raw) : Number(raw);
                        if (isNaN(pyeong)) return false;

                        const [minC, maxC] = typeFilter.sizeCustom ?? [null, null];
                        const hasCustom = minC != null || maxC != null;
                        if (hasCustom) {
                            const minOk = minC == null || pyeong >= minC;
                            const maxOk = maxC == null || pyeong <= maxC;
                            if (!(minOk && maxOk)) return false;
                            return true;
                        }

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
                        } else {
                            if (floorNum < 0) {
                                labels.push("지하");
                            } else if (floorNum === 0) {
                                labels.push("반지하");
                            } else if (floorNum === 1) {
                                labels.push("1층", "지상");
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
                
                // 외부페이지에서는 항상 등록된(ON) 매물만 표시
                const matchOnBoardedStates = p.on_board_state?.on_board_state === true;

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

                const hasActiveRange = (key: keyof typeof typeFilter.priceRange) => {
                    const range = typeFilter.priceRange[key];
                    return !!range && (range[0] !== null || range[1] !== null);
                };

                const priceInRange = (key: keyof typeof typeFilter.priceRange) => {
                    const [min, max] = typeFilter.priceRange[key] ?? [null, null];
                    const num = parseNum(d[key]);
                    if (Number.isNaN(num)) return hasActiveRange(key) ? false : true;
                    if (min !== null && num < min) return false;
                    if (max !== null && num > max) return false;
                    return true;
                };

                const tradeTypesOfItem: string[] = Array.isArray(d.trade_types) ? d.trade_types : [];
                const isSaleItem = tradeTypesOfItem.includes("매매");
                const isJeonseItem = tradeTypesOfItem.includes("전세");
                const isMonthlyItem = tradeTypesOfItem.includes("월세");

                const selectedTypes = new Set(typeFilter.tradeTypes);

                const hasSale = hasActiveRange("trade_price");
                const hasJeonse = hasActiveRange("trade_deposit");

                const saleCond =
                    isSaleItem
                        ? (hasSale ? priceInRange("trade_price") : true)
                        : false;

                const jeonseCond =
                    isJeonseItem
                        ? (hasJeonse ? priceInRange("trade_deposit") : true)
                        : false;

                const hasDep = hasActiveRange("trade_rent_deposit");
                const hasRent = hasActiveRange("trade_rent");

                const monthlyCond = (() => {
                    if (!isMonthlyItem) return false;

                    if (!(hasDep || hasRent)) return true;

                    const depositSearchRange: [number | null, number | null] = [
                        typeFilter.priceRange.trade_rent_deposit?.[0] ?? null,
                        typeFilter.priceRange.trade_rent_deposit?.[1] ?? null,
                    ];
                    const rentSearchRange: [number | null, number | null] = [
                        typeFilter.priceRange.trade_rent?.[0] ?? null,
                        typeFilter.priceRange.trade_rent?.[1] ?? null,
                    ];

                    const depMinVal = parseNum(d.trade_rent_deposit);
                    const depMaxRaw = parseNum(d.trade_rent_deposit_sub);
                    const depMaxVal = Number.isNaN(depMaxRaw) ? depMinVal : depMaxRaw;

                    const rentAtMin0 = parseNum(d.trade_rent);
                    const rentAtMin = Number.isNaN(rentAtMin0) ? NaN : rentAtMin0;
                    const rentAtMax0 = parseNum(d.trade_rent_sub);
                    const rentAtMax = Number.isNaN(rentAtMax0) ? rentAtMin : rentAtMax0;

                    const endpointsUsable =
                        !Number.isNaN(depMinVal) && !Number.isNaN(depMaxVal) &&
                        !Number.isNaN(rentAtMin) && !Number.isNaN(rentAtMax);
                    if (!endpointsUsable) return false;

                    const [dMin, dMax] = depositSearchRange;
                    const [rMin, rMax] = rentSearchRange;

                    const comboMatches = (dep: number, rent: number) => {
                        const depOk = (!hasDep) || ((dMin == null || dep >= dMin) && (dMax == null || dep <= dMax));
                        const rentOk = (!hasRent) || ((rMin == null || rent >= rMin) && (rMax == null || rent <= rMax));
                        return depOk && rentOk;
                    };

                    return (
                        comboMatches(depMinVal, depMinVal === depMaxVal ? rentAtMax : rentAtMin) ||
                        comboMatches(depMaxVal, rentAtMax)
                    );
                })();

                let matchPrice: boolean;

                if (selectedTypes.size > 0) {
                    const orResults: boolean[] = [];
                    if (selectedTypes.has("매매") && isSaleItem) orResults.push(saleCond);
                    if (selectedTypes.has("전세") && isJeonseItem) orResults.push(jeonseCond);
                    if (selectedTypes.has("월세") && isMonthlyItem) orResults.push(monthlyCond);
                    matchPrice = orResults.length ? orResults.some(Boolean) : false;
                } else {
                    const saleOrIrrelevant = isSaleItem ? saleCond : true;
                    const jeonseOrIrrelevant = isJeonseItem ? jeonseCond : true;
                    const monthlyOrIrrelevant = isMonthlyItem ? monthlyCond : true;
                    matchPrice = saleOrIrrelevant && jeonseOrIrrelevant && monthlyOrIrrelevant;
                }

                return (
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
    }, [typeFilter, propertysAll, addressSearchKeyword]);

    const sortedPropertys = [...filteredProperties].sort((a, b) => {
        // 지도에서 선택한 경우에만 선택된 매물을 최상단으로 이동
        if (isSelectedFromMap) {
            const aIsSelected = selectedPropertyIds.includes(String(a.id));
            const bIsSelected = selectedPropertyIds.includes(String(b.id));
            
            if (aIsSelected && !bIsSelected) return -1;
            if (!aIsSelected && bIsSelected) return 1;
        }
        
        // 둘 다 선택되었거나 둘 다 선택되지 않은 경우 기존 정렬 로직 적용
        const isDateCompatible = (value: unknown): value is string | number | Date => {
            return typeof value === "string" || typeof value === "number" || value instanceof Date;
        };

        const dateA = isDateCompatible(a[sortKey]) ? new Date(a[sortKey]).getTime() : 0;
        const dateB = isDateCompatible(b[sortKey]) ? new Date(b[sortKey]).getTime() : 0;

        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    return (
        <>
            <FranchiseModal open={franchiseModalOpen} onOpenChange={setFranchiseModalOpen} />
        <div className="flex flex-col h-screen w-full overflow-hidden">
            {/* 상단 바와 메인 컨텐츠 사이 메뉴 영역 (집토스 스타일) */}
            <div className="flex w-full border-b border-gray-200 bg-white">
                <div className="flex flex-row w-full px-6 py-3 gap-8">
                    <div className="flex-1" />
                    {/* 오른쪽 정렬: 메뉴 항목들 */}
                    <div className="flex items-center gap-8">
                        <div className="flex flex-col justify-center">
                            <span className="text-sm font-bold text-gray-900">매물 내놓기</span>
                            <span className="text-xs text-gray-500">매물 홍보 및 중개 의뢰</span>
                        </div>
                        <div className="flex flex-col justify-center">
                            <span className="text-sm font-bold text-gray-900">매물 문의하기</span>
                            <span className="text-xs text-gray-500">02-566-4944</span>
                        </div>
                        <div className="flex items-center">
                            <Button
                                className="px-4 py-2 text-xs font-semibold bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-full"
                                onClick={() => {
                                    if (!user) {
                                        alert("가맹 문의는 로그인 후 이용 가능합니다.");
                                        return;
                                    }
                                    if (hasCompanyId) {
                                        alert("소속 부동산이 있는 회원은 가맹 문의를 할 수 없습니다.");
                                        return;
                                    }
                                    setFranchiseModalOpen(true);
                                }}
                            >
                                가맹 문의하기
                            </Button>
                        </div>
                        {/* 오른쪽 끝: 매물관리 버튼 */}
                        <div className={`flex items-center ml-8 ${shouldShowBlur ? "opacity-40 blur-sm pointer-events-none" : ""}`}>
                            {user && !shouldShowBlur && (
                                <Button
                                    className="px-6 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded"
                                    onClick={() => router.push("/manage")}
                                >
                                    매물관리
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 메인 콘텐츠 영역: 좌우 분할 (상단 공통 헤더는 CommonHeader 사용) */}
            <div className="flex flex-1 overflow-hidden">
                {/* 좌측: 필터 + 매물 리스트 */}
                <div className="flex flex-col w-[600px] border-r border-gray-200 bg-white overflow-y-auto">
                    {/* 검색바 */}
                    <div className={`p-4 border-b border-gray-200 transition-all duration-300 ${shouldShowBlur || !user ? "opacity-40 blur-sm pointer-events-none" : ""}`}>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Q 건물명, 지하철, 학교, 지역 검색"
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                value={addressSearchKeyword}
                                onChange={(e) => {
                                    if (user && !shouldShowBlur) {
                                        setAddressSearchKeyword(e.target.value);
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (!user || shouldShowBlur) {
                                        e.preventDefault();
                                    }
                                }}
                                onPaste={(e) => {
                                    if (!user || shouldShowBlur) {
                                        e.preventDefault();
                                    }
                                }}
                                disabled={!user || shouldShowBlur}
                                readOnly={!user || shouldShowBlur}
                            />
                        </div>
                    </div>

                    {/* 필터 및 정렬 영역 */}
                    <div className={`p-4 border-b border-gray-200 space-y-3 transition-all duration-300 ${shouldShowBlur || !user ? "opacity-40 blur-sm pointer-events-none" : ""}`}>
                        <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    className="text-sm bg-gray-100 text-gray-800 hover:bg-gray-200 flex items-center gap-2 px-3 py-1.5"
                                    onClick={() => {
                                        if (!shouldShowBlur) {
                                            setFilterExpanded((prev: boolean) => !prev);
                                        }
                                    }}
                                    disabled={!user || shouldShowBlur}
                                >
                                    필터
                                    {filterExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </Button>
                                <Button
                                    variant="outline"
                                    className="text-sm bg-gray-100 text-gray-800 hover:bg-gray-200 px-3 py-1.5"
                                    onClick={() => {
                                        if (!shouldShowBlur) {
                                            handleResetFilters();
                                        }
                                    }}
                                    disabled={!user || shouldShowBlur}
                                >
                                    초기화
                                </Button>
                                <div className="flex flex-col text-xs text-gray-500 leading-snug">
                                    <span>전체 : {totalRegisteredCount}개</span>
                                    <span>매물수 : {onCount}개</span>
                                </div>
                            </div>
                            {/* 정렬 옵션: 전체 매물리스트와 동일 (최근수정일/등록일) */}
                            <div className="flex items-center gap-2">
                                <select
                                    value={sortKey}
                                    onChange={(e) => {
                                        if (user && !shouldShowBlur) {
                                            setSortKey(e.target.value as keyof Property);
                                        }
                                    }}
                                    className="border border-gray-300 bg-white text-sm rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                    disabled={!user || shouldShowBlur}
                                >
                                    <option value="update_at">최근 수정일</option>
                                    <option value="create_at">등록일</option>
                                </select>
                                <select
                                    value={sortOrder}
                                    onChange={(e) => {
                                        if (user && !shouldShowBlur) {
                                            setSortOrder(e.target.value as "asc" | "desc");
                                        }
                                    }}
                                    className="border border-gray-300 bg-white text-sm rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                    disabled={!user || shouldShowBlur}
                                >
                                    <option value="desc">내림차순</option>
                                    <option value="asc">오름차순</option>
                                </select>
                            </div>
                        </div>

                        {/* 필터 패널 */}
                        <div className={`${filterExpanded ? "block border-t border-gray-200 pt-3" : "hidden"} ${shouldShowBlur ? "opacity-40 blur-sm pointer-events-none" : ""}`}>
                            <AllListFilterPanel
                                key={filterPanelKey}
                                initialFilter={typeFilter}
                                onFilterChange={setTypeFilter}
                                hideOnBoardFilter={true}
                            />
                        </div>
                    </div>

                    {/* 매물 리스트 */}
                    <div className="flex-1 relative overflow-y-auto" ref={propertyListRef}>
                        {shouldShowBlur && user && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                                <div className="text-center p-6 bg-white rounded-lg shadow-lg border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">접근 권한이 없습니다</h3>
                                    <p className="text-sm text-gray-600">매물을 보시려면 소속 부동산이 등록된 회원이어야 합니다.</p>
                                </div>
                            </div>
                        )}
                        {sortedPropertys.length !== 0 ? (
                            <div className={`p-2 space-y-2 ${shouldShowBlur ? "blur-sm pointer-events-none select-none" : ""}`}>
                                {sortedPropertys.map((property: Property) => (
                                    <div
                                        key={property.id}
                                        id={`property-${property.id}`}
                                        className={`rounded-lg transition-all cursor-pointer ${
                                            selectedPropertyIds.includes(String(property.id))
                                                ? "ring-2 ring-blue-500 shadow-md"
                                                : "hover:shadow-sm"
                                        }`}
                                        onClick={() => {
                                            if (shouldShowBlur) return;
                                            // 매물 리스트에서 클릭했을 때는 지도로만 이동
                                            setIsSelectedFromMap(false);
                                            const id = String(property.id);
                                            if (selectedPropertyIds.includes(id)) {
                                                setSelectedPropertyIds([]);
                                            } else {
                                                setSelectedPropertyIds([id]);
                                                mapRef.current?.focusOnProperty(property);
                                            }
                                        }}
                                    >
                                        <PropertyMainCard
                                            property={property}
                                            selected={selectedPropertyIds.includes(String(property.id))}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                <h3 className="text-xl font-semibold mb-2">등록된 매물이 없습니다.</h3>
                                <small className="text-sm mb-4">매물등록하기</small>
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

                {/* 우측: 지도 */}
                <div className="flex-1 bg-gray-100 relative">
                    {/* 비공개 매물 수 표시 (전체 기준) */}
                    <div className="absolute top-4 right-4 z-10 px-4 py-2 rounded-md bg-blue-600 text-white text-xs shadow">
                        비공개 매물 : {totalOffCount}개
                    </div>
                    <MapPanel
                        ref={mapRef}
                        mapId="main-page-map"
                        properties={filteredProperties}
                        selectedPropertyIds={selectedPropertyIds}
                        initialCenter={companyCoords}
                        companyMarkers={companyMarkers}
                        onCompanyMarkerClick={(company) => setSelectedCompany(company)}
                        selectedCompanyId={selectedCompany?.id ?? null}
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
                    <CompanyInfoPanel
                        company={selectedCompany}
                        onClose={() => setSelectedCompany(null)}
                    />
                </div>
            </div>
        </div>
        </>
    );
}

export default function InitPageWithSuspense() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh] text-gray-500">불러오는 중…</div>}>
            <InitPage />
        </Suspense>
    );
}

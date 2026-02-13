"use client";

import { Button, Separator } from "@/components/ui";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import { Property } from "@/types";
import { useGetPropertyAll } from "@/hooks/apis";
import { Label } from "@radix-ui/react-label";
import { useAtomValue } from "jotai";
import { employeesAtom } from "@/store/atoms";
import AdminPropertyReadCard from "@/app/admin/adminmanage/components/AdminPropertyReadCard";
import { AllListFilterPanel } from "@/app/manage/components/filters";
import { MapPanel, MapPanelRef } from "@/app/manage/components/filters/MapPanel";
import { useGetCompaniesAll, type Company } from "@/hooks/supabase/company/useGetCompaniesAll";

import {
    normalizeAddressList,
    normalizeAddressKeyword,
    normalizeSingleAddress,
} from "@/app/manage/components/filters/util/AddressFilter";

function SiteAdminPropertiesPage() {
    const router = useRouter();
    const { propertysAll, getPropertysAll } = useGetPropertyAll();
    const { companies } = useGetCompaniesAll();
    const employees = useAtomValue(employeesAtom);

    const [sortKey, setSortKey] = useState<keyof Property>("update_at");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    const [addressSearchKeyword, setAddressSearchKeyword] = useState("");

    const [filterCompanyId, setFilterCompanyId] = useState<number | "">("");

    const [filterExpanded, setFilterExpanded] = useState<boolean>(false);

    const [mapExpanded, setMapExpanded] = useState<boolean>(true);

    const mapRef = useRef<MapPanelRef>(null);

    const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([]);
    const [isSelectedFromMap, setIsSelectedFromMap] = useState(false);
    const propertyListRef = useRef<HTMLDivElement>(null);

    const handleRegister = () => {
        router.push(`/manage/register`);
    };

    type FilterState = {
        mainTypes: string[];
        subTypes: string[];
        tradeTypes: string[];
        priceRange: Record<string, [number | null, number | null] | undefined>;
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
        onBoardedStates: [true, false],
    };
    const [typeFilter, setTypeFilter] = useState<FilterState>(initialTypeFilter);

    const [filterPanelKey, setFilterPanelKey] = useState(0);

    const handleResetFilters = () => {
        setTypeFilter(initialTypeFilter);
        setAddressSearchKeyword("");
        setFilterCompanyId("");
        setSelectedPropertyIds([]);
        setFilterPanelKey((k) => k + 1);
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

            const companyEmployeeIds =
                filterCompanyId !== ""
                    ? employees
                          .filter((e) => e.company_id === filterCompanyId)
                          .map((e) => e.id)
                          .filter((id): id is number => id != null)
                    : null;

            const filtered = propertysAll.filter((p) => {
                const d = p.data || {};

                const matchCompany =
                    companyEmployeeIds === null ||
                    (p.employee_id != null && companyEmployeeIds.includes(p.employee_id));

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
                        (!typeFilter.sizeCustom || (typeFilter.sizeCustom[0] == null && typeFilter.sizeCustom[1] == null))) ||
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
                            if (floorNum < 0) labels.push("지하");
                            else if (floorNum === 0) labels.push("반지하");
                            else if (floorNum === 1) labels.push("1층", "지상");
                            else if (floorNum >= 2) labels.push("지상");
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
                    !typeFilter.onBoardedStates ||
                    typeFilter.onBoardedStates.length === 0 ||
                    typeFilter.onBoardedStates.length === 2 ||
                    typeFilter.onBoardedStates.includes(p.on_board_state?.on_board_state ?? false);

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

                const hasActiveRange = (key: string) => {
                    const range = typeFilter.priceRange[key as keyof typeof typeFilter.priceRange];
                    return !!range && (range[0] !== null || range[1] !== null);
                };

                const priceInRange = (key: string) => {
                    const range = typeFilter.priceRange[key as keyof typeof typeFilter.priceRange] ?? [null, null];
                    const [min, max] = range;
                    const num = parseNum(d[key as keyof typeof d]);
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
                const saleCond = isSaleItem ? (hasSale ? priceInRange("trade_price") : true) : false;
                const jeonseCond = isJeonseItem ? (hasJeonse ? priceInRange("trade_deposit") : true) : false;

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
                    matchCompany &&
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
    }, [typeFilter, propertysAll, addressSearchKeyword, filterCompanyId, employees]);

    const sortedPropertys = [...filteredProperties].sort((a, b) => {
        if (isSelectedFromMap) {
            const aIsSelected = selectedPropertyIds.includes(String(a.id));
            const bIsSelected = selectedPropertyIds.includes(String(b.id));
            if (aIsSelected && !bIsSelected) return -1;
            if (!aIsSelected && bIsSelected) return 1;
        }
        const isDateCompatible = (value: unknown): value is string | number | Date => {
            return typeof value === "string" || typeof value === "number" || value instanceof Date;
        };
        const dateA = isDateCompatible(a[sortKey]) ? new Date(a[sortKey]).getTime() : 0;
        const dateB = isDateCompatible(b[sortKey]) ? new Date(b[sortKey]).getTime() : 0;
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    return (
        <>
            <div className="page__manage__header">
                <div className="flex flex-row justify-between items-center">
                    <div className="flex flex-row justify-between items-start">
                        <Button
                            variant={"outline"}
                            size={"icon"}
                            onClick={() => router.push("/site-admin/properties")}
                        >
                            <ChevronLeft />
                        </Button>
                        <div className="flex flex-row justify-start items-end gap-3 pl-4">
                            <Label className={"text-3xl font-bold"}>전체 매물 관리</Label>
                            <Label className={"text-xl text-gray-500 font-bold"}>(전체 매물리스트)</Label>
                            <Label className={"text-lg text-amber-600 font-semibold"}>
                                (매물수 : {filteredProperties.length}개
                                {filterCompanyId !== "" &&
                                    ` / 전체 ${propertysAll.filter((p) => p.is_register === true).length}개`}
                                )
                            </Label>
                        </div>
                    </div>
                    <Button
                        variant={"outline"}
                        className={"font-normal text-white bg-amber-600 hover:text-white hover:bg-amber-500"}
                        onClick={handleRegister}
                    >
                        새 매물등록
                    </Button>
                </div>

                <div className="page__manage__header__top mt-1">
                    <div className="flex flex-col gap-4 w-full">
                        <div className="flex justify-between items-center w-full">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    className="text-sm bg-gray-100 text-gray-800 hover:bg-gray-200 flex items-center gap-2 px-4 py-2"
                                    onClick={() => setFilterExpanded((prev) => !prev)}
                                >
                                    검색 조건
                                    {filterExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </Button>
                                <Button
                                    variant="outline"
                                    className="text-sm bg-gray-100 text-gray-800 hover:bg-gray-200 px-3 py-2"
                                    onClick={handleResetFilters}
                                >
                                    초기화
                                </Button>
                                <Button
                                    variant="outline"
                                    className="text-sm bg-gray-100 text-gray-800 hover:bg-gray-200 flex items-center gap-2 px-3 py-2"
                                    onClick={() => setMapExpanded((prev) => !prev)}
                                >
                                    지도
                                    {mapExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </Button>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <input
                                    type="text"
                                    placeholder="주소 또는 건물명 검색"
                                    className="border border-gray-300 rounded px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-amber-300"
                                    value={addressSearchKeyword}
                                    onChange={(e) => setAddressSearchKeyword(e.target.value)}
                                />
                                <select
                                    value={sortKey}
                                    onChange={(e) => setSortKey(e.target.value as keyof Property)}
                                    className="border border-gray-300 bg-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300"
                                >
                                    <option value="update_at">최근 수정일</option>
                                    <option value="create_at">등록일</option>
                                </select>
                                <select
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                                    className="border border-gray-300 bg-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300"
                                >
                                    <option value="desc">내림차순</option>
                                    <option value="asc">오름차순</option>
                                </select>
                            </div>
                        </div>

                        <div className={filterExpanded ? "block" : "hidden"}>
                            <div className="flex flex-wrap items-center gap-4 pb-4 border-b border-gray-200 mb-4">
                                <div className="flex items-center gap-2">
                                    <Label className="text-sm font-medium whitespace-nowrap">소속 회사</Label>
                                    <select
                                        value={filterCompanyId}
                                        onChange={(e) =>
                                            setFilterCompanyId(e.target.value === "" ? "" : Number(e.target.value))
                                        }
                                        className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 min-w-[140px]"
                                    >
                                        <option value="">전체</option>
                                        {companies.map((c: Company) => (
                                            <option key={c.id} value={c.id}>
                                                {c.company_name || `회사 #${c.id}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <AllListFilterPanel
                                key={filterPanelKey}
                                initialFilter={initialTypeFilter}
                                onFilterChange={setTypeFilter}
                            />
                        </div>

                        <div className={mapExpanded ? "block" : "hidden"}>
                            <MapPanel
                                ref={mapRef}
                                mapId="site-admin-properties-map"
                                properties={filteredProperties}
                                selectedPropertyIds={selectedPropertyIds}
                                onSelectProperties={(group) => {
                                    const ids = group.map((p) => String(p.id));
                                    setSelectedPropertyIds(ids);
                                    setIsSelectedFromMap(true);
                                    if (propertyListRef.current) {
                                        propertyListRef.current.scrollTop = 0;
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <Separator className="my-1" />
            <div className="page__manage__body">
                <div className="flex flex-col w-full items-center justify-start gap-1">
                    {sortedPropertys.length !== 0 ? (
                        <div className="page__manage__body__isData" ref={propertyListRef}>
                            {sortedPropertys.map((property: Property) => (
                                <div
                                    key={property.id}
                                    id={`property-${property.id}`}
                                    className={`mb-2 rounded-md transition-colors ${
                                        selectedPropertyIds.includes(String(property.id))
                                            ? "border-amber-500 ring-2 ring-amber-300"
                                            : "border-gray-200"
                                    } border`}
                                    onClick={() => {
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

export default SiteAdminPropertiesPage;

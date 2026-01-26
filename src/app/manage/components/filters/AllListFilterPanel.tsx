"use client";

import React, { useEffect, useState, useRef } from "react";
import { PropertyTypeFilter, PropertyTradeTypeFilter, PropertyAddressFilter, PropertyOtherFilter, PropertyOnBoardFilter, PropertyRoomFilter, PropertySizeFilter, PropertyFloorFilter } from "@/app/manage/components/filters";

export interface CombinedFilter {
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
    sizeCustom?: [number | null, number | null]; // ✅ 직접입력
    floorTypes: string[];    
    hasParking?: boolean;
    petAllowed?: boolean;
    onBoardedStates?: boolean[];
}

function AllListFilterPanel({ 
    onFilterChange,
    initialFilter,
    hideOnBoardFilter = false
}: { 
    onFilterChange: (filters: CombinedFilter) => void;
    initialFilter?: CombinedFilter;
    hideOnBoardFilter?: boolean;
}) {
    const [typeFilter, setTypeFilter] = useState<{ mainTypes: string[]; subTypes: string[] }>(
        initialFilter ? { mainTypes: initialFilter.mainTypes, subTypes: initialFilter.subTypes } : { mainTypes: [], subTypes: [] }
    );
    const [tradeTypes, setTradeTypes] = useState<string[]>(initialFilter?.tradeTypes ?? []);
    const [priceRange, setPriceRange] = useState<CombinedFilter["priceRange"]>(initialFilter?.priceRange ?? {});
    const [addressList, setAddressList] = useState<string[]>(initialFilter?.addressList ?? []);
    const [addressKeyword, setAddressKeyword] = useState<string>(initialFilter?.addressKeyword ?? "");
    const [roomCounts, setRoomCounts] = useState<string[]>(initialFilter?.roomCounts ?? []);
    const [sizeRanges, setSizeRanges] = useState<string[]>(initialFilter?.sizeRanges ?? []);
    const [sizeCustom, setSizeCustom] = useState<[number | null, number | null]>(initialFilter?.sizeCustom ?? [null, null]);
    const [floorTypes, setFloorTypes] = useState<string[]>(initialFilter?.floorTypes ?? []);
    const [hasParking, setHasParking] = useState<boolean | undefined>(initialFilter?.hasParking);
    const [petAllowed, setPetAllowed] = useState<boolean | undefined>(initialFilter?.petAllowed);
    const [onBoardedStates, setOnBoardedStates] = useState<boolean[]>(initialFilter?.onBoardedStates ?? [true]);

    // 이전 initialFilter 값을 추적하여 실제 변경 시에만 동기화
    const prevInitialFilterRef = useRef<string>("");
    
    // initialFilter가 변경되면 내부 상태를 동기화 (필터를 닫았다가 다시 열 때 기존 설정 유지)
    useEffect(() => {
        if (initialFilter) {
            // 깊은 비교를 위해 JSON.stringify 사용 (실제 값 변경 감지)
            const currentFilterString = JSON.stringify(initialFilter);
            if (prevInitialFilterRef.current !== currentFilterString) {
                prevInitialFilterRef.current = currentFilterString;
                setTypeFilter({ mainTypes: initialFilter.mainTypes, subTypes: initialFilter.subTypes });
                setTradeTypes(initialFilter.tradeTypes ?? []);
                setPriceRange(initialFilter.priceRange ?? {});
                setAddressList(initialFilter.addressList ?? []);
                setAddressKeyword(initialFilter.addressKeyword ?? "");
                setRoomCounts(initialFilter.roomCounts ?? []);
                setSizeRanges(initialFilter.sizeRanges ?? []);
                setSizeCustom(initialFilter.sizeCustom ?? [null, null]);
                setFloorTypes(initialFilter.floorTypes ?? []);
                setHasParking(initialFilter.hasParking);
                setPetAllowed(initialFilter.petAllowed);
                setOnBoardedStates(initialFilter.onBoardedStates ?? [true]);
            }
        } else {
            prevInitialFilterRef.current = "";
        }
    }, [initialFilter]);

    useEffect(() => {
        onFilterChange({
            mainTypes: typeFilter.mainTypes,
            subTypes: typeFilter.subTypes,
            tradeTypes,
            priceRange,
            addressList,
            addressKeyword,
            roomCounts,
            sizeRanges,
            sizeCustom,                 
            floorTypes,
            hasParking,
            petAllowed,
            onBoardedStates,
        });
    }, [typeFilter, tradeTypes, priceRange, addressList, addressKeyword, roomCounts, sizeRanges, sizeCustom, floorTypes, hasParking, petAllowed, onBoardedStates]);

    return (
        <div className="flex flex-col gap-4">
            <PropertyTypeFilter onFilterChange={setTypeFilter} />
            
            <PropertyTradeTypeFilter
                onChange={({ transactionTypes, priceRange }) => {
                    setTradeTypes(transactionTypes);
                    setPriceRange(priceRange);
                }}
            />
            <PropertyAddressFilter
                selectedAddresses={addressList}
                onChange={setAddressList}
                onKeywordChange={setAddressKeyword}
            />
            <PropertyRoomFilter onFilterChange={setRoomCounts} />

            <PropertySizeFilter
                initialSelected={sizeRanges}
                initialCustom={sizeCustom}
                onFilterChange={(selected, custom) => {
                setSizeRanges(selected);
                setSizeCustom(custom ?? [null, null]);
                }}
            />

            <PropertyFloorFilter onFilterChange={setFloorTypes} />            

            <PropertyOtherFilter
                hasParking={hasParking}
                petAllowed={petAllowed}
                onChange={({ hasParking, petAllowed }) => {
                    setHasParking(hasParking);
                    setPetAllowed(petAllowed);
                }}
            />

            {!hideOnBoardFilter && (
                <PropertyOnBoardFilter
                    onBoardedStates={onBoardedStates}
                    onChange={({ onBoardedStates }) =>
                        setOnBoardedStates(onBoardedStates ?? [true, false])
                    }
                />
            )}
        </div>
    );
}

export { AllListFilterPanel };
"use client";

import React, { useEffect, useState } from "react";
import { PropertyTypeFilter, PropertyTradeTypeFilter, PropertyAddressFilter, PropertyOtherFilter, PropertyOnBoardFilter, PropertyPhoneFilter, PropertyRoomFilter, PropertySizeFilter, PropertyFloorFilter, PropertyPersonalPropertyFilter } from "@/app/manage/components/filters";

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
    sizeCustom?: [number | null, number | null]; 
    floorTypes: string[];    
    hasParking?: boolean;
    petAllowed?: boolean;
    onBoardedStates?: boolean[];
    phoneKeyword?: string;
    isPersonalProperty?: boolean;
}

function MyListFilterPanel({ onFilterChange }: { onFilterChange: (filters: CombinedFilter) => void }) {
    const [typeFilter, setTypeFilter] = useState<{ mainTypes: string[]; subTypes: string[] }>(
        { mainTypes: [], subTypes: [] }
    );
    const [tradeTypes, setTradeTypes] = useState<string[]>([]);
    const [priceRange, setPriceRange] = useState<CombinedFilter["priceRange"]>({});
    const [addressList, setAddressList] = useState<string[]>([]);
    const [addressKeyword, setAddressKeyword] = useState<string>("");
    const [roomCounts, setRoomCounts] = useState<string[]>([]);
    const [sizeRanges, setSizeRanges] = useState<string[]>([]);
    const [sizeCustom, setSizeCustom] = useState<[number | null, number | null]>([null, null]);
    const [floorTypes, setFloorTypes] = useState<string[]>([]);
    const [hasParking, setHasParking] = useState<boolean | undefined>(undefined);
    const [petAllowed, setPetAllowed] = useState<boolean | undefined>(undefined);
    const [onBoardedStates, setOnBoardedStates] = useState<boolean[]>([true, false]);
    const [phoneKeyword, setPhoneKeyword] = useState<string>("");
    const [isPersonalProperty, setIsPersonalProperty] = useState<boolean | undefined>(undefined);


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
            phoneKeyword,
            isPersonalProperty,
        });
    }, [typeFilter, tradeTypes, priceRange, addressList, addressKeyword, roomCounts, sizeRanges, sizeCustom, floorTypes, hasParking, petAllowed, onBoardedStates, phoneKeyword, isPersonalProperty]);

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
            <PropertyOnBoardFilter
                onBoardedStates={onBoardedStates}
                onChange={({ onBoardedStates }) =>
                    setOnBoardedStates(onBoardedStates ?? [true, false])
                }
            />

            <PropertyPersonalPropertyFilter
                isPersonalProperty={isPersonalProperty}
                onChange={({ isPersonalProperty }) =>
                    setIsPersonalProperty(isPersonalProperty)
                }
            />

            <PropertyPhoneFilter
                phoneKeyword={phoneKeyword}
                onChange={setPhoneKeyword}
            />
        </div>
    );
}

export { MyListFilterPanel };
"use client";

import React, { useEffect, useState } from "react";
import { GuestPropertyTypeFilter, GuestTradeTypeFilter, GuestPhoneFilter, GuestMemoFilter } from "@/app/guest/components/filters/";

export interface GuestCombinedFilter {
    types: string[];
    propertys: string[];
    tradeTypes: string[]; 
    phoneKeyword: string;
    memoKeyword: string;
}

function MyGuestListFilterPanel({ onFilterChange }: { onFilterChange: (filters: GuestCombinedFilter) => void }) {
    const [types, setTypes] = useState<string[]>([]);
    const [propertys, setPropertys] = useState<string[]>([]);
    const [tradeTypes, setTradeTypes] = useState<string[]>([]);
    const [phoneKeyword, setPhoneKeyword] = useState<string>("");
    const [memoKeyword, setMemoKeyword] = useState<string>("");

    useEffect(() => {
        onFilterChange({
          types,
          propertys,
          tradeTypes,
          phoneKeyword,
          memoKeyword,
        });
      }, [types, propertys, tradeTypes, phoneKeyword, memoKeyword]);
    
    return (
        <div className="flex flex-col gap-4">
            <GuestPropertyTypeFilter
                onFilterChange={({ types, propertys }) => {
                    setTypes(types);
                    setPropertys(propertys);
                }}
            />
            <GuestTradeTypeFilter 
                selected={tradeTypes} 
                onChange={setTradeTypes} 
            />
            <GuestPhoneFilter
                phoneKeyword={phoneKeyword}
                onChange={setPhoneKeyword}
            />
            <GuestMemoFilter
                memoKeyword={memoKeyword}
                onChange={setMemoKeyword}
            />
        </div>
    );
}

export { MyGuestListFilterPanel };

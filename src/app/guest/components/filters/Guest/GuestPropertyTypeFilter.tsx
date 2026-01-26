"use client";

import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui";
import clsx from "clsx";

const guestPropertyMap: Record<string, string[]> = {
    "주거": ["아파트", "오피스텔", "빌라"],
    "상가/사무실/산업": ["상가", "사무실", "산업"],
    "건물": ["상가주택", "다세대 통", "단독주택(다가구)", "근린생활시설", "중소형빌딩", "대형빌딩", "공장", "창고", "기타"],
    "토지": ["토지"],
};

export interface GuestPropertyTypeFilterProps {
    onFilterChange: (filters: { types: string[]; propertys: string[] }) => void;
}

function GuestPropertyTypeFilter({ onFilterChange }: GuestPropertyTypeFilterProps) {
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [selectedSubTypes, setSelectedSubTypes] = useState<Record<string, string[]>>({});

    // 1차 토글
    const toggleType = (type: string) => {
        setSelectedTypes((prev) =>
            prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
        );

        setSelectedSubTypes((prev) => {
            const updated = { ...prev };
            if (type in updated) delete updated[type];
            return updated;
        });
    };

    // 2차 토글
    const toggleSub = (mainType: string, sub: string) => {
        setSelectedSubTypes((prev) => {
            const current = prev[mainType] ?? [];
            const updated = current.includes(sub)
                ? current.filter((s) => s !== sub)
                : [...current, sub];
            return { ...prev, [mainType]: updated };
        });
    };

    // 외부 전달
    useEffect(() => {
        const flatSubTypes = Object.values(selectedSubTypes).flat();
        onFilterChange({ types: selectedTypes, propertys: flatSubTypes });
    }, [selectedTypes, selectedSubTypes]);

    return (
        <div className="flex flex-col gap-3">
            <Label className="text-xl font-bold">관심 매물 유형</Label>

            {/* 1차 카테고리 */}
            <div className="flex flex-wrap gap-2">
                {Object.keys(guestPropertyMap).map((type) => (
                    <button
                        key={type}
                        onClick={() => toggleType(type)}
                        className={clsx(
                            "px-3 py-1 border rounded-full text-sm",
                            selectedTypes.includes(type)
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-gray-800 border-gray-300"
                        )}
                    >
                        {type}
                    </button>
                ))}
            </div>

            {/* 선택된 1차에 따른 2차 세부 항목 */}
            {selectedTypes.map((mainType) => {
                const subOptions = guestPropertyMap[mainType] || [];
                const selectedSubs = selectedSubTypes[mainType] || [];

                return (
                    <div key={mainType} className="flex flex-col gap-1">
                        <Label className="text-sm font-semibold text-gray-600">{mainType}</Label>
                        <div className="flex flex-wrap gap-2">
                            {subOptions.map((sub) => (
                                <button
                                    key={sub}
                                    onClick={() => toggleSub(mainType, sub)}
                                    className={clsx(
                                        "px-3 py-1 border rounded-full text-sm",
                                        selectedSubs.includes(sub)
                                            ? "bg-blue-600 text-white border-blue-600"
                                            : "bg-white text-gray-800 border-gray-300"
                                    )}
                                >
                                    {sub}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export { GuestPropertyTypeFilter };

"use client";

import React, { useEffect, useState } from "react";
import clsx from "clsx";
import { Label } from "@/components/ui";

const propertyTypeMap: Record<string, string[]> = {
    "아파트": ["아파트", "도시생활주택", "분양권", "기타"],
    "오피스텔": ["오피스텔(주거용)", "오피스텔(사업자)", "분양권", "기타"],
    "공동주택": ["도시생활주택", "분양권", "다세대", "연립", "기타"],
    "단독주택": ["다가구", "다중주택", "단독주택", "근린생활시설", "기타"],
    "상가": ["1종근린생활", "2종근린생활", "업무시설", "대형빌딩", "꼬마빌딩", "의료시설", "공장", "창고", "숙박", "지식산업센터", "기타"],
    "사무실": ["1종근린생활", "2종근린생활", "업무시설", "대형빌딩", "꼬마빌딩", "의료시설", "공장", "창고", "숙박", "지식산업센터", "기타"],
    "산업용": ["1종근린생활", "2종근린생활", "업무시설", "대형빌딩", "꼬마빌딩", "의료시설", "공장", "창고", "숙박", "지식산업센터", "기타"],
    "건물": ["상가주택", "다세대 통", "단독주택(다가구)", "근린생활시설", "중소형빌딩", "대형빌딩", "공장", "창고", "기타"],
    "토지": ["대", "전", "답", "임야", "과수원", "목장용지", "광천지", "염전", "공장용지", "학교용지", "주유소용지", 
        "창고용지", "도로", "철도용지", "제방", "하천", "구거", "유지", "양어장", "수도용지", "공원", "체육용지", "유원지", "종교용지", "사적지", "묘지", "잡종지", "기타"],
};

export interface PropertyTypeFilterProps {
    onFilterChange: (filters: { mainTypes: string[]; subTypes: string[] }) => void;
}

function PropertyTypeFilter({ onFilterChange }: PropertyTypeFilterProps) {
    const [selectedMainTypes, setSelectedMainTypes] = useState<string[]>([]);
    const [selectedSubTypes, setSelectedSubTypes] = useState<Record<string, string[]>>({});

    // 1차 선택 토글
    const toggleMainType = (type: string) => {
        setSelectedMainTypes((prev) =>
            prev.includes(type)
                ? prev.filter((t) => t !== type)
                : [...prev, type]
        );

        // 1차 선택 해제 시 해당 2차 선택도 함께 제거
        setSelectedSubTypes((prev) => {
            const updated = { ...prev };
            if (type in updated) {
                delete updated[type];
            }
            return updated;
        });
    };

    // 2차 선택 토글 (1차 항목별로 따로)
    const toggleSubType = (mainType: string, sub: string) => {
        setSelectedSubTypes((prev) => {
            const current = prev[mainType] ?? [];
            const updated = current.includes(sub)
                ? current.filter((s) => s !== sub)
                : [...current, sub];

            return {
                ...prev,
                [mainType]: updated
            };
        });
    };

    // 선택 값 전달
    useEffect(() => {
        const flattened = Object.values(selectedSubTypes).flat();
        onFilterChange({
            mainTypes: selectedMainTypes,
            subTypes: flattened
        });
    }, [selectedMainTypes, selectedSubTypes]);

    return (
        <div className="flex flex-col gap-3">
            {/* 1차 버튼 */}
            <Label className="text-xl font-bold">매물 종류</Label>
            <div className="flex flex-wrap gap-2 items-center">
                {Object.keys(propertyTypeMap).map((type) => (
                    <button
                        key={type}
                        onClick={() => toggleMainType(type)}
                        className={clsx(
                            "px-3 py-1 border rounded-full text-sm",
                            selectedMainTypes.includes(type)
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-gray-800 border-gray-300"
                        )}
                    >
                        {type}
                    </button>
                ))}
            </div>

            {/* 선택된 1차 항목별 2차 항목 렌더링 */}
            {selectedMainTypes.map((mainType) => {
                const subOptions = propertyTypeMap[mainType] || [];
                const selectedSubs = selectedSubTypes[mainType] || [];

                if (subOptions.length === 0) return null;

                return (
                    <div key={mainType} className="flex flex-col gap-1">
                        <Label className="text-sm font-semibold text-gray-600">
                            {mainType}
                        </Label>
                        <div className="flex flex-wrap gap-2">
                            {subOptions.map((sub) => (
                                <button
                                    key={sub}
                                    onClick={() => toggleSubType(mainType, sub)}
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

export {PropertyTypeFilter};
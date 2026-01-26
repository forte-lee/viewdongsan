"use client";

import React, { useEffect, useState } from "react";
import clsx from "clsx";
import { Label, Button } from "@/components/ui";

export interface PropertySizeFilterProps {
    // selected: 프리셋 선택들, custom?: [최소, 최대] (null 허용)
    onFilterChange: (selected: string[], custom?: [number | null, number | null]) => void;
    initialSelected?: string[];
    initialCustom?: [number | null, number | null];
}

const SIZE_OPTIONS = [
    "0~5", "5~10", "10~15", "15~20", "20~25", "25~30",
    "30~40", "40~50", "50~60", "60~70", "70평 이상"
];

function PropertySizeFilter({
    onFilterChange,
    initialSelected = [],
    initialCustom = [null, null],
}: PropertySizeFilterProps) {
    const [selectedSizes, setSelectedSizes] = useState<string[]>(initialSelected);
    const [minStr, setMinStr] = useState<string>(initialCustom?.[0]?.toString() ?? "");
    const [maxStr, setMaxStr] = useState<string>(initialCustom?.[1]?.toString() ?? "");
    const [customRange, setCustomRange] = useState<[number | null, number | null]>(initialCustom);

    const toggleSize = (size: string) => {
        setSelectedSizes((prev) =>
            prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
        );
    };

    // 프리셋 변경 시 부모에 즉시 반영 (현재 customRange와 함께 전달)
    useEffect(() => {
        onFilterChange(selectedSizes, customRange);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSizes]);

    const applyCustom = () => {
        // 공백 제거 후 비어있으면 null, 아니면 숫자 변환
        const min = minStr.trim() === "" ? null : Number(minStr);
        const max = maxStr.trim() === "" ? null : Number(maxStr);

        // 입력이 있었던 필드만 NaN 검사
        if ((minStr.trim() !== "" && Number.isNaN(min)) ||
            (maxStr.trim() !== "" && Number.isNaN(max))) {
            return; // 잘못된 숫자 입력
        }

        setCustomRange([min, max]);
        onFilterChange(selectedSizes, [min, max]);
    };

    const resetCustom = () => {
        setMinStr("");
        setMaxStr("");
        setCustomRange([null, null]);
        onFilterChange(selectedSizes, [null, null]);
    };


    const onKeyDownEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") applyCustom();
    };

    return (
        <div className="flex flex-col gap-3">
            <Label className="text-xl font-bold">평수</Label>

            {/* 프리셋 버튼들 */}
            <div className="flex flex-wrap gap-2 items-center">
                {SIZE_OPTIONS.map((size) => (
                    <button
                        key={size}
                        type="button"
                        onClick={() => toggleSize(size)}
                        className={clsx(
                            "px-3 py-1 border rounded-full text-sm",
                            selectedSizes.includes(size)
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-gray-800 border-gray-300"
                        )}
                    >
                        {size}
                    </button>
                ))}
            </div>

            {/* 직접 입력 */}
            <div className="flex items-center gap-2 mt-2">
                <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="1"
                    placeholder="최소(평)"
                    className="w-28 border rounded px-2 py-1 text-sm"
                    value={minStr}
                    onChange={(e) => setMinStr(e.target.value)}
                    onKeyDown={onKeyDownEnter}
                />
                <span className="text-sm text-gray-500">~</span>
                <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="1"
                    placeholder="최대(평)"
                    className="w-28 border rounded px-2 py-1 text-sm"
                    value={maxStr}
                    onChange={(e) => setMaxStr(e.target.value)}
                    onKeyDown={onKeyDownEnter}
                />

                <Button
                    type="button"
                    variant="outline"
                    className="px-3 py-1 text-sm"
                    onClick={applyCustom}
                >
                    적용
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    className="px-3 py-1 text-sm"
                    onClick={resetCustom}
                >
                    초기화
                </Button>

                {/* 현재 적용 표시 (선택) */}
                <span className="ml-2 text-xs text-gray-500">
                    {customRange?.[0] != null || customRange?.[1] != null
                        ? `직접입력: ${customRange?.[0] ?? "-"} ~ ${customRange?.[1] ?? "-"} 평`
                        : "직접입력: 없음"}
                </span>
            </div>
        </div>
    );
}

export { PropertySizeFilter };

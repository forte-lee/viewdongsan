import { Button, Checkbox, Label } from "@/components/ui";
import React from "react";
import { Combobox } from "@/components/ui/";

interface Props {
    landUseCheck: boolean;
    landUse: string[];
    onLandUseCheckChange: (landUseCheck: boolean) => void;
    onLandUseToggle: (landUse: string[]) => void;
}

function GuestLandUseSection({ landUseCheck, landUse, onLandUseCheckChange, onLandUseToggle }: Props) {
    // ✅ 용도지역 옵션 목록
    const options = [
        "1종 전용주거", "2종 전용주거", "1종 일반주거", "2종 일반주거", "3종 일반주거", "준주거", "중심 상업",
        "일반 상업", "근린 상업", "유통 상업", "전용 공업", "일반 공업", "준공업", "보전 녹지", "생산 녹지", "자연 녹지",
        "보전 관리", "생산 관리", "계획 관리", "농림", "자연환경보전"
    ];

    const allOptions = ["전체선택", ...options]; // ✅ 전체선택 추가

    // ✅ 선택 변경 핸들러
    const handleSelect = (value: string) => {
        if (value === "전체선택") {
            // ✅ 전체선택 클릭 시 모든 항목 선택/해제
            if (landUse.length === options.length) {
                onLandUseToggle([]); // 전체 해제
            } else {
                onLandUseToggle([...options]); // 전체 선택
            }
        } else {
            // ✅ 개별 선택
            if (landUse.includes(value)) {
                onLandUseToggle(landUse.filter((item) => item !== value)); // 제거
            } else {
                onLandUseToggle([...landUse, value]); // 추가
            }
        }
    };

    return (
        <div className="flex flex-col">
            {/* 용도지역 선택 */}
            <div className="flex flex-row p-1 items-center pt-3">
                <div className="flex flex-col w-[30px]">
                    <Label htmlFor={`estateuse-checkbox`} className="text-xs"></Label>
                    <Checkbox
                        id={`estateuse-checkbox`}
                        checked={landUseCheck}
                        onCheckedChange={() => onLandUseCheckChange(!landUseCheck)}
                    />
                </div>
                <div className="flex flex-col w-[100px]">
                    <Label className="text-base p-1 text-left">용도지역</Label>
                </div>

                <div className="flex flex-col w-[600px]">
                    {/* ✅ Combobox (전체선택 포함) */}
                    <div className="flex w-[300px]">
                        <Combobox
                            options={allOptions} // ✅ "전체선택" 추가
                            selected={landUse.length === options.length ? ["전체선택"] : landUse}
                            onSelect={handleSelect}
                            placeholder="용도지역 선택"
                        />
                    </div>

                    {/* 선택된 값 목록 */}
                    {landUse.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {landUse.map((item) => (
                                <Button
                                    key={item}
                                    variant="outline"
                                    className="text-sm border-gray-300 bg-gray-100 hover:bg-red-200 cursor-pointer px-3 py-1"
                                    onClick={() => onLandUseToggle(landUse.filter((i) => i !== item))}
                                >
                                    {item} ✕
                                </Button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export { GuestLandUseSection };

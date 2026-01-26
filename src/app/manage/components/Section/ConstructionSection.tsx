import React, { useState } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from "date-fns/locale";

import { Button, Label, LabelDatePicker } from "@/components/ui";
import { addYears } from "date-fns";

// 한국어 로캘 등록
registerLocale("ko", ko);

interface ConstructionSectionProps {
    propertytype: string | undefined;    
    construction_standard: string; // 기준일자
    construction_date: Date | undefined; // 선택된 날짜
    onConstructionStandardChange: (construction_standard: string) => void;
    onConstructionDateChange: (construction_date: Date | undefined) => void;
}

function ConstructionSection({
    propertytype,
    construction_standard,
    construction_date,
    onConstructionStandardChange,
    onConstructionDateChange,
}: ConstructionSectionProps) {
    const standards = ["사용승인일", "사용검사일", "준공인가일"];

    // 최대 10년 후 날짜 계산
    const maxFutureDate = addYears(new Date(), 10);
    
    const isBuilding = ["건물", "아파트"].includes(propertytype || "");

    return (
        <div className="flex flex-col p-3">
            {/* 기준일자 버튼 */}
            <div className="flex pb-3">
                <Label className="text-xl font-bold gap-4">건축물일자</Label>
                {isBuilding && (                    
                    <span className="ml-2 px-1.5 py-0.5 rounded bg-red-600 text-white text-sm font-semibold">필수</span>
                )}
            </div>
            <div className="flex flex-row w-full justify-between">
                <div className="flex w-1/2 gap-3 p-2">
                    {standards.map((data) => (
                        <Button
                            key={data}
                            variant="outline"
                            className={`p-5 text-sm border border-gray-300 rounded-md bg-gray-50 hover:bg-blue-100 ${construction_standard === data
                                    ? "bg-blue-500 text-white border-blue-600"
                                    : "text-black"
                                }`}
                            onClick={() => onConstructionStandardChange(data)}
                        >
                            {data}
                        </Button>
                    ))}
                </div>

                {/* 입력 필드와 달력 */}
                <div className="flex w-full gap-3 p-2">
                    <LabelDatePicker label="" value={construction_date} onChange={onConstructionDateChange} />
                </div>
            </div>
        </div>
    );
}

export { ConstructionSection };

import { Button, Label } from '@/components/ui';
import React from 'react'

interface DirectionSectionProps {
    propertytype: string | undefined;
    direction_standard: string;    //기준
    direction_side: string;        //방향
    onDirectionStandardSelect: (direction_standard: string) => void;
    onDirectionSideSelect: (direction_side: string) => void;
}

function DirectionSection({propertytype, direction_standard, direction_side, onDirectionStandardSelect, onDirectionSideSelect }: DirectionSectionProps) {
    const sides = ["동", "서", "남", "북", "남동", "남서", "북동", "북서"];
    
    const standards = (() => {
        switch (propertytype) {
            case "아파트":
                return ["거실기준", "안방기준"];
            case "오피스텔":
                return ["거실기준", "안방기준", "주출입구"];
            case "공동주택(아파트 외)":
                return ["거실기준", "안방기준"];
            case "단독주택(임대)":
                return ["거실기준", "안방기준"];
            case "상업/업무/공업용":
                return ["주출입구"];
            case "건물":
                return ["주출입구"];
            default:
                return [];
        }
    })();

    return (
        <div className="flex-col p-3">
            <div className="flex pb-3">
                <Label className="text-xl font-bold gap-4">방향</Label>
            </div>
            <div className="flex gap-3 p-2">
                {standards.map((data) => (
                    <Button
                        key={data}
                        variant="outline"
                        className={`
                            ${"p-5 text-sm border-solid text-black border-[#ddd] bg-[#f9f9f9] hover:bg-blue-100 cursor-pointer"} 
                            ${direction_standard === data ? "bg-[#007bff] text-white border-[#0056b3] hover:bg-[#007bff] hover:text-white]" : ""
                                }`}
                        onClick={() => onDirectionStandardSelect(data)}
                    >
                        {data}
                    </Button>
                ))}
            </div>
            <div className="flex gap-3 p-2">
                {sides.map((data) => (
                    <Button
                        key={data}
                        variant="outline"
                        className={`
                            ${"p-5 text-sm border-solid text-black border-[#ddd] bg-[#f9f9f9] hover:bg-blue-100 cursor-pointer"} 
                            ${direction_side === data ? "bg-[#007bff] text-white border-[#0056b3] hover:bg-[#007bff] hover:text-white]" : ""
                                }`}
                        onClick={() => onDirectionSideSelect(data)}
                    >
                        {data}
                    </Button>
                ))}
            </div>

        </div>
    )
}

export { DirectionSection }
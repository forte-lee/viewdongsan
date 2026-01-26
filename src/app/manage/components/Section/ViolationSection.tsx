import { Button, Input, Label } from '@/components/ui';
import React from 'react'

interface ViolationSectionProps {
    propertytype: string | undefined;
    violation: string;         //위반사항
    violation_memo: string;         //위반비고

    onViolationChange: (violation: string) => void;
    onViolationMemoChange: (violation_memo: string) => void;
}

function ViolationSection({ propertytype, violation, violation_memo, onViolationChange, onViolationMemoChange }: ViolationSectionProps) {
    const violations = ["위반건축물", "없음"];

    const isOffice = ["상업/업무/공업용", "건물"].includes(propertytype || "")

    return (
        <div className="flex-col p-3">
            <div className="flex pb-3">
                <Label className="text-xl font-bold gap-4">위반사항</Label>
                {isOffice && (
                    <span className="ml-2 px-1.5 py-0.5 rounded bg-red-600 text-white text-sm font-semibold">필수</span>                    
                )}
            </div>

            <div className="flex flex-row w-full justify-between p-3">
                <div className="flex w-1/2 gap-3">
                    {violations.map((data) => (
                        <Button
                            key={data}
                            variant="outline"
                            className={`
                                ${"p-5 text-sm border-solid text-black border-[#ddd] bg-[#f9f9f9] hover:bg-blue-100 cursor-pointer"} 
                                ${violation === data ? "bg-[#007bff] text-white border-[#0056b3] hover:bg-[#007bff] hover:text-white]" : ""
                                }`}
                            onClick={() => onViolationChange(data)}
                        >
                            {data}
                        </Button>
                    ))}
                </div>
                <div className="flex w-1/2 gap-3">
                    <Input
                        className="flex w-full font-bold items-center text-left gap-3 p-4"
                        type="text"
                        placeholder="비고"
                        value={violation_memo}
                        onChange={(e) => onViolationMemoChange(e.target.value)}
                    />
                </div>
            </div>
        </div>
    )
}

export { ViolationSection }
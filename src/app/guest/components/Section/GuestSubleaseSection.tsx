import { Button, Checkbox, Input, Label } from '@/components/ui';
import React from 'react'

interface Props {
    subleaseCheck: boolean;
    subleaseMemo: string;
    subleaseIs: string;
    onSubleaseCheckChange: (subleaseCheck: boolean) => void;
    onSubleaseMemoChange: (subleaseMemo: string) => void;
    onSubleaseIsChange: (subleaseIs: string) => void;
}

function GuestSubleaseSection({ subleaseCheck, subleaseMemo, subleaseIs, onSubleaseCheckChange, onSubleaseMemoChange, onSubleaseIsChange}: Props) {
    const isCar = ["Y", "N"];
       
    return (
        <div className="flex flex-row p-1 items-center pt-3">
            <div className="flex flex-col w-[30px]">                
                <Label
                    htmlFor={`sublease-checkbox`}
                    className="text-xs"
                >
                </Label>
                <Checkbox
                    id={`sublease-checkbox`}
                    checked={subleaseCheck}
                    onCheckedChange={() => onSubleaseCheckChange(!subleaseCheck)}
                />
            </div>
            <div className="flex flex-col w-[100px]">
                <Label className="text-base p-1 text-left">전대여부</Label>
            </div>            
            <div className="flex flex-row w-1/6 items-center space-x-2">
                {isCar.map((data) => (
                    <Button
                        key={data}
                        variant="outline"
                        className={`
                    ${"p-5 text-sm border-solid text-black border-[#ddd] bg-[#f9f9f9] hover:bg-blue-100 cursor-pointer"} 
                    ${subleaseIs === data ? "bg-[#007bff] text-white border-[#0056b3] hover:bg-[#007bff] hover:text-white]" : ""
                            }`}
                        onClick={() => onSubleaseIsChange(data)}
                    >
                        {data}
                    </Button>
                ))}
            </div>
            <div className="flex flex-row w-[150px] gap-3 pr-3 items-center">
                <Input
                    className="w-full text-left"
                    type="text"
                    placeholder="전대수"
                    value={subleaseMemo}
                    onChange={(e) => onSubleaseMemoChange(e.target.value)}
                />
            </div>
        </div>
    )
}

export { GuestSubleaseSection }
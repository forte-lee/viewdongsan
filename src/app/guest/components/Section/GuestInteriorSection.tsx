import { Button, Checkbox, Input, Label } from '@/components/ui';
import React from 'react'

interface Props {
    interiorCheck: boolean;
    interior_: string;
    onInteriorCheckChange: (interiorCheck: boolean) => void;
    onInteriorChange: (interior_: string) => void;
}

function GuestInteriorSection({interiorCheck, interior_, onInteriorCheckChange, onInteriorChange}: Props) {
    const isInterior = ["필요", "필요없음", "직접예정"];    
    
    return (
        <div className="flex flex-row p-1 items-center pt-3">
            <div className="flex flex-col w-[30px]">
                <Label
                    htmlFor={`interior-checkbox`}
                    className="text-xs"                            
                >
                </Label>
                <Checkbox
                    id={`interior-checkbox`}
                    checked={interiorCheck}
                    onCheckedChange={() => onInteriorCheckChange(!interiorCheck)}
                />

            </div>
            <div className="flex flex-col w-[100px]">
                <Label className="text-base p-1 text-left">인테리어</Label>
            </div>            
            <div className="flex flex-row w-1/6 items-center space-x-2 p-1">
                {isInterior.map((data) => (
                    <Button
                        key={data}
                        variant="outline"
                        className={`
                    ${"p-5 text-sm border-solid text-black border-[#ddd] bg-[#f9f9f9] hover:bg-blue-100 cursor-pointer"} 
                    ${interior_ === data ? "bg-[#007bff] text-white border-[#0056b3] hover:bg-[#007bff] hover:text-white]" : ""
                            }`}
                        onClick={() => onInteriorChange(data)}
                    >
                        {data}
                    </Button>
                ))}
            </div>
        </div>
    )
}

export { GuestInteriorSection }
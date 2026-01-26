import { Button, Checkbox, Input, Label } from '@/components/ui';
import React from 'react'

interface Props {
    enterLoadCheck: boolean;
    enterLoad: string;
    onEnterLoadCheckChange:(enterLoadCheck: boolean) => void;
    onEnterLoadChange: (enterLoad: string) => void;
}

function GuestEnterLoadSection({ enterLoadCheck, enterLoad, onEnterLoadCheckChange, onEnterLoadChange}: Props) {
    const isLoad = ["Y", "N", "상관없음"];    
    
    return (
        <div className="flex flex-row p-1 items-center pt-3">
            <div className="flex flex-col w-[30px]">
                <Label
                    htmlFor={`enterload-checkbox`}
                    className="text-xs"                            
                >
                </Label>
                <Checkbox
                    id={`enterload-checkbox`}
                    checked={enterLoadCheck}
                    onCheckedChange={() => onEnterLoadCheckChange(!enterLoadCheck)}
                />
            </div>
            <div className="flex flex-col w-[100px]">
                <Label className="text-base p-1 text-left">진입도로</Label>
            </div>            
            <div className="flex flex-row w-1/6 items-center space-x-2 p-1">
                {isLoad.map((data) => (
                    <Button
                        key={data}
                        variant="outline"
                        className={`
                        ${"p-5 text-sm border-solid text-black border-[#ddd] bg-[#f9f9f9] hover:bg-blue-100 cursor-pointer"} 
                        ${enterLoad === data ? "bg-[#007bff] text-white border-[#0056b3] hover:bg-[#007bff] hover:text-white]" : ""
                            }`}
                        onClick={() => onEnterLoadChange(data)}
                    >
                        {data}
                    </Button>
                ))}
            </div>
        </div>
    )
}

export { GuestEnterLoadSection }
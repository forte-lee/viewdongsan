import { Button, Checkbox, Input, Label } from '@/components/ui';
import React from 'react'

interface Props {
    petCheck: boolean;
    petIsPet: string;
    petMemo: string;
    onPetCheckChange: (petCheck: boolean) => void;
    onPetIsPetChange: (petIsPet: string) => void;
    onPetMemoChange: (petMemo: string) => void;
}

function GuestPetSection({ petCheck, petIsPet, petMemo, onPetCheckChange, onPetIsPetChange, onPetMemoChange}: Props) {
    const isPet = ["Y", "N"];    
    
    return (
        <div className="flex flex-row p-1 items-center pt-3">
            <div className="flex flex-col w-[30px]">
                <Label
                    htmlFor={`pet-checkbox`}
                    className="text-xs"
                >
                </Label>
                <Checkbox
                    id={`pet-checkbox`}
                    checked={petCheck}
                    onCheckedChange={() => onPetCheckChange(!petCheck)}
                />
            </div>
            <div className="flex flex-col w-[100px]">
                <Label className="text-base p-1 text-left">애완</Label>
            </div>            
            <div className="flex flex-row w-1/6 items-center space-x-2">
                {isPet.map((data) => (
                    <Button
                        key={data}
                        variant="outline"
                        className={`
                    ${"p-5 text-sm border-solid text-black border-[#ddd] bg-[#f9f9f9] hover:bg-blue-100 cursor-pointer"} 
                    ${petIsPet === data ? "bg-[#007bff] text-white border-[#0056b3] hover:bg-[#007bff] hover:text-white]" : ""
                            }`}
                        onClick={() => onPetIsPetChange(data)}
                    >
                        {data}
                    </Button>
                ))}
            </div>
            <div className="flex flex-row w-[150px] gap-3 pr-3 items-center">
                <Input
                    className="w-full text-left"
                    type="text"
                    placeholder="종류"
                    value={petMemo}
                    onChange={(e) => onPetMemoChange(e.target.value)}
                />
            </div>
        </div>
    )
}

export { GuestPetSection }
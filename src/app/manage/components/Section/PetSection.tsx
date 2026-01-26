import { Button, Input, Label } from '@/components/ui';
import React from 'react'

interface PetSectionProps{    
    pet_allowed : string;         //가능여부
    pet_condition : string;         //조건

    onPetAllowedChange : (pet_allowed :string) => void;
    onPetConditionCHange : (pet_condition:string) => void;
}

function PetSection({pet_allowed, pet_condition, onPetAllowedChange, onPetConditionCHange}:PetSectionProps) {
    const alloweds = ["가능", "불가", "모름", "협의"];
    return (
        <div className="flex-col p-3">
            <div className="flex pb-3">
                <Label className="text-xl font-bold gap-4">반려동물
                <span className="ml-2 px-1.5 py-0.5 rounded bg-red-600 text-white text-sm font-semibold">필수</span>
                </Label>
            </div>
            <div className="flex flex-row w-full items-center space-x-2">
                <div className="flex flex-row w-1/2 items-center space-x-2 p-1">
                    {alloweds.map((data) => (
                        <Button
                            key={data}
                            variant="outline"
                            className={`
                                ${"p-5 text-sm border-solid text-black border-[#ddd] bg-[#f9f9f9] hover:bg-blue-100 cursor-pointer"} 
                                ${pet_allowed === data ? "bg-[#007bff] text-white border-[#0056b3] hover:bg-[#007bff] hover:text-white]" : ""
                                    }`}
                            onClick={() => onPetAllowedChange(data)}
                        >
                            {data}
                        </Button>
                    ))}
                </div>
                <div className="flex flex-row w-1/2 items-center space-x-2 p-1">
                    <div className="w-full flex gap-3 p-1 items-center">
                    <Label className="text-base w-1/6 text-right">비고</Label>
                    <Input
                        className="w-full font-bold text-left"
                        type="text"
                        placeholder="고양이만 가능"
                        value={pet_condition}
                        onChange={(e) => onPetConditionCHange(e.target.value)}
                    />
                    </div>
                </div>
            </div>
        </div>
    ) 
}

export {PetSection}
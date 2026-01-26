import { Button, Input, Label } from '@/components/ui';
import React from 'react'

interface WaterSectionProps{    
    water_possible : string;         //가능여부
    water_memo : string;         //조건

    onWaterPossibleChange : (water_possible :string) => void;
    onWaterMemoChange : (water_memo:string) => void;
}

function WaterSection({water_possible, water_memo, onWaterPossibleChange, onWaterMemoChange}:WaterSectionProps) {
    const alloweds = ["Y", "N"];
    return (
        <div className="flex-col p-3">
            <div className="flex pb-3">
                <Label className="text-xl font-bold gap-4">수도인입</Label>
            </div>
            <div className="flex flex-row w-full items-center space-x-2">
                <div className="flex flex-row w-1/2 items-center space-x-2 p-1">
                    {alloweds.map((data) => (
                        <Button
                            key={data}
                            variant="outline"
                            className={`
                                ${"p-5 text-sm border-solid text-black border-[#ddd] bg-[#f9f9f9] hover:bg-blue-100 cursor-pointer"} 
                                ${water_possible === data ? "bg-[#007bff] text-white border-[#0056b3] hover:bg-[#007bff] hover:text-white]" : ""
                                    }`}
                            onClick={() => onWaterPossibleChange(data)}
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
                        placeholder="비고란"
                        value={water_memo}
                        onChange={(e) => onWaterMemoChange(e.target.value)}
                    />
                    </div>
                </div>
            </div>
        </div>
    ) 
}

export {WaterSection}
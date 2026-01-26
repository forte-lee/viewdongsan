import { Button, Checkbox, Input, Label } from '@/components/ui';
import React from 'react'

interface Props {
    parkingCheck: boolean;
    parkingNumber: string;
    parkingIsCar: string;
    onParkingCheckChange: (parkingCheck: boolean) => void;
    onParkingNumberChange: (parkingNumber: string) => void;
    onParkingIsCarChange: (parkingIsCar: string) => void;
}

function GuestParkingSection({ parkingCheck, parkingNumber, parkingIsCar, onParkingCheckChange, onParkingNumberChange, onParkingIsCarChange}: Props) {
    const isCar = ["Y", "N"];
       
    return (
        <div className="flex flex-row p-1 items-center pt-3">
            <div className="flex flex-col w-[30px]">                
                <Label
                    htmlFor={`parking-checkbox`}
                    className="text-xs"
                >
                </Label>
                <Checkbox
                    id={`parking-checkbox`}
                    checked={parkingCheck}
                    onCheckedChange={() => onParkingCheckChange(!parkingCheck)}
                />
            </div>
            <div className="flex flex-col w-[100px]">
                <Label className="text-base p-1 text-left">주차</Label>
            </div>            
            <div className="flex flex-row w-1/6 items-center space-x-2">
                {isCar.map((data) => (
                    <Button
                        key={data}
                        variant="outline"
                        className={`
                    ${"p-5 text-sm border-solid text-black border-[#ddd] bg-[#f9f9f9] hover:bg-blue-100 cursor-pointer"} 
                    ${parkingIsCar === data ? "bg-[#007bff] text-white border-[#0056b3] hover:bg-[#007bff] hover:text-white]" : ""
                            }`}
                        onClick={() => onParkingIsCarChange(data)}
                    >
                        {data}
                    </Button>
                ))}
            </div>
            <div className="flex flex-row w-[150px] gap-3 pr-3 items-center">
                <Input
                    className="w-full text-left"
                    type="text"
                    placeholder="주차대수"
                    value={parkingNumber}
                    onChange={(e) => onParkingNumberChange(e.target.value)}
                />
            </div>
        </div>
    )
}

export { GuestParkingSection }
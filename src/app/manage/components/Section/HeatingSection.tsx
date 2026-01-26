import { Button, Label } from '@/components/ui';
import React from 'react'

interface HeatingSectionProps {

    heating_method: string;            //난방방식
    heating_fuel: string;              //난방연료

    onHeatingMethodChange: (heating_method: string) => void;
    onHeatingFuelChange: (heating_fuel: string) => void;
}

function HeatingSection({heating_method, heating_fuel, onHeatingMethodChange, onHeatingFuelChange }: HeatingSectionProps) {
    const methods = ["개별", "중앙", "지역"];
    const fuels = ["도시가스", "열병합", "전기", "기타"];
    return (
        <div className="flex-col p-3">
            <div className="flex pb-3">
                <Label className="text-xl font-bold gap-4">난방</Label>
            </div>
            <div className="flex flex-row w-full items-center p-1">
                <div className="flex flex-row w-full items-center space-x-2 p-1">
                    <Label className="text-base w-1/4 text-left">난방방식</Label>
                    <div className="w-full flex gap-3 p-1">
                        {methods.map((data) => (
                            <Button
                                key={data}
                                variant="outline"
                                className={`
                                    ${"p-5 text-sm border-solid text-black border-[#ddd] bg-[#f9f9f9] hover:bg-blue-100 cursor-pointer"} 
                                    ${heating_method === data ? "bg-[#007bff] text-white border-[#0056b3] hover:bg-[#007bff] hover:text-white]" : ""
                                        }`}
                                onClick={() => onHeatingMethodChange(data)}
                            >
                                {data}
                            </Button>
                        ))}
                    </div>
                </div>     
            </div>       
            <div className="flex flex-row w-full items-center p-1">
                <div className="flex flex-row w-full items-center space-x-2 p-1">
                    <Label className="text-base w-1/4 text-left">난방연료</Label>
                    <div className="w-full flex gap-3 p-1">
                        {fuels.map((data) => (
                            <Button
                                key={data}
                                variant="outline"
                                className={`
                                    ${"p-5 text-sm border-solid text-black border-[#ddd] bg-[#f9f9f9] hover:bg-blue-100 cursor-pointer"} 
                                    ${heating_fuel === data ? "bg-[#007bff] text-white border-[#0056b3] hover:bg-[#007bff] hover:text-white]" : ""
                                        }`}
                                onClick={() => onHeatingFuelChange(data)}
                            >
                                {data}
                            </Button>
                        ))}
                    </div>
                </div>            
            </div>
        </div>
    )
}

export { HeatingSection }
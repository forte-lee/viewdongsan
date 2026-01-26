import { Button, Checkbox, Input, Label } from '@/components/ui';
import React from 'react'

interface Props {
    elevatorCheck: boolean;
    elevator: string;
    onElevatorCheckChange: (elevatorCheck: boolean) => void;
    onElevatorChange: (elevator: string) => void;
}

function GuestElevatorSection({ elevatorCheck, elevator, onElevatorCheckChange, onElevatorChange}: Props) {
    const isElevator = ["Y", "N", "상관없음"];    
    
    return (
        <div className="flex flex-row p-1 items-center pt-3">
            <div className="flex flex-col w-[30px]">
                <Label
                    htmlFor={`elevator-checkbox`}
                    className="text-xs"                            
                >
                </Label>
                <Checkbox
                    id={`elevator-checkbox`}
                    checked={elevatorCheck}
                    onCheckedChange={() => onElevatorCheckChange(!elevatorCheck)}
                />
            </div>
            <div className="flex flex-col w-[100px]">
                <Label className="text-base p-1 text-left">E/V</Label>
            </div>            
            <div className="flex flex-row w-1/6 items-center space-x-2">
                {isElevator.map((data) => (
                    <Button
                        key={data}
                        variant="outline"
                        className={`
                    ${"p-5 text-sm border-solid text-black border-[#ddd] bg-[#f9f9f9] hover:bg-blue-100 cursor-pointer"} 
                    ${elevator === data ? "bg-[#007bff] text-white border-[#0056b3] hover:bg-[#007bff] hover:text-white]" : ""
                            }`}
                        onClick={() => onElevatorChange(data)}
                    >
                        {data}
                    </Button>
                ))}
            </div>
        </div>
    )
}

export { GuestElevatorSection }
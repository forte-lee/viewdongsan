import { Button, Label } from '@/components/ui';
import React from 'react'

interface Props {
    alarm_: string;
    onAlarmChange: (alarm_: string) => void;
}

function GuestAlarmSection({ alarm_, onAlarmChange}: Props) {
    const alarms = ["없음", "1", "2", "3", "5", "7", "14", "30"];    
    
    return (
        <div className="flex flex-row p-1 items-center pt-3">
            <div className="flex flex-col w-[30px]">

            </div>
            <div className="flex flex-col w-[100px]">
                <Label className="text-base p-1 text-left">알림주기</Label>
            </div>            
            <div className="flex flex-row w-1/6 items-center space-x-2">
                {alarms.map((data) => (
                    <Button
                        key={data}
                        variant="outline"
                        className={`
                    ${"p-5 text-sm border-solid text-black border-[#ddd] bg-[#f9f9f9] hover:bg-blue-100 cursor-pointer"} 
                    ${alarm_ === data ? "bg-[#007bff] text-white border-[#0056b3] hover:bg-[#007bff] hover:text-white]" : ""
                            }`}
                        onClick={() => onAlarmChange(data)}
                    >
                        {data}
                    </Button>
                ))}
            </div>
        </div>
    )
}

export { GuestAlarmSection }
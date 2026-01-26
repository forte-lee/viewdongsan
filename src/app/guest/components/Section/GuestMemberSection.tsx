import { Input, Label } from '@/components/ui'
import React from 'react'

interface Props{
    member_Num : string;
    onMemberChange: (member_Num: string) => void;    
}

function GuestMemberSection({member_Num, onMemberChange} : Props) {
    return (
        <div className="flex flex-row p-1 items-center pt-3">
            <div className="flex flex-col w-[30px]">

            </div>
            <div className="flex flex-col w-[100px]">
                <Label className="text-base p-1 text-left">사용인원</Label>
            </div>           
            <div className="flex w-[130px] gap-3 items-center">
                <Input
                    className="w-full text-left"
                    type="text"
                    placeholder="사용인원"
                    value={member_Num}
                    onChange={(e) => onMemberChange(e.target.value)}
                />
            </div>   
        </div>  
    )
}

export { GuestMemberSection }
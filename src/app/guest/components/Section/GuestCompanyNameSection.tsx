import { Input, Label } from '@/components/ui'
import React from 'react'

interface Props{
    companyName : string;
    onCompanyNameChange: (companyName: string) => void;    
}

function GuestCompanyNameSection({companyName, onCompanyNameChange} : Props) {
    return (
        <div className="flex flex-row p-1 items-center pt-3">
            <div className="flex flex-col w-[30px]">

            </div>
            <div className="flex flex-col w-[100px]">
                <Label className="text-base p-1 text-left">상호명</Label>
            </div>           
            <div className="flex w-[130px] gap-3 items-center">
                <Input
                    className="w-full text-left"
                    type="text"
                    placeholder="상호명"
                    value={companyName}
                    onChange={(e) => onCompanyNameChange(e.target.value)}
                />
            </div>   
        </div>  
    )
}

export { GuestCompanyNameSection }
import { Checkbox, Input, Label } from '@/components/ui'
import React from 'react'

interface Props{
    type: string | undefined;
    areaCheck : boolean;
    areaReference : string;
    areaGround : string;
    areaGrossfloor: string;
    onAreaCheckChange: (areaCheck: boolean) => void;
    onAreaReferenceChange: (areaReference: string) => void;    
    onAreaGroundChange: (areaGound: string) => void;
    onAreaGrossfloorChange: (areaGrossfloor: string) => void;
}

function GuestAreaSection({type, areaCheck, areaReference, areaGround, areaGrossfloor, onAreaCheckChange, onAreaReferenceChange, onAreaGroundChange, onAreaGrossfloorChange} : Props) {
    return (
        <div className="flex flex-row p-1 items-center pt-3">
            <div className="flex flex-col w-[30px]">
                <Label
                    htmlFor={`area-checkbox`}
                    className="text-xs"                            
                >
                </Label>
                <Checkbox
                    id={`area-checkbox`}
                    checked={areaCheck}
                    onCheckedChange={() => onAreaCheckChange(!areaCheck)}
                />
            </div>
            <div className="flex flex-col w-[100px]">
                <Label className="text-base p-1 text-left">참고면적</Label>
            </div>            
            {["주거", "상가/사무실/산업"].includes(type || "") && (       
                <div className="flex w-[130px] gap-3 items-center">
                    <Input
                        className="w-full text-left"
                        type="text"
                        placeholder="참고면적"
                        value={areaReference}
                        onChange={(e) => onAreaReferenceChange(e.target.value)}
                    />
                    <Label className="text-base p-1 text-left">평</Label> 
                </div>   
            )}
            
            {type == "건물" && (                
                <div className="flex flex-row p-1 w-[650px] items-center pt-3">
                    <div className="flex flex-row w-[300px] items-center">
                        <div className="flex flex-col w-[100px]">
                            <Label className="text-base p-1 text-center">대지면적</Label>
                        </div>
                        <div className="flex w-[150px] gap-3 items-center">
                            <Input
                                className="w-full text-left"
                                type="text"
                                placeholder=""
                                value={areaGround}
                                onChange={(e) => onAreaGroundChange(e.target.value)}
                            />
                            <Label className="text-base p-1 text-left">평</Label> 
                        </div>      
                    </div>
                    <div className="flex flex-row w-[300px] items-center">
                        <div className="flex flex-col w-[100px]">
                            <Label className="text-base p-1 text-center">연면적</Label>
                        </div>
                        <div className="flex w-[150px] gap-3 items-center">
                            <Input
                                className="w-full text-left"
                                type="text"
                                placeholder=""
                                value={areaGrossfloor}
                                onChange={(e) => onAreaGrossfloorChange(e.target.value)}
                            />
                            <Label className="text-base p-1 text-left">평</Label> 
                        </div>      
                    </div>
                </div>
            )}        
        </div>  
    )
}

export { GuestAreaSection }
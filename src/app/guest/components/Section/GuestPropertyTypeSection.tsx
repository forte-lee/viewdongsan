import { Button, Checkbox, Input, Label, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui';
import React from 'react';

interface Props {
    type: string | undefined;

    propertysCheck: boolean;
    propertys: string[];    
    propertyAllow: string;
    propertyAllowMemo: string;
    onTypeCheckChange: (propertysCheck: boolean) => void;
    onPropertysToggle: (propertys: string) => void;
    onPropertyAllowChange: (propertyAllow: string) => void;
    onPropertyAllowMemoChange: (propertyAllowMemo: string) => void;
}

function GuestPropertyTypeSection({ type, propertysCheck, propertys, propertyAllow, propertyAllowMemo, onTypeCheckChange, onPropertysToggle, onPropertyAllowChange, onPropertyAllowMemoChange }: Props) {
    const propertytypes = (() => {
        switch (type) {
            case "주거":
                return ["아파트", "오피스텔", "빌라"];
            case "상가/사무실/산업":
                return ["상가", "사무실", "산업용"];
            case "건물":
                return ["건물"];
            case "토지":
                return ["토지"];
            default:
                return ["아파트", "오피스텔", "공동주택", "단독주택", "상가", "사무실", "건물", "토지"];
        }
    })();

    const allows = ["필요", "없음"];

    return (
        <TooltipProvider>
            <div className="flex flex-col">
                {/* 용도 선택 */}
                <div className="flex flex-row p-1 items-center pt-3">
                    <div className="flex flex-col w-[30px] items-center">
                        <Label
                            htmlFor={`type-checkbox`}
                            className="text-xs"                            
                        >
                        </Label>
                        <Checkbox
                            id={`type-checkbox`}
                            checked={propertysCheck}
                            onCheckedChange={() => onTypeCheckChange(!propertysCheck)}
                        />
                    </div>
                    <div className="flex flex-col w-[100px]">
                        <Label className="text-base p-1 text-left">매물종류</Label>
                    </div>
                    <div className="grid grid-cols-5 w-[600px] gap-3">
                        {propertytypes.map((property) => (
                            <Tooltip key={property}>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={`
                                            p-5 text-sm border-solid text-black border-[#ddd] bg-[#f9f9f9] hover:bg-blue-100 cursor-pointer
                                            ${propertys.includes(property) ? "bg-[#007bff] text-white border-[#0056b3] hover:bg-[#007bff] hover:text-white]" : ""}
                                        `}
                                        onClick={() => onPropertysToggle(property)}
                                    >
                                        {/* 텍스트 길면 ... 처리 */}
                                        <span className="truncate max-w-[80px] inline-block">{property}</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {property}
                                </TooltipContent>
                            </Tooltip>
                        ))}
                    </div>
                </div>

                {/* 허가 선택 (주거일 경우 숨김) */}
                {type !== "주거" && (
                    <div className="flex flex-row p-1 items-center pt-3">
                        <div className="flex flex-col w-[30px]"></div>
                        <div className="flex flex-col w-[100px]">
                            <Label className="text-base p-1 text-left">허가업종</Label>
                        </div>
                        <div className="flex flex-row w-[200px] gap-3 items-center">
                            {allows.map((allow) => (
                                <Tooltip key={allow}>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={`
                                                p-5 text-sm border-solid text-black border-[#ddd] bg-[#f9f9f9] hover:bg-blue-100 cursor-pointer
                                                ${propertyAllow === allow ? "bg-[#007bff] text-white border-[#0056b3] hover:bg-[#007bff] hover:text-white]" : ""}
                                            `}
                                            onClick={() => onPropertyAllowChange(allow)}
                                        >
                                            {allow}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {allow}
                                    </TooltipContent>
                                </Tooltip>
                            ))}                            
                        </div>
                        <div className="flex flex-row w-[200px] gap-3">
                            <Input
                                    className="w-[150px] text-left"
                                    type="text"
                                    placeholder="업종"
                                    value={propertyAllowMemo}
                                    onChange={(e) => onPropertyAllowMemoChange(e.target.value)}
                                />
                        </div>
                    </div>                    
                )}
            </div>
        </TooltipProvider>
    );
}

export { GuestPropertyTypeSection };

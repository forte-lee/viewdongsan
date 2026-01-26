import { RequiredMark } from '@/components/common/etc/RequiredMark';
import { Checkbox, Input, Label } from '@/components/ui';
import React from 'react'

interface FloorSectionProps {
    propertytype: string | undefined;
    floor_applicable: string;      //해당층
    floor_level: string;           //층수레벨 (고/중/저)
    floor_top: string;             //지상층
    floor_underground: string;     //지하층
    floor_semibasement: boolean;     //반지하
    floor_rooftop: boolean;         //옥탑
    onFloorApplicableChange: (floor_applicable: string) => void;
    onFloorLevelChange: (floor_level: string) => void;
    onFloorTopChange: (floor_top: string) => void;
    onFloorUndergroundChange: (floor_underground: string) => void;
    onFloorSemibasementChange: (floor_semibasement: boolean) => void;
    onFloorRooftopChange: (floor_rooftop: boolean) => void;
}

function FloorSection({propertytype, floor_applicable, floor_level, floor_top, floor_underground, floor_semibasement, floor_rooftop,
    onFloorApplicableChange, onFloorLevelChange, onFloorTopChange, onFloorUndergroundChange, onFloorSemibasementChange, onFloorRooftopChange
}: FloorSectionProps) {    
    const isBuilding = ["건물"].includes(propertytype || "");
    const isNotSemiBasement = ["아파트", "오피스텔"].includes(propertytype || "");

    // 총층 지상 검증 함수
    const validateFloorTop = () => {
        const floorTopNum = Number(floor_top);
        const floorApplicableNum = Number(floor_applicable);
        
        // 해당층이 있고 숫자로 변환 가능한 경우에만 검증
        if (floor_applicable && !isNaN(floorApplicableNum) && !isNaN(floorTopNum)) {
            if (floorTopNum < floorApplicableNum) {
                alert(`총층 지상(${floor_top}층)은 해당층(${floor_applicable}층)보다 크거나 같아야 합니다.\n자동으로 ${floor_applicable}층으로 수정합니다.`);
                // 자동으로 해당층 값으로 수정
                onFloorTopChange(floor_applicable);
            }
        }
    };

    // 해당층 검증 함수
    const validateFloorApplicable = () => {
        const floorTopNum = Number(floor_top);
        const floorApplicableNum = Number(floor_applicable);
        
        // 총층 지상이 있고 숫자로 변환 가능한 경우에만 검증
        if (floor_top && !isNaN(floorTopNum) && !isNaN(floorApplicableNum)) {
            if (floorApplicableNum > floorTopNum) {
                alert(`해당층(${floor_applicable}층)은 총층 지상(${floor_top}층)보다 크거나 같을 수 없습니다.\n자동으로 ${floor_top}층으로 수정합니다.`);
                // 자동으로 총층 지상 값으로 수정
                onFloorApplicableChange(floor_top);
            }
        }
    };
    return (
        <div className="flex-col p-3">
            <div className="flex pb-3">
                <Label className="text-xl font-bold gap-4">층</Label>
                <span className="ml-2 px-1.5 py-0.5 rounded bg-red-600 text-white text-sm font-semibold">필수</span>
            </div>

            <div className="flex flex-row w-full items-center">
                {!isBuilding && (
                    <div className="flex flex-row w-full items-center">  
                        <div className="flex flex-row w-1/2 items-center space-x-2 p-1">    
                            <Label className="text-base w-1/3 text-left">해당층<RequiredMark/>
                            </Label>
                            <Input 
                                className="w-1/3 font-bold text-right" 
                                type="text" 
                                placeholder="5"
                                value={floor_applicable} 
                                onChange={(e) => onFloorApplicableChange(e.target.value)}
                                onBlur={validateFloorApplicable}
                                />
                            <Label className="text-base w-1/12 text-left">층</Label>                                                      
                        </div>       
                        {!isNotSemiBasement && (                            
                            <div className="flex flex-col w-1/2 items-start p-1">    
                                <div className="flex flex-row w-1/2 items-center space-x-2 p-1">
                                    <Checkbox
                                            id={`self-checkbox`}
                                            checked={floor_semibasement}
                                            onCheckedChange={() => onFloorSemibasementChange(!floor_semibasement)}
                                        />
                                    <Label htmlFor={`self-checkbox`} className="text-base">반지하</Label>
                                </div>
                                <div className="flex flex-row w-1/2 items-center space-x-2 p-1">
                                    <Checkbox
                                            id={`self-checkbox`}
                                            checked={floor_rooftop}
                                            onCheckedChange={() => onFloorRooftopChange(!floor_rooftop)}
                                        />
                                    <Label htmlFor={`self-checkbox`} className="text-base">옥탑</Label>
                                </div>
                            </div>
                        )}
                        {/* 층수 레벨 선택 (고/중/저) - 아파트, 오피스텔만 */}
                        {isNotSemiBasement && (
                                <div className="flex flex-row items-center space-x-10 ml-[1rem]">
                                    {(["저", "중", "고"] as const).map((level) => (
                                        <div key={level} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`floor-level-${level}`}
                                                checked={floor_level === level}
                                                onCheckedChange={(checked) => {
                                                    // 라디오 버튼처럼 동작: 하나만 선택
                                                    if (checked) {
                                                        onFloorLevelChange(level);
                                                    } else if (floor_level === level) {
                                                        // 현재 선택된 것을 해제하면 빈 문자열
                                                        onFloorLevelChange("");
                                                    }
                                                }}
                                            />
                                            <Label 
                                                htmlFor={`floor-level-${level}`} 
                                                className="text-sm cursor-pointer"
                                            >
                                                {level}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            )}  
                    </div>                    
                )}
            </div>
            <div className="flex flex-row w-full items-center">                           
                <div className="flex flex-row w-1/6 space-x-2 p-1">   
                    <Label className="text-base text-left">총층<RequiredMark/></Label>   
                </div>    
                <div className="flex flex-row w-5/6 space-x-2 p-1">
                    <div className="flex flex-row w-1/3 items-center">  
                        <Label className="text-base w-1/6 text-left">지상</Label>
                        <Input 
                            className="w-1/2 font-bold text-right" 
                            type="text" 
                            placeholder="10"
                            value={floor_top} 
                            onChange={(e) => onFloorTopChange(e.target.value)}
                            onBlur={validateFloorTop}
                            />          
                        <Label className="w-1/6 text-base text-center">층</Label>
                    </div>
                    <div className="flex flex-row w-1/6 items-center">
                        <Label className="text-base text-center">/</Label>
                    </div>

                    <div className="flex flex-row w-1/3 items-center">    
                        <Label className="text-base w-1/6 text-left">지하</Label>
                        <Input 
                            className="w-1/2 font-bold text-right" 
                            type="text" 
                            placeholder="2"
                            value={floor_underground} 
                            onChange={(e) => onFloorUndergroundChange(e.target.value)}
                            />
                        <Label className="w-1/6 text-base text-center">층</Label>
                    </div>
                </div>                    
            </div>
        </div>
    )
}

export { FloorSection }
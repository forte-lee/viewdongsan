import { RequiredMark } from '@/components/common/etc/RequiredMark';
import { Button, Input, Label } from '@/components/ui';
import React from 'react'

interface EvaluationSectionProps {
    evaluation: string;            //평가
    evaluation_star: string;       //평가점수

    onEvaluationChange: (evaluation: string) => void;
    onEvaluationStarChange: (evaluation_star: string) => void;
}

function EvaluationSection({ evaluation, evaluation_star, onEvaluationChange, onEvaluationStarChange }: EvaluationSectionProps) {
    const stars = ["1", "2", "3", "4", "5"];

    return (
        <div className="flex-col p-3">
            <div className="flex pb-3">
                <Label className="text-xl font-bold gap-4">평가                    
                <span className="ml-2 px-1.5 py-0.5 rounded bg-red-600 text-white text-sm font-semibold">필수</span>
                </Label>
            </div>
            <div className="flex flex-col w-full items-start p-1">
                <div className="flex flex-row w-1/2 items-center p-1">
                    <Label className="text-base w-1/3 text-left">한 줄 평</Label>
                    <Input 
                        className="w-full font-bold text-left" 
                        type="text" 
                        placeholder="*외부에 노출됩니다. 영화 한 줄 평 처럼*" 
                        value={evaluation}
                        onChange={(e) => onEvaluationChange(e.target.value)}
                        />
                </div>
                <div className="flex flex-row w-full items-start p-1 gap-4">
                    <div className="flex flex-row items-center w-1/2">
                        <Label className="text-base w-1/3 text-left">별점</Label>
                        <div className="flex gap-3 p-1 items-center">
                            {stars.map((data) => (
                                <Button
                                    variant="outline"
                                    key={data}
                                    className={`
                                            ${"p-5 text-sm border-solid text-black border-[#ddd] bg-[#f9f9f9] hover:bg-blue-200 cursor-pointer"} 
                                            ${evaluation_star === data ? "bg-[#007bff] text-white border-[#0056b3] hover:bg-[#007bff] hover:text-white]" : ""
                                        }`}
                                    onClick={() => onEvaluationStarChange(data)}
                                >
                                    {data}
                                </Button>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1 bg-gray-50 border border-gray-200 rounded-md p-3 text-xs text-gray-700">
                        <div className="font-semibold mb-2 text-gray-800">별점 선택 기준</div>
                        <div className="space-y-1">
                            <div><span className="font-medium">외부</span> (외관, 주변환경, 주차) / <span className="font-medium">내부</span> (호실, 뷰)</div>
                            <div className="mt-2 space-y-0.5">
                                <div><span className="font-medium">1개</span> - 외,내부 상태 최악</div>
                                <div><span className="font-medium">2개</span> - 외,내부 상태 부족</div>
                                <div><span className="font-medium">3개</span> - 외,내부 상태 노멀</div>
                                <div><span className="font-medium">4개</span> - 외,내부 중 한 부분이라도 아쉬운 경우</div>
                                <div><span className="font-medium">5개</span> - 외,내부 상태 최상</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export { EvaluationSection }
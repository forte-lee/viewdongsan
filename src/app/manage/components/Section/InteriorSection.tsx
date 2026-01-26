import { Button, Input, Label } from '@/components/ui';
import React from 'react'

interface InteriorSectionProps {
    interior: string;         //인테리어
    interior_memo: string;         //인테리어 비고

    onInteriorChange: (interior: string) => void;
    onInteriorMemoChange: (interior_memo: string) => void;
}

function InteriorSection({ interior, interior_memo, onInteriorChange, onInteriorMemoChange }: InteriorSectionProps) {
    const interiors = ["Y", "N"];
    return (
        <div className="flex-col p-3">
            <div className="flex pb-3">
                <Label className="text-xl font-bold gap-4">인테리어</Label>
            </div>

            <div className="flex flex-row w-full justify-between p-3">
                <div className="flex w-1/2 gap-3">
                    {interiors.map((data) => (
                        <Button
                            key={data}
                            variant="outline"
                            className={`
                                ${"p-5 text-sm border-solid text-black border-[#ddd] bg-[#f9f9f9] hover:bg-blue-100 cursor-pointer"} 
                                ${interior === data ? "bg-[#007bff] text-white border-[#0056b3] hover:bg-[#007bff] hover:text-white]" : ""
                                }`}
                            onClick={() => onInteriorChange(data)}
                        >
                            {data}
                        </Button>
                    ))}
                </div>
                <div className="flex w-1/2 gap-3">
                    <Input
                        className="flex w-full font-bold items-center text-left gap-3 p-4"
                        type="text"
                        placeholder="비고"
                        value={interior_memo}
                        onChange={(e) => onInteriorMemoChange(e.target.value)}
                    />
                </div>
            </div>
        </div>
    )
}

export { InteriorSection }
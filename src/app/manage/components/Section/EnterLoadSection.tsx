import { Button, Input, Label } from '@/components/ui';
import React from 'react'

interface EnterLoadSectionProps {
    enterload: string;         //진입도로
    enterload_memo: string;         //진입도로 비고

    onEnterLoadChange: (enterload: string) => void;
    onEnterLoadMemoChange: (enterload_memo: string) => void;
}

function EnterLoadSection({ enterload, enterload_memo, onEnterLoadChange, onEnterLoadMemoChange }: EnterLoadSectionProps) {
    const enterloads = ["있음", "없음"];
    return (
        <div className="flex-col p-3">
            <div className="flex pb-3">
                <Label className="text-xl font-bold gap-4">진입도로</Label>
                <span className="ml-2 px-1.5 py-0.5 rounded bg-red-600 text-white text-sm font-semibold">필수</span>
            </div>

            <div className="flex flex-row w-full justify-between p-3">
                <div className="flex w-1/2 gap-3">
                    {enterloads.map((data) => (
                        <Button
                            key={data}
                            variant="outline"
                            className={`
                                ${"p-5 text-sm border-solid text-black border-[#ddd] bg-[#f9f9f9] hover:bg-blue-100 cursor-pointer"} 
                                ${enterload === data ? "bg-[#007bff] text-white border-[#0056b3] hover:bg-[#007bff] hover:text-white]" : ""
                                }`}
                            onClick={() => onEnterLoadChange(data)}
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
                        value={enterload_memo}
                        onChange={(e) => onEnterLoadMemoChange(e.target.value)}
                    />
                </div>
            </div>
        </div>
    )
}

export { EnterLoadSection }
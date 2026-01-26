"use client"

import { Input, Label, Textarea } from '@/components/ui'
import React, { useEffect, useRef } from 'react'

interface Props{
    extraMemo : string;
    onExtraMemoChange: (extraMemo: string) => void;    
}

function GuestMemoSection({extraMemo, onExtraMemoChange} : Props) {    
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    // 입력 내용에 따라 자동으로 높이 조절
    useEffect(() => {
        if (textAreaRef.current) {
            textAreaRef.current.style.height = "auto"; // 높이 초기화
            textAreaRef.current.style.height = textAreaRef.current.scrollHeight + "px"; // 내용에 맞게 높이 조절
        }
    }, [extraMemo]);

    return (
        <div className="flex flex-row p-1 items-center pt-3">
            <div className="flex flex-col w-[30px]">

            </div>
            <div className="flex flex-col w-[100px]">
                <Label className="text-base p-1 text-left">메모</Label>
            </div>
            <div className="flex w-[600px] gap-3 items-center">
                {/* 자동 높이 조절이 되는 shadcn-ui Textarea */}
                <Textarea
                    ref={textAreaRef}
                    className="w-full text-left p-2 border border-gray-300 rounded-md resize-none overflow-hidden"
                    placeholder="비고"
                    value={extraMemo}
                    onChange={(e) => onExtraMemoChange(e.target.value)}
                    rows={1} // 최소 한 줄
                />
            </div>            
        </div>
    )
}

export { GuestMemoSection }
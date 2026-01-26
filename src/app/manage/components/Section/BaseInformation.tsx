import { Input, Label, Textarea } from '@/components/ui';
import React, { useEffect, useRef } from 'react'

interface BaseInformationProps {
    baseInformation : string;
    onBaseInformationChange: (baseInformation: string) => void;
}

function BaseInformation({baseInformation, onBaseInformationChange}: BaseInformationProps) {
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    // 입력 내용에 따라 자동으로 높이 조절
    useEffect(() => {
        if (textAreaRef.current) {
            textAreaRef.current.style.height = "auto"; // 높이를 초기화한 후 다시 설정
            textAreaRef.current.style.height = textAreaRef.current.scrollHeight + "px"; // 실제 내용에 맞게 높이 조절
        }
    }, [baseInformation]);

    return (
        <div className="flex-col p-3">
            <div className="flex pb-3">
                <Label className="text-xl font-bold gap-4">기초정보 비고</Label>
            </div>
            {/* 자동 높이 조절이 되는 textarea */}
            <Textarea
                ref={textAreaRef}
                className="w-full font-bold text-left p-2 border border-gray-300 rounded-md resize-none overflow-hidden"
                placeholder="-"
                value={baseInformation}
                onChange={(e) => onBaseInformationChange(e.target.value || "-")}
                rows={1} // 최소 한 줄
            />
        </div>
    )
}

export { BaseInformation }
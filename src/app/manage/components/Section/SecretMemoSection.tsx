import { Label, Textarea } from "@/components/ui";
import React, { useRef, useEffect } from "react";

interface SecretMemoSectionProps {
    secret_memo: string; // 비공개 메모
    onSecretMemoChange: (secret_memo: string) => void;
}

function SecretMemoSection({ secret_memo, onSecretMemoChange }: SecretMemoSectionProps) {
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    // 입력 내용에 따라 자동으로 높이 조절
    useEffect(() => {
        if (textAreaRef.current) {
            textAreaRef.current.style.height = "auto"; // 높이 초기화
            textAreaRef.current.style.height = textAreaRef.current.scrollHeight + "px"; // 내용에 맞게 높이 조절
        }
    }, [secret_memo]);

    return (
        <div className="flex-col p-3">
            {/* 제목 */}
            <div className="flex pb-3">
                <Label className="text-xl font-bold gap-4">비공개 메모</Label>
            </div>

            {/* 자동 높이 조절이 되는 shadcn-ui Textarea */}
            <Textarea
                ref={textAreaRef}
                className="w-full font-bold text-left p-2 border border-gray-300 rounded-md resize-none overflow-hidden"
                placeholder="비공개 메모 입력"
                value={secret_memo}
                onChange={(e) => onSecretMemoChange(e.target.value)}
                rows={1} // 최소 한 줄
            />
        </div>
    );
}

export { SecretMemoSection };

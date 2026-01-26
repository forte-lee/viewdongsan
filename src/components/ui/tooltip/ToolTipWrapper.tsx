"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/";

interface Props {
    text: string | string[];
    maxLength?: number;
}

export default function TooltipWrapper({ text, maxLength = 20 }: Props) {
    if (!text) return <span>-</span>;

    const displayText = Array.isArray(text) ? text.join("\n") : text;

    return (
        <TooltipProvider>
            <Tooltip>
                {/* ✅ 내부 요소가 <button>이 아니라 <div> 사용하여 중첩 방지 */}
                <TooltipTrigger asChild>
                    <div role="button" tabIndex={0} className="truncate w-full max-w-[150px] overflow-hidden cursor-pointer">
                        {displayText.length > maxLength ? `${displayText.substring(0, maxLength)}...` : displayText}
                    </div>
                </TooltipTrigger>

                {displayText.length > maxLength && (
                    <TooltipContent className="bg-gray-800 text-white p-2 rounded-md whitespace-pre-wrap text-left">
                        {displayText}
                    </TooltipContent>
                )}
            </Tooltip>
        </TooltipProvider>
    );
}

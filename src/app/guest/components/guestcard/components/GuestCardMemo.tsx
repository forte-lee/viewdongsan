"use client";

import { useState, useRef, useEffect } from "react";
import { Button, Textarea, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui";
import { Guest } from "@/types";
import { supabase } from "@/utils/supabase/client";
import { useAtom } from "jotai";
import { guestsAtom } from "@/store/atoms";
import { useCreateGuestProperty } from "@/hooks/apis";

interface GuestCardMemoProps {
    guest: Guest;
}

function GuestCardMemo({ guest }: GuestCardMemoProps) {
    const [secretMemo, setSecretMemo] = useState(guest.data.memo || "");
    const [isEditing, setIsEditing] = useState(false);
    // const [showTooltip, setShowTooltip] = useState(false); // TODO: 툴팁 기능 구현 시 사용
    // const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 }); // TODO: 툴팁 기능 구현 시 사용
    const [, setGuests] = useAtom(guestsAtom);
    const [isExpanded, setIsExpanded] = useState(false);
    const createGuestProperty = useCreateGuestProperty();

    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // 자동 높이 조절
    useEffect(() => {
        if (textAreaRef.current) {
            textAreaRef.current.style.height = "auto";
            textAreaRef.current.style.height = textAreaRef.current.scrollHeight + "px";
        }
    }, [secretMemo]);

    // 메모 저장
    const updateSecretMemo = async () => {
        const { error } = await supabase
            .from("guest")
            .update({
                data: {
                    ...(guest.data || {}), // ✅ 안전하게 기존 필드 유지
                    memo: secretMemo,      // ✅ memo만 덮어쓰기
                },
            })
            .eq("id", guest.id);

        if (!error) {
            // ✅ Jotai 상태 갱신
            setGuests((prev) =>
                prev.map((g) =>
                    g.id === guest.id
                        ? { ...g, data: { ...(g.data || {}), memo: secretMemo } }
                        : g
                )
            );
        } else {
            console.error("메모 업데이트 실패:", error.message);
        }
    };


    const handleEditToggle = () => {
        if (isEditing) updateSecretMemo();
        setIsEditing(!isEditing);
    };

    // 툴팁 위치 계산 (container 기준) - TODO: 툴팁 기능 구현 시 사용
    // const handleMouseEnter = () => {
    //     if (!isEditing && containerRef.current) {
    //         const rect = containerRef.current.getBoundingClientRect();
    //         setTooltipPos({ x: rect.left, y: rect.top });
    //         setShowTooltip(true);
    //     }
    // };

    // const handleMouseLeave = () => {
    //     setShowTooltip(false);
    // };

    
    // ✅ + 버튼 드롭다운 토글
    const toggleDropdown = () => {
        setIsExpanded((prev) => !prev);
    };

    // ✅ 매물 타입 선택 시 등록 + 팝업 열기
    const handleTypeClick = async (type: string) => {
        if (!guest.id) {
            alert("손님 ID가 없습니다.");
            return;
        }

        try {
            await createGuestProperty(type, guest.id);
        } catch (error) {
            console.error("매물 등록 중 오류 발생:", error);
            alert("매물 등록 중 문제가 발생했습니다.");
        }
    };

    return (
        <div
            ref={containerRef}
            className="flex flex-row w-[650px] items-start justify-start mt-1 relative"
        >
            {/* ✅ 매물 추가 버튼 */}
            <div className="flex flex-col w-[60px] items-center justify-center">
                <div className="flex flex-col item-center justify-center">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    className={"h-[33px] w-[60px] bg-blue-600 text-white text-xs hover:bg-blue-300 hover:text-white"}
                                    variant={"outline"}
                                    onClick={() => toggleDropdown()}
                                >
                                    매물추가
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-gray-800 text-white p-2 rounded-md whitespace-pre-wrap">
                                {"매물추가"}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>

                {/* ✅ 드롭다운 */}
                {isExpanded && (
                    <div className="absolute top-full left-0 mt-1 flex flex-col z-50 bg-white shadow-lg border rounded-md p-1 gap-1">
                        {["주거", "상가/사무실/산업", "건물", "토지"].map((type) => (
                            <Button
                                variant={"outline"}
                                key={type}
                                className="text-xs text-white bg-blue-600 hover:bg-blue-400 hover:text-white px-2 py-1"
                                onClick={() => handleTypeClick(type)}
                            >
                                {type}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
            {/* 메모 표시 영역 */}
            <div className="flex w-[495px] pl-2">
                {isEditing ? (
                    <Textarea
                        ref={textAreaRef}
                        className="flex w-[500px] font-bold text-left p-2 border text-gray-500 border-gray-300 rounded-md resize-none overflow-hidden whitespace-pre-wrap break-all"
                        placeholder="메모를 입력하세요."
                        value={secretMemo}
                        onChange={(e) => setSecretMemo(e.target.value)}
                        rows={1}
                    />
                ) : (
                    <div
                        className="flex w-[500px] min-h-[32px] max-h-[37px] overflow-hidden text-gray-700 text-xs pl-1 pb-1 bg-gray-100 border border-gray-300 rounded-md cursor-default items-start whitespace-pre-line break-all line-clamp-2"
                        title={secretMemo}
                    >
                        {secretMemo || "메모를 입력하세요."}
                    </div>
                )}
            </div>

            {/* 편집 버튼 */}
            <Button
                variant={"outline"}
                className="flex text-xs w-10 h-6 ml-2"
                onClick={handleEditToggle}
            >
                {isEditing ? "완료" : "편집"}
            </Button>
        </div>
    );
}

export { GuestCardMemo };

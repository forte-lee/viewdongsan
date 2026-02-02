"use client";

import { useAuth } from "@/app/context/AuthContext";
import { Button, Label, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui";
import { Guest } from "@/types";
import { useState, useMemo } from "react";
import { DeleteGuestPopup } from "../../../../../components/common/popup/DeleteGuestPopup";
import { useUpdateGuest, useToggleGuestAlarm } from "@/hooks/apis";
import { useAtomValue } from "jotai";
import { guestPropertysAtom, guestNewPropertiesAtom } from "@/store/atoms";

interface Props {
    guest: Guest;
    onDelete: (propertyId: number) => void;
}

function GuestCardHeader({ guest, onDelete }: Props) {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const updateGuest = useUpdateGuest();
    const { toggleGuestAlarm } = useToggleGuestAlarm();

    const [isManagement, setIsManagement] = useState(guest.management ?? false);

    // ⭐ 전체 guestproperty
    const allGuestProperties = useAtomValue(guestPropertysAtom);

    // ⭐ NEW 매물 전체 (guestproperty_id → [property_id…])
    const guestNewMap = useAtomValue(guestNewPropertiesAtom);

    // ⭐ 현재 손님의 NEW 여부 판단
    const hasNew = useMemo(() => {
        const gpList = allGuestProperties.filter(p => p.guest_id === guest.id);

        // ✅ NEW 여부 체크: 알림이 ON이고 배열이 존재하고 길이가 0보다 커야 함
        return gpList.some(gp => {
            if (gp.alarm !== true) return false; // 알림이 OFF면 NEW 아님
            const newPropertyIds = guestNewMap[gp.id];
            return newPropertyIds && newPropertyIds.length > 0;
        });
    }, [allGuestProperties, guestNewMap, guest.id]);

    // 🔹 관리 손님 ON/OFF
    const toggleManagement = async () => {
        if (!user) {
            alert("로그인이 필요합니다.");
            return;
        }

        setIsLoading(true);
        const newValue = !isManagement;
        const newDate = new Date();

        try {
            await updateGuest(
                guest.id,
                "management",
                newValue,
                "update_at",
                newDate
            );

            setIsManagement(newValue);

            // guestproperty 알림 전체를 토글
            await toggleGuestAlarm(guest.id, newValue);

        } catch (error) {
            console.error("추천 상태 업데이트 실패:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // 🔹 손님 등록/수정 팝업
    const handleRegister = (guest: Guest) => {
        const detailPageURL = `/guest/register/${guest.id}/guest`;
        const popupWidth = 800;
        const popupHeight = 500;
        const left = (window.screen.width - popupWidth) / 2;
        const top = (window.screen.height - popupHeight) / 2;

        window.open(
            detailPageURL,
            "GuestPopup",
            `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=no,scrollbars=yes`
        );
    };

    return (
        <div className="flex flex-row w-[150px] items-center">
            {/* 손님 ID + 관리 토글 */}
            <div className="flex flex-col w-[45px] justify-center items-center">
                <div className="flex flex-row">                                   
                    {/* 🔴 NEW 배지 표시 */}
                    <div className="flex">
                        {hasNew && (
                            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
                                N
                            </span>
                        )}
                    </div>
                </div>
                
                <Label className="flex p-1 text-xs text-center">{`${guest.id}`}</Label>

                <TooltipProvider delayDuration={800}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant={"outline"}
                                disabled={isLoading}
                                onClick={toggleManagement}
                                className={`flex w-[25px] h-[25px] text-xs transition-colors ${isManagement
                                        ? "bg-green-500 text-white hover:bg-green-400"
                                        : "bg-gray-500 text-white hover:bg-gray-400"
                                    }`}
                            >
                                {isLoading ? "..." : isManagement ? "On" : "Off"}
                            </Button>
                        </TooltipTrigger>

                        <TooltipContent className="bg-gray-800 text-white p-2 rounded-md whitespace-pre-wrap">
                            {"On : 관리손님 활성화\nOff : 관리손님 해제"}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            {/* 손님 이름/전화번호 */}
            <div className="flex flex-col max-w-[90px] min-w-[90px] items-start pl-1"> 
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>                            
                            <Button
                                className="max-w-[90px] min-w-[90px] h-[30px]"
                                variant={"ghost"}
                                onClick={() => handleRegister(guest)}
                            >
                                <Label className="flex max-w-[90px] min-w-[90px] font-bold text-sm text-left truncate">
                                    {guest.data.name}
                                </Label>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-gray-800 text-white p-2 rounded-md whitespace-pre-wrap">
                            {guest.data.name || "이름없음"}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <Label className="flex max-w-[90px] min-w-[90px] text-xs text-left">
                    {guest.data.phone}
                </Label>

                {/* 수정/삭제 */}
                <div className="flex flex-row p-1">
                    <Button
                        variant="ghost"
                        className="h-[25px] w-[30px] text-xs"
                        onClick={() => handleRegister(guest)}
                    >
                        수정
                    </Button>

                    <DeleteGuestPopup Id={guest.id} onDelete={() => onDelete(guest.id)}>
                        <Button
                            variant="ghost"
                            className="h-[25px] w-[30px] font-normal text-rose-600 hover:bg-red-50 text-xs"
                        >
                            삭제
                        </Button>
                    </DeleteGuestPopup>
                </div>
            </div>
        </div>
    );
}

export { GuestCardHeader };

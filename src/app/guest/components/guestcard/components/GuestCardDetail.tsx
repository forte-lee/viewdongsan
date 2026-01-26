"use client";

import {
    Button,
    Textarea,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
    Table,
    TableBody,
    TableCell,
    TableRow,
} from "@/components/ui";
import { Guest, GuestProperty } from "@/types";
import TooltipWrapper from "@/components/ui/tooltip/ToolTipWrapper";
import { useEffect, useRef, useState } from "react";
import { DeleteGuestPropertyPopup } from "../../../../../components/common/popup/DeleteGuestPropertyPopup";
import { supabase } from "@/utils/supabase/client";
import { GuestCardPriceInfo } from "./GuestCardPriceInfo";
import { GuestCardInformations } from "./GuestCardInformations";
import { useAtomValue, useSetAtom } from "jotai";
import { guestPropertysAtom, guestNewPropertiesAtom } from "@/store/atoms";
import { useToggleGuestPropertyAlarm, useLoadGuestNewProperties } from "@/hooks/apis";
import { BellRing, BellOff } from "lucide-react";

interface Props {
    guest: Guest;
}

function GuestCardDetail({ guest }: Props) {
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const { togglePropertyAlarm } = useToggleGuestPropertyAlarm();

    // 전체 GuestProperty 리스트
    const guestPropertys = useAtomValue(guestPropertysAtom);
    const setGuestPropertys = useSetAtom(guestPropertysAtom);

    // NEW 상태 (Realtime + Popup-recommendPage 에서 동시에 갱신)
    const guestNewMap = useAtomValue(guestNewPropertiesAtom);    

    // 현재 guest에 해당하는 매물
    const guestProperty = guestPropertys.filter((p) => p.guest_id === guest.id);

    // 메모 관련
    const [editMemoId, setEditMemoId] = useState<number | null>(null);
    const [memoInput, setMemoInput] = useState<string>("");
    const [selectedProperty, setSelectedProperty] = useState<GuestProperty | null>(null);

    const popupRef = useRef<Window | null>(null);
    
    const loadGuestNewProperties = useLoadGuestNewProperties();

    /** 🔥 Popup → 부모창으로 전달된 메시지 반영 */
    useEffect(() => {
        const handler = (event: MessageEvent) => {
            if (event.data?.type === "MARK_NEW_READ") {
                loadGuestNewProperties();

                // 전역 jotai 상태 자동 갱신됨 (RootLayout에서 이미 처리)
                // 여기서는 별도 setGuestNewMap 호출 없음!
            } 
        };

        window.addEventListener("message", handler);
        return () => window.removeEventListener("message", handler);
    }, []);


    // 🔥 NEW 여부는 guestNewMap ONLY 사용
    // → Supabase에서 직접 조회하면 안 됨(중복·깜빡임 발생 원인!)

    const handleOpenRecommendPopup = (property: GuestProperty) => {
        const popupWidth = 930;
        const popupHeight = 800;
        const left = (window.screen.width - popupWidth) / 2;
        const top = (window.screen.height - popupHeight) / 2;

        const url = `/guest/recommend/${property.id}`;

        if (popupRef.current && !popupRef.current.closed) {
            popupRef.current.focus();
            popupRef.current.location.href = url;
            return;
        }

        const popup = window.open(
            url,
            "GuestRecommendPopup",
            `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=no,scrollbars=yes`
        );

        if (!popup) {
            alert("팝업 차단이 되어 있을 수 있습니다.");
            return;
        }

        popupRef.current = popup;
    };

    const handleRegister = (property: GuestProperty) => {
        let detailPageURL = "";
        switch (property.type) {
            case "주거":
                detailPageURL = `/guest/register/${property.id}/house`; break;
            case "상가/사무실/산업":
                detailPageURL = `/guest/register/${property.id}/office`; break;
            case "건물":
                detailPageURL = `/guest/register/${property.id}/building`; break;
            case "토지":
                detailPageURL = `/guest/register/${property.id}/land`; break;
        }

        const popupWidth = 800;
        const popupHeight = 900;
        const left = (window.screen.width - popupWidth) / 2;
        const top = (window.screen.height - popupHeight) / 2;

        if (popupRef.current && !popupRef.current.closed) {
            popupRef.current.focus();
            popupRef.current.location.href = detailPageURL;
            return;
        }

        const popup = window.open(
            detailPageURL,
            "GuestRegisterPopup",
            `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=no,scrollbars=yes`
        );

        if (!popup) {
            alert("팝업 차단이 되어 있을 수 있습니다.");
            return;
        }

        popupRef.current = popup;
    };

    const handleRowClick = (e: React.MouseEvent, property: GuestProperty) => {
        const target = e.target as HTMLElement;
        if (target.closest("button") || target.closest("textarea") || target.closest("[data-ignore-row-click]")) {
            return;
        }

        handleOpenRecommendPopup(property);
    };

    const handleEditMemo = (property: GuestProperty) => {
        if (editMemoId === property.id) {
            setEditMemoId(null);
            setSelectedProperty(null);
        } else {
            setEditMemoId(property.id);
            setMemoInput(property.data.extra_memo || "");
            setSelectedProperty(property);
        }
    };

    useEffect(() => {
        if (textAreaRef.current) {
            textAreaRef.current.style.height = "auto";
            textAreaRef.current.style.height = textAreaRef.current.scrollHeight + "px";
        }
    }, [memoInput]);

    const handleSaveMemo = async () => {
        if (!selectedProperty) return;

        const updatedData = {
            ...selectedProperty.data,
            extra_memo: memoInput,
        };

        const { error } = await supabase
            .from("guestproperty")
            .update({ data: updatedData })
            .eq("id", selectedProperty.id);

        if (error) {
            console.error("⚠️ 메모 업데이트 오류:", error);
            return;
        }

        setGuestPropertys((prev) =>
            prev.map((p) =>
                p.id === selectedProperty.id ? { ...p, data: updatedData } : p
            )
        );

        setEditMemoId(null);
        setSelectedProperty(null);
    };

    const handleDelete = (propertyId: number) => {
        setGuestPropertys((prev) => prev.filter((p) => p.id !== propertyId));
    };

    return (
        <div className="flex flex-col w-full bg-white rounded-md items-center">
            <div>
                <Table className="w-full border-collapse">
                    <TableBody>
                        {guestProperty.length > 0 ? (
                            guestProperty.map((property) => {
                                // ✅ NEW 여부 체크: 알림이 ON이고 배열이 존재하고 길이가 0보다 커야 함
                                const newPropertyIds = guestNewMap[property.id];
                                const isNew = property.alarm === true && newPropertyIds && newPropertyIds.length > 0;
                                return (
                                    <TableRow
                                        key={property.id}
                                        onClick={(e) => handleRowClick(e, property)}
                                        className="hover:bg-blue-50 w-[800px] h-[30px] cursor-pointer"
                                    >
                                        <TableCell className="min-w-[70px] max-w-[70px] h-[20px] px-1 py-2 font-bold text-sm text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                {isNew && (
                                                    <span className="bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.3 rounded-sm">
                                                        N
                                                    </span>
                                                )}
                                                <TooltipWrapper text={property.type || "-"} />
                                            </div>
                                        </TableCell>
                                        <TableCell className="min-w-[180px] max-w-[180px] h-[20px] px-1 py-2 text-sm text-center">
                                            <GuestCardPriceInfo guestProperty={property} />
                                        </TableCell>
                                        <TableCell className="min-w-[80px] max-w-[80px] h-[20px] px-1 py-2 text-xs text-center">
                                            <TooltipWrapper
                                                text={
                                                    property.data.enter_date
                                                        ? new Date(property.data.enter_date).toLocaleDateString()
                                                        : property.data.enter_is_now
                                                            ? "즉시"
                                                            : "-"
                                                }
                                            />
                                        </TableCell>
                                        <TableCell className="min-w-[110px] max-w-[110px] h-[20px] px-1 py-2 text-xs text-center">
                                            <TooltipWrapper text={property.data.locations} />
                                        </TableCell>
                                        <TableCell className="min-w-[120px] max-w-[120px] h-[20px] px-1 py-2 text-xs text-center truncate overflow-hidden">
                                            <GuestCardInformations guestProperty={property} maxLength={1000} />
                                        </TableCell>

                                        {/* ✅ 메모 버튼 */}
                                        <TableCell className="min-w-[35px] max-w-[35px] h-[20px] px-1 py-2  text-sm text-center">
                                            {editMemoId === property.id ? (
                                                <div className="flex flex-col items-center gap-2">
                                                    <Button
                                                        className="h-7 w-7 text-xs bg-yellow-400 hover:bg-yellow-200"
                                                        variant="outline"
                                                        data-ignore-row-click
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleSaveMemo();
                                                        }}
                                                    >
                                                        저장
                                                    </Button>
                                                    <Textarea
                                                        className="text-xs w-[200px] min-w-[200px] z-50"
                                                        value={memoInput}
                                                        data-ignore-row-click
                                                        onChange={(e) => setMemoInput(e.target.value)}
                                                        autoFocus
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                </div>
                                            ) : (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                data-ignore-row-click
                                                                className="h-7 w-7 font-normal bg-yellow-400 text-[#6D6D6D] hover:bg-yellow-200 text-xs"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleEditMemo(property);
                                                                }}
                                                            >
                                                                메모
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="bg-gray-800 text-white p-2 rounded-md whitespace-pre-wrap">
                                                            {property.data.extra_memo || "메모 없음"}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
                                        </TableCell>
                                        {/* ✅ 추천 토글 버튼 */}
                                        <TableCell className="min-w-[40px] max-w-[40px] h-[20px] px-1 py-2 text-xs text-center">
                                            <Button
                                                variant="outline"
                                                className={`h-7 w-7 flex items-center justify-center p-0
                                                        ${property.alarm
                                                        ? "bg-green-400 text-white hover:bg-green-300"
                                                        : "bg-gray-400 text-white hover:bg-gray-300"
                                                    }`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    togglePropertyAlarm(property.id, !property.alarm, guest.id);
                                                }}
                                            >

                                                {property.alarm ? (
                                                    <BellRing size={16} />
                                                ) : (
                                                    <BellOff size={16} />
                                                )}
                                            </Button>
                                        </TableCell>

                                        <TableCell className="min-w-[35px] max-w-[35px] h-[20px] px-1 py-2 text-xs text-center">
                                            <Button
                                                variant="ghost"
                                                className="h-7 w-7 font-normal text-[#6D6D6D] text-xs"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRegister(property);
                                                }}
                                            >
                                                수정
                                            </Button>
                                        </TableCell>
                                        <TableCell className="min-w-[40px] max-w-[40px] h-[20px] px-1 py-2 text-xs text-center">
                                            <DeleteGuestPropertyPopup Id={property.id} onDelete={() => handleDelete(property.id)}>
                                                <Button
                                                    variant="ghost"
                                                    data-ignore-row-click
                                                    className="h-7 w-7 font-normal text-rose-600 hover:text-rose-600 hover:bg-red-50 text-xs z-50"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                    }}
                                                >
                                                    삭제
                                                </Button>
                                            </DeleteGuestPropertyPopup>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow className="flex flex-col h-full items-center">
                                <TableCell colSpan={6} className="text-center text-gray-500 px-2 py-1">
                                    등록된 매물이 없습니다.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

export { GuestCardDetail };

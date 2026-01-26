"use client"

import { supabase } from "@/utils/supabase/client";
import { toast } from "../../use-toast";
import { Guest, GuestData } from "@/types";
import { useAtom } from "jotai";
import { guestsAtom } from "@/store/atoms"; // ✅ guestsAtom 가져오기

function useUpdateGuest() {
    const [, setGuests] = useAtom(guestsAtom); // ✅ guestsAtom 상태 가져오기

    const updateGuest = async (
        guestId: number,
        column: string,
        newValue: GuestData | undefined,
        update_at: string,
        newDate: Date | undefined
    ) => {
        try {
            // 🔹 Supabase에서 guest 데이터 업데이트
            const { data, error, count } = await supabase
                .from("guest")
                .update({
                    [update_at]: newDate,
                    [column]: newValue,
                })
                .eq("id", guestId)
                .select();

            if (error) {
                toast({
                    variant: "destructive",
                    title: "에러가 발생했습니다.",
                    description: `Supabase 오류: ${error.message || "알 수 없는 오류"}`,
                });
                return false;
            }

            if (count === 0 || !data || data.length === 0) {
                toast({
                    variant: "destructive",
                    title: "업데이트 실패",
                    description: "해당 손님을 찾을 수 없습니다.",
                });
                return false;
            }

            const updatedGuest: Guest = data[0];

            // ✅ guestsAtom에서 해당 guest 데이터 업데이트하여 UI 즉시 반영
            setGuests((prev) =>
                prev.map((guest) => (guest.id === guestId ? updatedGuest : guest))
            );

            toast({
                title: "손님 정보 업데이트 완료",
                description: "손님 정보가 성공적으로 수정되었습니다.",
            });

            return true;
        } catch (error) {
            console.error("손님 정보 업데이트 실패:", error);
            toast({
                variant: "destructive",
                title: "네트워크 오류",
                description: "서버와 연결할 수 없습니다. 다시 시도해주세요!",
            });
            return false;
        }
    };

    return updateGuest;
}

export { useUpdateGuest };

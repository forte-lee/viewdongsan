"use client";

import { supabase } from "@/utils/supabase/client";
import { toast } from "../../use-toast";
import { useAtom } from "jotai";
import { guestsAtom } from "@/store/atoms"; // ✅ guestsAtom 가져오기

function useDeleteGuest(guestId: number) {
    const [guests, setGuests] = useAtom(guestsAtom); // ✅ guestsAtom 상태 가져오기

    const deleteGuest = async () => {
        try {
            // 🔹 Supabase에서 guest 삭제
            const { error, count } = await supabase
                .from("guest")
                .delete({ count: "exact" }) // ✅ 삭제된 개수 확인
                .eq("id", guestId);

            if (error) {
                toast({
                    variant: "destructive",
                    title: "에러가 발생했습니다.",
                    description: `Supabase 오류: ${error.message || "알 수 없는 오류"}`,
                });
                return false;
            }

            if (count === 0) {
                toast({
                    variant: "destructive",
                    title: "삭제 실패",
                    description: "해당 손님을 찾을 수 없습니다.",
                });
                return false;
            }

            // ✅ guestsAtom에서 삭제된 guest 제거하여 UI 즉시 반영
            setGuests((prev) => prev.filter((guest) => guest.id !== guestId));

            toast({
                title: "손님 삭제 완료",
                description: "선택한 손님이 삭제되었습니다.",
            });

            return true;
        } catch (error) {
            console.error("손님 삭제 실패:", error);
            toast({
                variant: "destructive",
                title: "네트워크 오류",
                description: "서버와 연결할 수 없습니다. 다시 시도해주세요!",
            });
            return false;
        }
    };

    return deleteGuest;
}

export { useDeleteGuest };

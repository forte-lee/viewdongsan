"use client";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui";
import { useAuthCheck } from "@/hooks/apis";
import { useDeleteGuest } from "@/hooks/supabase/guest/useDeleteGuest";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { guestsAtom, guestPropertysAtom } from "@/store/atoms"; // ✅ Atom 가져오기
import { supabase } from "@/utils/supabase/client";

interface Props {
    children: React.ReactNode;
    Id: number;
    onDelete: () => void; // 삭제 후 호출할 콜백
}

function DeleteGuestPopup({ children, Id, onDelete }: Props) {
    // const router = useRouter(); // TODO: 리다이렉트 기능 구현 시 사용
    const deleteGuest = useDeleteGuest(Number(Id));
    // const { isChecking, user } = useAuthCheck(); // TODO: 로그인 상태 및 사용자 정보 확인

    const [, setGuests] = useAtom(guestsAtom);
    const [, setGuestProperties] = useAtom(guestPropertysAtom);

    // ✅ 특정 손님 ID에 귀속된 모든 매물 삭제
    const deleteGuestProperties = async () => {
        try {
            // 🔹 Supabase에서 해당 손님의 모든 매물 삭제
            const { error, count } = await supabase
                .from("guestproperty")
                .delete({ count: "exact" })
                .eq("guest_id", Id);

            if (error) throw error;

            if ((count ?? 0) > 0) { // ✅ count가 null일 경우 0으로 처리
                // ✅ Atom에서 해당 손님의 매물 제거하여 UI 업데이트
                setGuestProperties((prev) => prev.filter((property) => property.guest_id !== Id));
            }

            return true;
        } catch (error) {
            console.error("손님 매물 삭제 실패:", error);
            return false;
        }
    };

    // ✅ 손님 삭제 핸들러 (매물 삭제 후 실행)
    const handleDelete = async () => {
        try {
            // 1️⃣ 손님 매물 먼저 삭제
            const propertiesDeleted = await deleteGuestProperties();
            if (!propertiesDeleted) {
                console.error("손님 매물 삭제 실패");
                return;
            }

            // 2️⃣ 손님 삭제
            const success = await deleteGuest();
            if (success) {
                // ✅ Atom에서 손님 데이터 제거하여 UI 반영
                setGuests((prev) => prev.filter((guest) => guest.id !== Id));
                onDelete();
            }
        } catch (error) {
            console.error("손님 삭제 중 오류 발생:", error);
        }
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>해당 손님을 정말로 삭제하시겠습니까?</AlertDialogTitle>
                    <AlertDialogDescription>
                        이 작업이 실행되면 다시 취소할 수 없습니다. <br />
                        손님과 해당 손님이 등록한 모든 매물이 삭제됩니다.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-500">
                        삭제
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export { DeleteGuestPopup };

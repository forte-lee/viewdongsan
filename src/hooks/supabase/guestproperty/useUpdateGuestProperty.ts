"use client";

import { supabase } from "@/utils/supabase/client";
import { toast } from "../../use-toast";
import { GuestProperty, GuestPropertyData } from "@/types";
import { useAtom } from "jotai";
import { guestPropertysAtom } from "@/store/atoms"; // ✅ guestPropertysAtom 가져오기
import { useAuthCheck, useGetCompanyId } from "@/hooks/apis";
// import { useSyncGuestNewProperties } from "../guestnewproperty/useSyncGuestNewProperties"; // 동적 import로 사용

function useUpdateGuestProperty() {
    const [, setGuestPropertys] = useAtom(guestPropertysAtom); // ✅ guestPropertysAtom 상태 가져오기
    const { user } = useAuthCheck();
    const { company } = useGetCompanyId(user); // UUID 기반

    const updateGuestProperty = async (
        guestPropertyId: number,
        column: string,
        newValue: GuestPropertyData | undefined,
        update_at: string,
        newDate: Date | undefined
    ) => {
        try {
            // 🔹 Supabase에서 guestProperty 데이터 업데이트
            const { data, error, count } = await supabase
                .from("guestproperty")
                .update({
                    [update_at]: newDate,
                    [column]: newValue,
                })
                .eq("id", guestPropertyId)
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
                    description: "해당 손님 매물을 찾을 수 없습니다.",
                });
                return false;
            }

            const updatedProperty: GuestProperty = data[0];

            // ✅ guestPropertysAtom에서 해당 매물 데이터 업데이트하여 UI 즉시 반영
            setGuestPropertys((prev) =>
                prev.map((property) =>
                    property.id === guestPropertyId ? updatedProperty : property
                )
            );

            // ✅ 조건 변경 시 (data 컬럼 업데이트) NEW 매물 재동기화 (소속 부동산 기반 필터링)
            if (column === "data" && updatedProperty.alarm === true) {
                // 백그라운드에서 비동기로 실행 (사용자 대기 없음)
                // useSyncGuestNewProperties는 async 함수이지만 이름이 use로 시작하므로 동적 import 사용
                import("@/hooks/supabase/guestnewproperty/useSyncGuestNewProperties")
                    .then((syncFunction) => syncFunction.useSyncGuestNewProperties(updatedProperty.guest_id, { insert: true, companyId: company }))
                    .catch((err) => {
                        console.error("❌ 조건 변경 후 동기화 실패:", err);
                        // 에러가 발생해도 사용자에게는 알리지 않음 (백그라운드 작업)
                    });
            }

            toast({
                title: "손님 매물 정보 업데이트 완료",
                description: "손님 매물 정보가 성공적으로 수정되었습니다.",
            });

            return true;
        } catch (error) {
            console.error("손님 매물 정보 업데이트 실패:", error);
            toast({
                variant: "destructive",
                title: "네트워크 오류",
                description: "서버와 연결할 수 없습니다. 다시 시도해주세요!",
            });
            return false;
        }
    };

    return updateGuestProperty;
}

export { useUpdateGuestProperty };

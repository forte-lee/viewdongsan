"use client";

import { supabase } from "@/utils/supabase/client";
import { useAtom } from "jotai";
import { guestPropertysAtom } from "@/store/atoms";
import { useAuthCheck, useGetCompanyId } from "@/hooks/apis";
import { useSyncGuestNewProperties } from "@/hooks/supabase/guestnewproperty/useSyncGuestNewProperties";

/**
 * ✔ 매물 개별 종(알림) 토글 훅
 * - OFF → 해당 guestproperty_id의 NEW 매물 삭제
 * - ON  → 해당 guestId 기준으로 NEW 매물 동기화 실행
 */
export function useToggleGuestPropertyAlarm() {
    const [guestPropertys, setGuestPropertys] = useAtom(guestPropertysAtom);
    const { user } = useAuthCheck();
    const { company } = useGetCompanyId(user); // UUID 기반

    /**
     * @param guestpropertyId  → guestproperty.id
     * @param isOn             → true: 알림 켜기 / false: 알림 끄기
     * @param guestId          → guestproperty가 소속된 guest.id
     */
    const togglePropertyAlarm = async (
        guestpropertyId: number,
        isOn: boolean,
        guestId: number
    ) => {
        try {
            console.log("🔔 [START] togglePropertyAlarm()", {
                guestpropertyId,
                isOn,
                guestId,
            });

            const now = new Date();

            // 1️⃣ DB alarm + update_at 업데이트
            const { error } = await supabase
                .from("guestproperty")
                .update({ alarm: isOn, update_at: now })
                .eq("id", guestpropertyId);

            if (error) throw error;

            // 2️⃣ Jotai 상태 즉시 반영
            setGuestPropertys((prev) =>
                prev.map((gp) =>
                    gp.id === guestpropertyId
                        ? { ...gp, alarm: isOn, update_at: now }
                        : gp
                )
            );

            console.log(`✔ guestproperty(${guestpropertyId}) alarm=${isOn}`);

            // 3️⃣ 알림 OFF → NEW 매물 삭제
            if (!isOn) {
                const { error: delErr } = await supabase
                    .from("guest_new_properties")
                    .delete()
                    .eq("guestproperty_id", guestpropertyId);

                if (delErr) throw delErr;

                console.log(`🗑 NEW 매물 삭제 완료 (guestproperty_id=${guestpropertyId})`);
                return; // 종료
            }

            // 4️⃣ 알림 ON → guest 기준으로 NEW 매물 스캔 + INSERT 수행 (소속 부동산 기반 필터링)
            console.log(`🔄 알림 ON → NEW 매물 스캔 실행 (guestId=${guestId})`);
            // useSyncGuestNewProperties는 async 함수이므로 직접 호출
            await useSyncGuestNewProperties(guestId, { insert: true, companyId: company });
        } catch (err) {
            console.error("❌ togglePropertyAlarm 오류:", err);
        }
    };

    return { togglePropertyAlarm };
}

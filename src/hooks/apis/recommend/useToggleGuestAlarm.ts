"use client";

import { supabase } from "@/utils/supabase/client";
import { useAtom } from "jotai";
import { guestPropertysAtom } from "@/store/atoms";

/**
 * 손님 알림 ON/OFF 토글
 * - OFF → 새 매물 전체 DB 삭제 + Jotai 상태 초기화
 * - ON → 새 매물 스캔 및 INSERT 수행
 */
export function useToggleGuestAlarm() {
    const [guestPropertys, setGuestPropertys] = useAtom(guestPropertysAtom);

    const toggleGuestAlarm = async (guestId: number, isOn: boolean) => {
        try {
            const now = new Date();

            // ON → DB는 건드리지 않음 (UI에서만 On 처리)
            if (isOn) {
                setGuestPropertys((prev) =>
                    prev.map((gp) =>
                        gp.guest_id === guestId ? { ...gp } : gp
                    )
                );
                return;
            }

            // OFF → 모든 매물 alarm = false
            const { error } = await supabase
                .from("guestproperty")
                .update({ alarm: false, update_at: now })
                .eq("guest_id", guestId);

            if (error) throw error;

            // 로컬 상태 반영
            setGuestPropertys((prev) =>
                prev.map((gp) =>
                    gp.guest_id === guestId
                        ? { ...gp, alarm: false, update_at: now }
                        : gp
                )
            );

            // NEW 테이블 전체 삭제
            const { data: gpList } = await supabase
                .from("guestproperty")
                .select("id")
                .eq("guest_id", guestId);

            const ids = (gpList ?? []).map((x) => x.id);
            if (ids.length > 0) {
                await supabase
                    .from("guest_new_properties")
                    .delete()
                    .in("guestproperty_id", ids);
            }

        } catch (err) {
            console.error(err);
        }
    };

    return { toggleGuestAlarm };
}


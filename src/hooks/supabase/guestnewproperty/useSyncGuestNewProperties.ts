"use client";

import { supabase } from "@/utils/supabase/client";
import { fetchRecommendedProperties } from "@/hooks/apis/recommend/fetchRecommendedProperties";

/**
 * NEW 매물 동기화
 * 조건:
 * - guestproperty.alarm = true -> NEW 대상
 * - property.update_at > guestproperty.update_at -> 추천 후보
 * - 기존 new가 is_read=true 일 때 AND property.update_at > guest_new.updated_at 이면 재등록
 * - DB 변동은 Realtime 구독이 자동으로 감지하여 Jotai(guestNewPropertiesAtom)를 업데이트함
 */
export async function useSyncGuestNewProperties(
    guestId: number,
    options?: { insert?: boolean; companyId?: number | null }
) {
    try {
        const insertEnabled = options?.insert ?? true;
        console.log("🔄 syncGuestNewProperties START:", guestId);

        /** 1) guestproperty 중 alarm=true 목록 */
        const { data: guestProps } = await supabase
            .from("guestproperty")
            .select("id, data, update_at, create_at")
            .eq("guest_id", guestId)
            .eq("alarm", true);

        if (!guestProps || guestProps.length === 0) return;

        for (const gp of guestProps) {
            console.log("\n========== 🟦 guestproperty:", gp.id, "==========");

            /** 2) 기존 NEW 목록 */
            const { data: existingNewList } = await supabase
                .from("guest_new_properties")
                .select("property_id, is_read, updated_at")
                .eq("guestproperty_id", gp.id);

            const existingMap = new Map(
                existingNewList?.map((e) => [e.property_id, e]) ?? []
            );

            /** 3) 추천매물 (소속 부동산 기반 필터링) */
            const recommended = await fetchRecommendedProperties(gp.data, options?.companyId);

            const gpUpdatedAt = new Date(gp.update_at || gp.create_at);

            /** 4) NEW 후보 필터링 */
            const filtered = recommended.filter((p) => {
                const propUpdatedAt = new Date(p.update_at || p.create_at);
                return propUpdatedAt > gpUpdatedAt;
            });

            // ✅ 현재 조건에 맞는 매물 ID 집합 생성 (NEW로 유지할 매물)
            const validPropertyIds = new Set(filtered.map((p) => p.id));

            // ✅ 6) 기존 NEW 매물 중 현재 조건에 맞지 않는 매물 삭제
            const existingPropertyIds = Array.from(existingMap.keys());
            const toDelete = existingPropertyIds.filter((pid) => !validPropertyIds.has(pid));

            if (toDelete.length > 0) {
                console.log(`🗑 조건 변경으로 인한 삭제 대상: ${toDelete.length}개`);
                
                const { error: deleteError } = await supabase
                    .from("guest_new_properties")
                    .delete()
                    .eq("guestproperty_id", gp.id)
                    .in("property_id", toDelete);

                if (deleteError) {
                    console.error("❌ 조건 불일치 매물 삭제 실패:", deleteError);
                } else {
                    console.log(`✅ 조건 불일치 매물 ${toDelete.length}개 삭제 완료`);
                    // ⭐ Realtime 구독이 자동으로 atom을 업데이트하므로 여기서는 업데이트하지 않음
                }
            }

            if (!insertEnabled) continue;

            /** 5) 신규 + 재등록 */
            for (const p of filtered) {
                const existed = existingMap.has(p.id);
                const existingRow = existingMap.get(p.id);
                const propertyUpdatedAt = new Date(p.update_at || p.create_at);

                console.log(`➡️ 매물 ${p.id} existed=${existed}`);

                if (existed) {
                    const rowUpdatedAt = new Date(existingRow!.updated_at);
                    const wasRead = existingRow!.is_read === true;

                    /** 🔥 정확한 재등록 조건 */
                    const needReinsert =
                        wasRead && propertyUpdatedAt > rowUpdatedAt;

                    if (needReinsert) {
                        console.log("🔄 재등록 UPDATE");

                        await supabase
                            .from("guest_new_properties")
                            .update({
                                is_read: false,
                                updated_at: new Date().toISOString(),
                            })
                            .eq("guestproperty_id", gp.id)
                            .eq("property_id", p.id);

                        // ⭐ Realtime 구독이 자동으로 atom을 업데이트하므로 여기서는 업데이트하지 않음
                    } else {
                        console.log("⏭ 재등록 필요 없음");
                    }
                } else {
                    /** 신규 등록 */
                    console.log("🆕 신규 INSERT:", p.id);

                    await supabase.from("guest_new_properties").insert({
                        guestproperty_id: gp.id,
                        property_id: p.id,
                        is_read: false,
                    });

                    // ⭐ Realtime 구독이 자동으로 atom을 업데이트하므로 여기서는 업데이트하지 않음
                }
            }

            console.log("========== END gp:", gp.id, "==========\n");
        }

        console.log("✨ syncGuestNewProperties DONE");

    } catch (err) {
        console.error("❌ syncGuestNewProperties error:", err);
        // 에러를 다시 throw하여 호출하는 쪽에서 처리할 수 있도록 함
        throw err;
    }
}

"use client";

import { supabase } from "@/utils/supabase/client";
import { toast } from "../../use-toast";
import { useAtom } from "jotai";
import { propertysAtom } from "@/store/atoms";

// 동일 매물 중복 삭제 방지
const deletingPropertyIds = new Set<number>();

function useMovePropertyToDelete() {
    const [, setPropertysAll] = useAtom(propertysAtom);

    const movePropertyToDelete = async (propertyId: number, options?: { silent?: boolean }) => {
        const silent = options?.silent ?? false;

        if (deletingPropertyIds.has(propertyId)) {
            return false;
        }
        deletingPropertyIds.add(propertyId);

        try {
            // 1. property에서 매물 존재 확인
            const { data: propertyData, error: fetchError } = await supabase
                .from("property")
                .select("id")
                .eq("id", propertyId)
                .single();

            if (fetchError || !propertyData) {
                toast({
                    variant: "destructive",
                    title: "매물 이동 실패",
                    description: "매물 데이터를 찾을 수 없습니다.",
                });
                return false;
            }

            // 2. guest_new_properties에서 해당 property_id 참조 삭제
            const { error: guestNewError } = await supabase
                .from("guest_new_properties")
                .delete()
                .eq("property_id", propertyId);

            if (guestNewError) {
                console.error("guest_new_properties 삭제 실패:", guestNewError.message);
                // 경고만 표시하고 계속 진행
            }

            // 3. property에서 삭제 (Supabase Webhook/트리거가 property_delete에 자동 삽입 - 앱에서 별도 삽입 시 중복 발생)
            const { error: deleteError, count } = await supabase
                .from("property")
                .delete({ count: "exact" })
                .eq("id", propertyId);

            if (deleteError) {
                console.error("property 삭제 실패:", deleteError);
                toast({
                    variant: "destructive",
                    title: "매물 이동 완료 (경고)",
                    description: "매물은 이동되었지만 property 테이블 정리 중 오류가 발생했습니다.",
                });
                return true;
            }

            if (count === 0) {
                toast({
                    variant: "destructive",
                    title: "매물 이동 실패",
                    description: "해당 ID의 매물을 찾을 수 없습니다.",
                });
                return false;
            }

            // 5. Atom에서 삭제된 매물 제거
            setPropertysAll((prev = []) => prev.filter((item) => item.id !== propertyId));

            if (!silent) {
                toast({
                    title: "매물 삭제 완료",
                    description: "선택한 매물이 삭제 매물로 이동되었습니다.",
                });
            }

            return true;
        } catch (error) {
            console.error("매물 이동 실패:", error);
            toast({
                variant: "destructive",
                title: "매물 이동 실패",
                description: "알 수 없는 오류가 발생했습니다.",
            });
            return false;
        } finally {
            deletingPropertyIds.delete(propertyId);
        }
    };

    const movePropertiesToDeleteBulk = async (propertyIds: number[]) => {
        if (propertyIds.length === 0) return false;

        let successCount = 0;
        const failedIds: number[] = [];

        for (const propertyId of propertyIds) {
            const success = await movePropertyToDelete(propertyId, { silent: true });
            if (success) {
                successCount++;
            } else {
                failedIds.push(propertyId);
            }
        }

        if (successCount > 0) {
            toast({
                title: "일괄 삭제 완료",
                description: `${successCount}개 매물이 삭제 매물로 이동되었습니다.${failedIds.length > 0 ? ` (${failedIds.length}개 실패)` : ""}`,
            });
        }

        return successCount > 0;
    };

    return { movePropertyToDelete, movePropertiesToDeleteBulk };
}

export { useMovePropertyToDelete };





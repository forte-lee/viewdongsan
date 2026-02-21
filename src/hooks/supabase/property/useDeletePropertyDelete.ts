"use client";

import { supabase } from "@/utils/supabase/client";
import { toast } from "../../use-toast";

function useDeletePropertyDelete() {
    const deletePropertyDelete = async (propertyDeleteId: number, options?: { silent?: boolean }) => {
        const silent = options?.silent ?? false;
        try {
            const { error, count } = await supabase
                .from("property_delete")
                .delete({ count: "exact" })
                .eq("id", propertyDeleteId);

            if (error) {
                if (!silent) {
                    toast({
                        variant: "destructive",
                        title: "매물 삭제 실패",
                        description: `Supabase 오류: ${error.message || "알 수 없는 오류"}`,
                    });
                }
                return false;
            }

            if (count === 0) {
                if (!silent) {
                    toast({
                        variant: "destructive",
                        title: "매물 삭제 실패",
                        description: "해당 ID의 매물을 찾을 수 없습니다.",
                    });
                }
                return false;
            }

            if (!silent) {
                toast({
                    title: "매물 삭제 완료",
                    description: "선택한 매물이 완전히 삭제되었습니다.",
                });
            }

            return true;
        } catch (error) {
            console.error("매물 삭제 실패:", error);
            if (!silent) {
                toast({
                    variant: "destructive",
                    title: "매물 삭제 실패",
                    description: "알 수 없는 오류가 발생했습니다.",
                });
            }
            return false;
        }
    };

    const deletePropertyDeletesBulk = async (propertyDeleteIds: number[]) => {
        if (propertyDeleteIds.length === 0) return false;

        let successCount = 0;
        const failedIds: number[] = [];

        for (const id of propertyDeleteIds) {
            const success = await deletePropertyDelete(id, { silent: true });
            if (success) successCount++;
            else failedIds.push(id);
        }

        if (successCount > 0) {
            toast({
                title: "일괄 삭제 완료",
                description: `${successCount}개 매물이 완전히 삭제되었습니다.${failedIds.length > 0 ? ` (${failedIds.length}개 실패)` : ""}`,
            });
        }

        return successCount > 0;
    };

    return { deletePropertyDelete, deletePropertyDeletesBulk };
}

export { useDeletePropertyDelete };








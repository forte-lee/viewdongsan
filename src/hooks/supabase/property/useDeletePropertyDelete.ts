"use client";

import { supabase } from "@/utils/supabase/client";
import { toast } from "../../use-toast";

function useDeletePropertyDelete() {
    const deletePropertyDelete = async (propertyDeleteId: number) => {
        try {
            const { error, count } = await supabase
                .from("property_delete")
                .delete({ count: "exact" })
                .eq("id", propertyDeleteId);

            if (error) {
                toast({
                    variant: "destructive",
                    title: "매물 삭제 실패",
                    description: `Supabase 오류: ${error.message || "알 수 없는 오류"}`,
                });
                return false;
            }

            if (count === 0) {
                toast({
                    variant: "destructive",
                    title: "매물 삭제 실패",
                    description: "해당 ID의 매물을 찾을 수 없습니다.",
                });
                return false;
            }

            toast({
                title: "매물 삭제 완료",
                description: "선택한 매물이 완전히 삭제되었습니다.",
            });

            return true;
        } catch (error) {
            console.error("매물 삭제 실패:", error);
            toast({
                variant: "destructive",
                title: "매물 삭제 실패",
                description: "알 수 없는 오류가 발생했습니다.",
            });
            return false;
        }
    };

    return { deletePropertyDelete };
}

export { useDeletePropertyDelete };








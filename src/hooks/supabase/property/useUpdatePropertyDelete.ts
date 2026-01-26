"use client";

import { supabase } from "@/utils/supabase/client";
import { toast } from "../../use-toast";
import { PropertyData } from "@/types";

function useUpdatePropertyDelete() {
    const updatePropertyDelete = async (
        propertyDeleteId: number,
        column: string,
        newValue: PropertyData | undefined,
        update_at: string,
        newDate: Date | undefined
    ) => {
        try {
            const updateData: Record<string, any> = {};
            
            if (update_at && newDate) {
                updateData[update_at] = newDate;
            }
            
            if (column && newValue !== undefined) {
                updateData[column] = newValue;
            }

            const { data, error, count } = await supabase
                .from("property_delete")
                .update(updateData)
                .eq("id", propertyDeleteId)
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
                    description: "해당 매물을 찾을 수 없습니다.",
                });
                return false;
            }

            toast({
                title: "매물 수정 완료",
                description: "선택한 매물이 수정되었습니다.",
            });

            return true;
        } catch (error) {
            console.error("매물 수정 실패:", error);
            toast({
                variant: "destructive",
                title: "업데이트 실패",
                description: "알 수 없는 오류가 발생했습니다.",
            });
            return false;
        }
    };

    return { updatePropertyDelete };
}

export { useUpdatePropertyDelete };








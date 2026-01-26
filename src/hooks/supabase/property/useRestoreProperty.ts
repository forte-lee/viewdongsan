"use client";

import { supabase } from "@/utils/supabase/client";
import { toast } from "../../use-toast";
import { Property } from "@/types";

function useRestoreProperty() {
    const restoreProperty = async (propertyDelete: Property) => {
        try {
            // 1. property_delete에서 데이터 가져오기
            const { data: deleteData, error: fetchError } = await supabase
                .from("property_delete")
                .select("*")
                .eq("id", propertyDelete.id)
                .single();

            if (fetchError || !deleteData) {
                toast({
                    variant: "destructive",
                    title: "복구 실패",
                    description: "삭제된 매물 데이터를 찾을 수 없습니다.",
                });
                return false;
            }

            // 2. property 테이블에 데이터 삽입
            const { error: insertError } = await supabase
                .from("property")
                .insert({
                    employee_id: deleteData.employee_id,
                    create_at: deleteData.create_at,
                    update_at: new Date().toISOString(),
                    property_type: deleteData.property_type,
                    is_register: deleteData.is_register || false,
                    data: deleteData.data,
                    on_board_state: deleteData.on_board_state,
                })
                .select()
                .single();

            if (insertError) {
                toast({
                    variant: "destructive",
                    title: "복구 실패",
                    description: `Supabase 오류: ${insertError.message || "알 수 없는 오류"}`,
                });
                return false;
            }

            // 3. property_delete에서 삭제
            const { error: deleteError } = await supabase
                .from("property_delete")
                .delete()
                .eq("id", propertyDelete.id);

            if (deleteError) {
                // property는 이미 복구되었으므로 경고만 표시
                console.error("property_delete 삭제 실패:", deleteError);
                toast({
                    variant: "destructive",
                    title: "복구 완료 (경고)",
                    description: "매물은 복구되었지만 삭제 테이블 정리 중 오류가 발생했습니다.",
                });
                return true;
            }

            toast({
                title: "매물 복구 완료",
                description: "선택한 매물이 정상적으로 복구되었습니다.",
            });

            return true;
        } catch (error) {
            console.error("매물 복구 실패:", error);
            toast({
                variant: "destructive",
                title: "복구 실패",
                description: "알 수 없는 오류가 발생했습니다.",
            });
            return false;
        }
    };

    return { restoreProperty };
}

export { useRestoreProperty };





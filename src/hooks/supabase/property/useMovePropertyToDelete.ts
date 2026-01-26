"use client";

import { supabase } from "@/utils/supabase/client";
import { toast } from "../../use-toast";
import { useAtom } from "jotai";
import { propertysAtom } from "@/store/atoms";

function useMovePropertyToDelete() {
    const [propertysAll, setPropertysAll] = useAtom(propertysAtom);

    const movePropertyToDelete = async (propertyId: number) => {
        try {
            // 1. property에서 매물 데이터 가져오기
            const { data: propertyData, error: fetchError } = await supabase
                .from("property")
                .select("*")
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

            // 2. property_delete에 데이터 삽입
            const { data: insertedData, error: insertError } = await supabase
                .from("property_delete")
                .insert({
                    employee_id: propertyData.employee_id,
                    create_at: propertyData.create_at,
                    update_at: new Date().toISOString(),
                    property_type: propertyData.property_type,
                    is_register: propertyData.is_register || false,
                    data: propertyData.data,
                    on_board_state: propertyData.on_board_state,
                })
                .select()
                .single();

            if (insertError) {
                toast({
                    variant: "destructive",
                    title: "매물 이동 실패",
                    description: `property_delete 삽입 오류: ${insertError.message || "알 수 없는 오류"}`,
                });
                return false;
            }

            // 3. guest_new_properties에서 해당 property_id 참조 삭제
            const { error: guestNewError } = await supabase
                .from("guest_new_properties")
                .delete()
                .eq("property_id", propertyId);

            if (guestNewError) {
                console.error("guest_new_properties 삭제 실패:", guestNewError.message);
                // 경고만 표시하고 계속 진행
            }

            // 4. property에서 삭제
            const { error: deleteError, count } = await supabase
                .from("property")
                .delete({ count: "exact" })
                .eq("id", propertyId);

            if (deleteError) {
                // property_delete에는 이미 삽입되었으므로 경고만 표시
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

            toast({
                title: "매물 삭제 완료",
                description: "선택한 매물이 삭제 매물로 이동되었습니다.",
            });

            return true;
        } catch (error) {
            console.error("매물 이동 실패:", error);
            toast({
                variant: "destructive",
                title: "매물 이동 실패",
                description: "알 수 없는 오류가 발생했습니다.",
            });
            return false;
        }
    };

    return { movePropertyToDelete };
}

export { useMovePropertyToDelete };





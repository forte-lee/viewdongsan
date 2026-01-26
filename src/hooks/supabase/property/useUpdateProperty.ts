"use client";

import { supabase } from "@/utils/supabase/client";
import { toast } from "../../use-toast";
import { Property, PropertyData } from "@/types";
import { useAtom } from "jotai";
import { propertysAtom } from "@/store/atoms"; // ✅ propertysAtom 가져오기

function useUpdateProperty() {
    const [, setPropertys] = useAtom(propertysAtom); // ✅ propertysAtom 상태 가져오기

    const updateProperty = async (
        propertyId: number,
        is_register: string,
        column: string,
        newValue: PropertyData | undefined,
        update_at: string,
        newDate: Date | undefined,
        temporary: boolean
    ) => {
        try {
            // 🔹 기존 is_register 값 조회
            const { data: existingData } = await supabase
                .from("property")
                .select(is_register)
                .eq("id", propertyId)
                .single();

            // 🔹 이미 is_register가 true인 경우, temporary가 false여도 true 유지
            const finalIsRegister = existingData?.[is_register] === true 
                ? true 
                : temporary;

            // 🔹 Supabase에서 property 데이터 업데이트
            const { data, error, count } = await supabase
                .from("property")
                .update({
                    [update_at]: newDate,
                    [is_register]: finalIsRegister,
                    [column]: newValue,
                })
                .eq("id", propertyId)
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

            const updatedProperty: Property = data[0];

            // ✅ propertysAtom에서 해당 매물 데이터 업데이트하여 UI 즉시 반영
            setPropertys((prev) =>
                prev.map((property) =>
                    property.id === propertyId ? updatedProperty : property
                )
            );

            // 🔹 `property_backup` 테이블에도 업데이트 (upsert 사용)
            const { error: backupError } = await supabase
                .from("property_backup")
                .upsert(
                    {
                        id: updatedProperty.id,
                        create_at: updatedProperty.create_at,
                        update_at: updatedProperty.update_at,
                        property_type: updatedProperty.property_type,
                        data: updatedProperty.data,
                        on_board_state: updatedProperty.on_board_state || null,
                        employee_id: updatedProperty.employee_id || null,
                        is_register: updatedProperty.is_register || false,
                    },
                    {
                        onConflict: "id",
                    }
                );

            if (backupError) {
                console.error("⚠️ property_backup 업데이트 실패:", backupError.message);
                // 백업 실패는 경고만 하고 계속 진행
            }

            toast({
                title: "매물 정보 업데이트 완료",
                description: "매물 정보가 성공적으로 수정되었습니다.",
            });

            return true;
        } catch (error) {
            console.error("매물 정보 업데이트 실패:", error);
            toast({
                variant: "destructive",
                title: "네트워크 오류",
                description: "서버와 연결할 수 없습니다. 다시 시도해주세요!",
            });
            return false;
        }
    };

    return updateProperty;
}

export { useUpdateProperty };

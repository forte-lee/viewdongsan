"use client";

import { supabase } from "@/utils/supabase/client";
import { toast } from "../../use-toast";
import { useAtom } from "jotai";
import { propertysAtom } from "@/store/atoms";

function useDeleteEmployeeProperties() {
    const [propertysAll, setPropertysAll] = useAtom(propertysAtom);

    const deleteEmployeeProperties = async (employeeId: number) => {
        try {
            // 1️⃣ 해당 직원이 등록한 모든 매물 조회
            const { data: properties, error: selectError } = await supabase
                .from("property")
                .select("id")
                .eq("employee_id", employeeId);

            if (selectError) {
                console.error("매물 조회 실패:", selectError.message);
                toast({
                    variant: "destructive",
                    title: "매물 조회 실패",
                    description: "직원이 등록한 매물을 조회하지 못했습니다.",
                });
                return { success: false, deletedCount: 0 };
            }

            if (!properties || properties.length === 0) {
                console.log("삭제할 매물이 없습니다.");
                return { success: true, deletedCount: 0 };
            }

            const propertyIds = properties.map((p) => p.id);
            let deletedCount = 0;

            // 2️⃣ 각 매물의 스토리지 파일 삭제 및 관련 데이터 삭제
            for (const propertyId of propertyIds) {
                try {
                    // 2-1. 스토리지에서 파일 목록 가져오기
                    const { data: listData, error: listError } = await supabase.storage
                        .from("uploads")
                        .list(`images/${propertyId}/`, { limit: 1000 });

                    if (!listError && listData && listData.length > 0) {
                        // 2-2. 스토리지에서 파일 삭제
                        const filePaths = listData.map((file) => `images/${propertyId}/${file.name}`);
                        const { error: removeError } = await supabase.storage
                            .from("uploads")
                            .remove(filePaths);

                        if (removeError) {
                            console.error(`매물 ${propertyId} 스토리지 파일 삭제 실패:`, removeError.message);
                        }
                    }

                    // 2-3. guest_new_properties에서 해당 property_id 참조 삭제
                    await supabase
                        .from("guest_new_properties")
                        .delete()
                        .eq("property_id", propertyId);

                    // 2-4. 데이터베이스에서 매물 삭제
                    const { error: deleteError } = await supabase
                        .from("property")
                        .delete()
                        .eq("id", propertyId);

                    if (deleteError) {
                        console.error(`매물 ${propertyId} 삭제 실패:`, deleteError.message);
                    } else {
                        deletedCount++;
                        // Atom에서 삭제된 매물 제거
                        setPropertysAll((prev = []) => prev.filter((item) => item.id !== propertyId));
                    }
                } catch (error) {
                    console.error(`매물 ${propertyId} 삭제 중 오류:`, error);
                }
            }

            if (deletedCount > 0) {
                toast({
                    title: "매물 삭제 완료",
                    description: `${deletedCount}개의 매물이 삭제되었습니다.`,
                });
            }

            return { success: true, deletedCount };
        } catch (error) {
            console.error("직원 매물 삭제 중 오류:", error);
            toast({
                variant: "destructive",
                title: "네트워크 오류",
                description: "서버와 연결할 수 없습니다. 다시 시도해주세요!",
            });
            return { success: false, deletedCount: 0 };
        }
    };

    return deleteEmployeeProperties;
}

export { useDeleteEmployeeProperties };








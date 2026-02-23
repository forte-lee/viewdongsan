"use client";

import { supabase } from "@/utils/supabase/client";
import { toast } from "../../use-toast";

function useTransferPropertyDelete() {
    const transferPropertyDelete = async (propertyDeleteId: number, newEmployeeId: number, options?: { silent?: boolean }) => {
        const silent = options?.silent ?? false;
        try {
            // 1. employee_id로 담당자 확인
            const { data: employeeData, error: employeeError } = await supabase
                .from("employee")
                .select("id")
                .eq("id", newEmployeeId)
                .maybeSingle();

            if (employeeError || !employeeData) {
                if (!silent) {
                    toast({
                        variant: "destructive",
                        title: "담당자 이전 실패",
                        description: "담당자 정보를 찾을 수 없습니다.",
                    });
                }
                return false;
            }

            // 2. property_delete의 employee_id 필드 업데이트
            const { data, error, count } = await supabase
                .from("property_delete")
                .update({
                    employee_id: newEmployeeId,
                    update_at: new Date().toISOString(),
                })
                .eq("id", propertyDeleteId)
                .select();

            if (error) {
                if (!silent) {
                    toast({
                        variant: "destructive",
                        title: "담당자 이전 실패",
                        description: `Supabase 오류: ${error.message || "알 수 없는 오류"}`,
                    });
                }
                return false;
            }

            if (count === 0 || !data || data.length === 0) {
                if (!silent) {
                    toast({
                        variant: "destructive",
                        title: "담당자 이전 실패",
                        description: "해당 매물을 찾을 수 없습니다.",
                    });
                }
                return false;
            }

            if (!silent) {
                toast({
                    title: "담당자 이전 완료",
                    description: "매물이 성공적으로 이전되었습니다.",
                });
            }

            return true;
        } catch (error) {
            console.error("담당자 이전 실패:", error);
            toast({
                variant: "destructive",
                title: "담당자 이전 실패",
                description: "알 수 없는 오류가 발생했습니다.",
            });
            return false;
        }
    };

    const transferPropertyDeletesBulk = async (propertyDeleteIds: number[], newEmployeeId: number) => {
        if (propertyDeleteIds.length === 0) return false;

        let successCount = 0;
        const failedIds: number[] = [];

        for (const propertyDeleteId of propertyDeleteIds) {
            const success = await transferPropertyDelete(propertyDeleteId, newEmployeeId, { silent: true });
            if (success) {
                successCount++;
            } else {
                failedIds.push(propertyDeleteId);
            }
        }

        if (successCount > 0) {
            toast({
                title: "일괄 이전 완료",
                description: `${successCount}개 매물이 이전되었습니다.${failedIds.length > 0 ? ` (${failedIds.length}개 실패)` : ""}`,
            });
        }

        return successCount > 0;
    };

    return { transferPropertyDelete, transferPropertyDeletesBulk };
}

export { useTransferPropertyDelete };


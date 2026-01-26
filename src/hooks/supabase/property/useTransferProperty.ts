"use client";

import { supabase } from "@/utils/supabase/client";
import { toast } from "../../use-toast";

function useTransferProperty() {
    const transferProperty = async (propertyId: number, newEmployeeId: number) => {
        try {
            // 1. employee_id로 담당자 확인
            const { data: employeeData, error: employeeError } = await supabase
                .from("employee")
                .select("id")
                .eq("id", newEmployeeId)
                .maybeSingle();

            if (employeeError || !employeeData) {
                toast({
                    variant: "destructive",
                    title: "담당자 이전 실패",
                    description: "담당자 정보를 찾을 수 없습니다.",
                });
                return false;
            }

            // 2. property의 employee_id 필드 업데이트
            const { data, error, count } = await supabase
                .from("property")
                .update({
                    employee_id: newEmployeeId,
                    update_at: new Date().toISOString(),
                })
                .eq("id", propertyId)
                .select();

            if (error) {
                toast({
                    variant: "destructive",
                    title: "담당자 이전 실패",
                    description: `Supabase 오류: ${error.message || "알 수 없는 오류"}`,
                });
                return false;
            }

            if (count === 0 || !data || data.length === 0) {
                toast({
                    variant: "destructive",
                    title: "담당자 이전 실패",
                    description: "해당 매물을 찾을 수 없습니다.",
                });
                return false;
            }

            toast({
                title: "담당자 이전 완료",
                description: "매물이 성공적으로 이전되었습니다.",
            });

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

    return { transferProperty };
}

export { useTransferProperty };


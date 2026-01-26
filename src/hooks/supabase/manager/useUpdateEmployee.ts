"use client";

import { supabase } from "@/utils/supabase/client";
import { toast } from "../../use-toast";
import { Employee } from "@/types";
import { useAtom } from "jotai";
import { employeesAtom } from "@/store/atoms";

function useUpdateEmployee() {
    const [, setEmployees] = useAtom(employeesAtom);

    const updateEmployee = async (
        employeeId: number,
        column: "position" | "manager",
        newValue: string,
        previousPosition?: string // 이전 직급 정보 (승인대기 체크용)
    ) => {
        try {
            console.log("🔍 직원 업데이트 시도:", { employeeId, column, newValue, previousPosition });

            // 먼저 해당 직원이 존재하는지 확인
            const { data: existingEmployee, error: checkError } = await supabase
                .from("employee")
                .select("id, name, email, position, enter_date")
                .eq("id", employeeId)
                .single();

            if (checkError || !existingEmployee) {
                console.error("❌ 직원 조회 실패:", checkError);
                toast({
                    variant: "destructive",
                    title: "업데이트 실패",
                    description: `해당 직원을 찾을 수 없습니다. (ID: ${employeeId})`,
                });
                return false;
            }

            console.log("✅ 직원 확인됨:", existingEmployee);

            // 직급이 "승인대기"에서 다른 직급으로 변경되는 경우 enter_date 업데이트
            const updateData: Partial<Employee> & { enter_date?: Date } = {
                [column]: newValue,
            };

            if (
                column === "position" &&
                (previousPosition === "승인대기" || existingEmployee.position === "승인대기") &&
                newValue !== "승인대기" &&
                !existingEmployee.enter_date // enter_date가 없을 때만 업데이트
            ) {
                updateData.enter_date = new Date();
                console.log("✅ 가입 승인 완료 - enter_date 업데이트:", updateData.enter_date);
            }

            // Supabase에서 employee 데이터 업데이트
            const { data, error } = await supabase
                .from("employee")
                .update(updateData)
                .eq("id", employeeId)
                .select();

            if (error) {
                console.error("❌ 직원 업데이트 오류:", error);
                toast({
                    variant: "destructive",
                    title: "에러가 발생했습니다.",
                    description: `Supabase 오류: ${error.message || "알 수 없는 오류"}`,
                });
                return false;
            }

            if (!data || data.length === 0) {
                console.error("❌ 업데이트 결과 없음:", { employeeId, column, newValue });
                toast({
                    variant: "destructive",
                    title: "업데이트 실패",
                    description: "해당 직원을 찾을 수 없습니다.",
                });
                return false;
            }

            const updatedEmployee: Employee = data[0];

            // employeesAtom에서 해당 employee 데이터 업데이트하여 UI 즉시 반영
            setEmployees((prev) =>
                prev.map((employee) => (employee.id === employeeId ? updatedEmployee : employee))
            );

            const message = column === "position" && updateData.enter_date
                ? "직급이 업데이트되었고 가입이 완료되었습니다."
                : `${column === "position" ? "직급" : "관리자 여부"}이(가) 업데이트되었습니다.`;

            toast({
                title: "직원 정보 업데이트 완료",
                description: message,
            });

            return true;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
            console.error("직원 업데이트 중 오류:", error);
            toast({
                variant: "destructive",
                title: "업데이트 실패",
                description: errorMessage,
            });
            return false;
        }
    };

    return { updateEmployee };
}

export { useUpdateEmployee };


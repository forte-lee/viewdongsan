"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui";
import { useDeleteEmployeeProperties } from "@/hooks/supabase/property/useDeleteEmployeeProperties";
import { supabase } from "@/utils/supabase/client";
import { useAtom } from "jotai";
import { employeesAtom } from "@/store/atoms";
import { toast } from "@/hooks/use-toast";

interface DeleteEmployeePopupProps {
    children: React.ReactNode;
    employeeId: number;
    employeeName: string;
    onDelete: () => void;
    disabled?: boolean;
}

function DeleteEmployeePopup({
    children,
    employeeId,
    employeeName,
    onDelete,
    disabled = false,
}: DeleteEmployeePopupProps) {
    const deleteEmployeeProperties = useDeleteEmployeeProperties();
    const [employees, setEmployees] = useAtom(employeesAtom);

    const handleDelete = async () => {
        try {
            // 1️⃣ 직원이 등록한 모든 매물 삭제
            const { success, deletedCount } = await deleteEmployeeProperties(employeeId);

            if (!success) {
                toast({
                    variant: "destructive",
                    title: "퇴사 처리 실패",
                    description: "매물 삭제 중 오류가 발생했습니다.",
                });
                return;
            }

            // 2️⃣ 직원 정보를 퇴사 상태로 변경
            // 참고: 데이터베이스 스키마에서 position, company_id, manager가 NOT NULL 제약이 있는 경우
            // null 대신 빈 문자열("") 또는 특정 값(예: "퇴사")을 사용해야 할 수 있습니다.
            // Supabase에서 컬럼을 NULL 허용으로 변경하려면 데이터베이스 스키마를 수정해야 합니다.
            
            // 먼저 null로 시도하고, 실패하면 빈 문자열로 시도
            let updateError: any = null;
            let finalUpdateData: any = {
                position: null,
                company_id: null,
                manager: null,
                enter_date: null,
            };

            const { error: nullError } = await supabase
                .from("employee")
                .update(finalUpdateData)
                .eq("id", employeeId);

            if (nullError) {
                // null이 허용되지 않는 경우 빈 문자열로 시도
                console.warn("null 값 업데이트 실패, 빈 문자열로 시도:", nullError.message);
                finalUpdateData = {
                    position: "",
                    company_id: null, // company_id는 숫자이므로 null 유지 시도
                    manager: "",
                    enter_date: null, // enter_date도 null로 설정
                };

                const { error: emptyError } = await supabase
                    .from("employee")
                    .update(finalUpdateData)
                    .eq("id", employeeId);

                if (emptyError) {
                    // company_id도 null이 안 되면 0으로 시도
                    finalUpdateData.company_id = 0;
                    const { error: finalError } = await supabase
                        .from("employee")
                        .update(finalUpdateData)
                        .eq("id", employeeId);
                    
                    updateError = finalError;
                } else {
                    updateError = null;
                }
            }

            if (updateError) {
                console.error("직원 퇴사 처리 실패:", updateError.message);
                toast({
                    variant: "destructive",
                    title: "퇴사 처리 실패",
                    description: `직원 정보 업데이트 중 오류가 발생했습니다: ${updateError.message}`,
                });
                return;
            }

            // 3️⃣ Atom에서 직원 데이터 업데이트하여 UI 반영
            setEmployees((prev) =>
                prev.map((emp) =>
                    emp.id === employeeId
                        ? { 
                            ...emp, 
                            position: finalUpdateData.position !== undefined ? finalUpdateData.position : null, 
                            company_id: finalUpdateData.company_id !== undefined ? finalUpdateData.company_id : null, 
                            manager: finalUpdateData.manager !== undefined ? finalUpdateData.manager : null,
                            enter_date: finalUpdateData.enter_date !== undefined ? finalUpdateData.enter_date : null
                        }
                        : emp
                )
            );

            toast({
                title: "퇴사 처리 완료",
                description: `${employeeName}님의 퇴사 처리가 완료되었습니다. (삭제된 매물: ${deletedCount}개)`,
            });

            onDelete();
        } catch (error) {
            console.error("퇴사 처리 중 오류 발생:", error);
            toast({
                variant: "destructive",
                title: "퇴사 처리 실패",
                description: "예기치 않은 오류가 발생했습니다.",
            });
        }
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild disabled={disabled}>{children}</AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {employeeName}님의 퇴사를 처리하시겠습니까?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        이 작업은 되돌릴 수 없습니다. <br />
                        퇴사 처리 시 해당 직원이 등록한 모든 매물이 영구적으로 삭제됩니다.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-500 hover:bg-red-600"
                    >
                        퇴사 처리
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export { DeleteEmployeePopup };


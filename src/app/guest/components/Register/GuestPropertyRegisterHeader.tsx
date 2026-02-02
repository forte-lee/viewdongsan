"use client";

import { Button, Label, Separator } from "@/components/ui";
import { useAuthCheck } from "@/hooks/apis";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useAtomValue } from "jotai";
import { employeesAtom } from "@/store/atoms";

interface Props {
    handleSubmit: () => Promise<void>; // ✅ handleSubmit이 Promise를 반환하도록 변경
    type: string; // 매물 타입
    guestPropertyId: number; // 손님매물 ID
}

function GuestPropertyRegisterHeader({ handleSubmit, type, guestPropertyId}: Props) {
    const router = useRouter();
    const { user } = useAuthCheck(); // ✅ 로그인 상태 및 사용자 정보 확인
    const employees = useAtomValue(employeesAtom);
    
    // 현재 사용자의 employee_id 찾기 (UUID 우선, 이메일 폴백)
    const currentEmployeeId = (() => {
        if (user?.id) {
            const employee = employees.find(emp => emp.supabase_user_id === user.id);
            if (employee) return employee.id;
        }
        // 폴백: 이메일로 찾기
        const email = user?.user_metadata?.email || user?.email;
        if (email) {
            const employee = employees.find(emp => 
                emp.kakao_email === email || emp.email === email
            );
            if (employee) return employee.id;
        }
        return null;
    })();

    // ✅ 현재 창이 팝업인지 확인
    const isPopup = typeof window !== "undefined" && window.opener !== null;

    // ✅ 등록하기 버튼 (필수 입력 체크 후 등록)
    const handleRegister = async () => {
        // ✅ 등록 시작 전에 beforeunload 이벤트 무시를 위한 플래그 설정
        if (typeof window !== "undefined") {
            (window as any).__isSubmittingGuestProperty = true;
        }
        
        try {
            await handleSubmit(); // ✅ 정식 등록
            toast({
                variant: "default",
                title: "등록 완료",
                description: "성공적으로 등록되었습니다.",
            });
            
            // ✅ 부모 창이 존재하면 업데이트 메시지 전송
            if (isPopup && window.opener) {
                window.opener.postMessage(
                    {
                        type: "UPDATE_GUEST_PROPERTY",
                        guestId: guestPropertyId, // ✅ 업데이트된 손님 ID 전송
                    },
                    "*"
                );
            }

            // ✅ 팝업 창이면 닫기
            if (isPopup) {
                window.close();
            } else if (currentEmployeeId !== null) {
                router.push(`/guest/mylist?employeeId=${currentEmployeeId}`);
            }
        } catch (error) {
            // ✅ 에러 발생 시 플래그 해제
            if (typeof window !== "undefined") {
                (window as any).__isSubmittingGuestProperty = false;
            }
            toast({
                variant: "destructive",
                title: "등록 실패",
                description: "등록 중 오류가 발생했습니다.",
            });
            console.error(error);
        }
    };

    return (
        <div>
            {/* 헤더부분 */}
            <div className="page__manage__header">
                <div className="flex flex-row justift-between">
                    {/* 매물 정보 */}
                    <div className="page__manage__header__top">
                        <Label className={"text-3xl font-bold"}>손님 매물 등록 : {type}</Label>
                        <Label className={"text-xl text-gray-700 pt-3"}>{`등록번호 : ${guestPropertyId}`}</Label>
                    </div>

                    <div className="flex flex-row justify-between">
                        {/* 등록하기 버튼 */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant={"outline"}
                                className="text-white bg-blue-700 hover:text-blue-600 hover:bg-blue-200"
                                onClick={handleRegister} // ✅ 등록하기 버튼
                            >
                                등록하기
                            </Button>
                        </div>
                    </div>
                </div>
                <Separator className="my-3" />
            </div>
        </div>
    );
}

export { GuestPropertyRegisterHeader };

"use client"

import { supabase } from "@/utils/supabase/client";
import { toast } from "../../use-toast";
import { useAuthCheck } from "../../login/useAuthCheck";
import { useAtom } from "jotai";
import { guestsAtom } from "@/store/atoms"; // ✅ guestsAtom 가져오기
import { Guest } from "@/types";

function useCreateGuest() {
    const { user } = useAuthCheck();
    const [guests, setGuests] = useAtom(guestsAtom); // ✅ guestsAtom 상태 가져오기
    
    const createGuest = async () => {
        try {
            let employeeId: number | null = null;
            let companyId: number | null = null;
            let companyName: string | null = null;

            // 1️⃣ 직원 ID & 회사 ID 찾기 (UUID 우선, 이름 폴백)
            let employee = null;
            
            // UUID로 먼저 찾기
            if (user?.id) {
                const result = await supabase
                    .from("employee")
                    .select("id, company_id")
                    .eq("supabase_user_id", user.id)
                    .maybeSingle();
                
                if (!result.error && result.data) {
                    employee = result.data;
                }
            }
            
            // UUID로 못 찾은 경우 이름으로 찾기 (폴백)
            if (!employee && user?.user_metadata?.full_name) {
                const result = await supabase
                    .from("employee")
                    .select("id, company_id")
                    .eq("name", user.user_metadata.full_name)
                    .maybeSingle();
                
                if (!result.error && result.data) {
                    employee = result.data;
                }
            }
            
            if (employee) {
                employeeId = employee.id;
                companyId = employee.company_id;
            } else {
                console.warn("직원 정보를 찾을 수 없음, employee_id & company_id를 NULL로 설정");
            }

            // 2️⃣ 회사 ID로 회사 이름 가져오기
            if (companyId) {
                const { data: company, error: companyError } = await supabase
                    .from("company")
                    .select("company_name")
                    .eq("id", companyId)
                    .single();

                if (companyError) {
                    console.warn("회사 정보를 찾을 수 없음, company_name을 NULL로 설정");
                } else {
                    companyName = company.company_name;
                }
            }

            // 3️⃣ `guest` 테이블에 새 손님 추가
            const { data, status, error } = await supabase
                .from("guest")
                .insert([
                    {
                        employee_id: employeeId,
                        company: companyName,
                        create_at: new Date(),
                        update_at: new Date(),
                        management: false,
                        data: [],
                    },
                ])
                .select();

            // 4️⃣ guestsAtom에 새 손님 추가하여 UI 즉시 업데이트
            if (data && status === 201) {
                const newGuest: Guest = data[0];

                setGuests((prev) => [...prev, newGuest]); // ✅ 상태 업데이트

                // ✅ 팝업창에서 손님 세부 정보 등록 페이지로 이동
                const detailPageURL = `/guest/register/${newGuest.id}/guest`;
                const popupWidth = 900;
                const popupHeight = 600;
                const left = (window.screen.width - popupWidth) / 2;
                const top = (window.screen.height - popupHeight) / 2;

                const registerWindow = window.open(
                    detailPageURL,
                    "_blank",
                    `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=no,scrollbars=yes`
                );

                if (!registerWindow) {
                    alert("팝업 차단이 되어있을 수 있습니다. 팝업을 허용해주세요.");
                }
            }

            // 5️⃣ 에러 처리
            if (error) {
                toast({
                    variant: "destructive",
                    title: "에러가 발생했습니다.",
                    description: `Supabase 오류: ${error.message} || "알 수 없는 오류"`,
                });
            }
        } catch (error) {
            console.error("손님 등록 실패:", error);
            toast({
                variant: "destructive",
                title: "네트워크 오류",
                description: "서버와 연결할 수 없습니다. 다시 시도해주세요!",
            });
        }
    };
    
    return createGuest;
}

export { useCreateGuest };

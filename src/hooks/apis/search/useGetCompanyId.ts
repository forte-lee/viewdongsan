"use client";

import { useAtom } from "jotai";
import { toast } from "../../use-toast";
import { companyAtom } from "@/store/atoms";
import { supabase } from "@/utils/supabase/client";
import { useEffect } from "react";
import { User } from "@supabase/supabase-js";

function useGetCompanyId(user: User | null) {
    const [company, setCompanyId] = useAtom(companyAtom);

    const getCompanyId = async () => {
        if (!user) return;

        try {
            // 1️⃣ UUID로 먼저 찾기 (가장 안전하고 정확)
            let data = null;
            let error = null;

            if (user.id) {
                const result = await supabase
                    .from("employee")
                    .select("company_id")
                    .eq("supabase_user_id", user.id)
                    .maybeSingle();
                
                data = result.data;
                error = result.error;
            }

            // 2️⃣ UUID로 못 찾은 경우, 이메일로 찾기 (폴백 - 마이그레이션 지원)
            if (!data && !error) {
                const email = user.email || user.user_metadata?.email;
                if (email) {
                    const result = await supabase
                        .from("employee")
                        .select("company_id")
                        .eq("kakao_email", email)
                        .maybeSingle();
                    
                    data = result.data;
                    error = result.error;
                }
            }

            if (error) {
                console.error("❌ Supabase 오류:", error);
                toast({
                    variant: "destructive",
                    title: "에러 발생",
                    description: error.message || "알 수 없는 오류",
                });
                return;
            }

            if (data && data.company_id) {
                if (company !== data.company_id) {
                    setCompanyId(data.company_id); // ✅ 상태 업데이트
                    console.log(`✅ 회사 ID 가져오기 성공: ${data.company_id}`);
                }
            } else {
                console.warn("⚠️ 회사 ID가 존재하지 않음");
            }
        } catch (error) {
            console.error("❌ 네트워크 오류:", error);
            toast({
                variant: "destructive",
                title: "네트워크 오류",
                description: "서버와 연결할 수 없습니다. 다시 시도해주세요!",
            });
        }
    };

    // ✅ user.id가 변경될 때마다 실행
    useEffect(() => {
        if (user) getCompanyId();
    }, [user?.id]); // user.id가 변경될 때마다 실행

    return { company, getCompanyId };
}

export { useGetCompanyId };

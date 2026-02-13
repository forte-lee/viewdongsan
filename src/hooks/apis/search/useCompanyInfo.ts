"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { useAuthCheck } from "@/hooks/apis";
import { useGetCompanyId } from "@/hooks/apis/search/useGetCompanyId"; // ✅ 추가

function useCompanyInfo() {
    const { user } = useAuthCheck(); // ✅ 현재 로그인한 사용자 정보 가져오기
    const { company } = useGetCompanyId(user); // ✅ 회사 ID 가져오기 (UUID 기반)
    const [companyName, setCompanyName] = useState<string | null>(null);
    const [isRegistrationApproved, setIsRegistrationApproved] = useState<boolean | null>(null);

    useEffect(() => {
        const fetchCompanyInfo = async () => {
            if (!company) return; // ✅ company_id가 없으면 실행하지 않음

            // ✅ company_id를 기반으로 회사 정보 가져오기 (이름 + 부동산 등록 승인여부)
            const { data: companyData, error: companyError } = await supabase
                .from("company")
                .select("company_name, is_registration_approved")
                .eq("id", company)
                .maybeSingle();

            if (companyError || !companyData) {
                console.error("❌ 회사 정보를 가져오는 데 실패했습니다:", companyError);
                return;
            }

            console.log("✅ 회사 이름:", companyData.company_name);
            setCompanyName(companyData.company_name);
            setIsRegistrationApproved(companyData.is_registration_approved ?? false);
        };

        fetchCompanyInfo();
    }, [company]); // ✅ company_id 변경 시 실행

    return { companyName, isRegistrationApproved };
}

export { useCompanyInfo };

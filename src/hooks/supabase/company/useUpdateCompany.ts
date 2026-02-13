"use client";

import { useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { CompanyData } from "./useGetCompaniesAll";

export interface UpdateCompanyInput {
    representative_phone?: string | null;
    broker_registration_number?: string | null;
    company_data?: CompanyData | null;
    is_registration_approved?: boolean;
}

export function useUpdateCompany() {
    const [isLoading, setIsLoading] = useState(false);

    const updateCompany = async (
        companyId: number,
        input: UpdateCompanyInput
    ): Promise<boolean> => {
        setIsLoading(true);
        try {
            const updatePayload: Record<string, unknown> = {};
            if (input.representative_phone !== undefined) {
                updatePayload.representative_phone = input.representative_phone?.trim() || null;
            }
            if (input.broker_registration_number !== undefined) {
                updatePayload.broker_registration_number = input.broker_registration_number?.trim() || null;
            }
            if (input.company_data !== undefined) {
                updatePayload.company_data = input.company_data;
            }
            if (input.is_registration_approved !== undefined) {
                updatePayload.is_registration_approved = input.is_registration_approved;
            }

            const { error } = await supabase
                .from("company")
                .update(updatePayload)
                .eq("id", companyId);

            if (error) {
                console.error("❌ 회사 정보 업데이트 실패:", error);
                toast({
                    variant: "destructive",
                    title: "업데이트 실패",
                    description: error.message || "회사 정보 업데이트에 실패했습니다.",
                });
                return false;
            }

            const isApproval = input.is_registration_approved === true;
            const isRevoke = input.is_registration_approved === false;
            const title = isApproval ? "승인 완료" : isRevoke ? "승인 취소 완료" : "저장 완료";
            const description = isApproval
                ? "부동산 등록이 승인되었습니다."
                : isRevoke
                  ? "부동산 등록 승인이 취소되었습니다."
                  : "회사 정보가 성공적으로 저장되었습니다.";
            toast({ title, description });
            return true;
        } catch (err) {
            console.error("❌ 회사 정보 업데이트 중 오류:", err);
            toast({
                variant: "destructive",
                title: "오류 발생",
                description: "회사 정보 저장 중 오류가 발생했습니다.",
            });
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { updateCompany, isLoading };
}

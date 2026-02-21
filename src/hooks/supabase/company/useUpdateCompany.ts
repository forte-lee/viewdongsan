"use client";

import { useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { CompanyData } from "./useGetCompaniesAll";

export interface UpdateCompanyInput {
    company_name?: string | null;
    company_phone?: string | null;
    company_address?: string | null;
    company_address_sub?: string | null;
    representative_name?: string | null;
    representative_phone?: string | null;
    broker_registration_number?: string | null;
    company_data?: CompanyData | null;
    is_registration_approved?: boolean;
    is_map_visible?: boolean;
    usage_period_end_at?: string | null; // YYYY-MM-DD 형식
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
            if (input.company_name !== undefined) {
                updatePayload.company_name = input.company_name?.trim() || null;
            }
            if (input.company_phone !== undefined) {
                updatePayload.company_phone = input.company_phone?.trim() || null;
            }
            if (input.company_address !== undefined) {
                updatePayload.company_address = input.company_address?.trim() || null;
            }
            if (input.company_address_sub !== undefined) {
                updatePayload.company_address_sub = input.company_address_sub?.trim() || null;
            }
            if (input.representative_name !== undefined) {
                updatePayload.representative_name = input.representative_name?.trim() || null;
            }
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
                updatePayload.registration_approved_at = input.is_registration_approved ? new Date().toISOString() : null;
            }
            if (input.is_map_visible !== undefined) {
                updatePayload.is_map_visible = input.is_map_visible;
                updatePayload.map_visible_at = input.is_map_visible ? new Date().toISOString() : null;
            }
            if (input.usage_period_end_at !== undefined) {
                updatePayload.usage_period_end_at = input.usage_period_end_at || null;
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

            let title = "저장 완료";
            let description = "회사 정보가 성공적으로 저장되었습니다.";
            if (input.is_registration_approved !== undefined) {
                const isApproval = input.is_registration_approved === true;
                const isRevoke = input.is_registration_approved === false;
                title = isApproval ? "승인 완료" : isRevoke ? "승인 취소 완료" : title;
                description = isApproval
                    ? "부동산 등록이 승인되었습니다."
                    : isRevoke
                      ? "부동산 등록 승인이 취소되었습니다."
                      : description;
            } else if (input.is_map_visible !== undefined) {
                const isMapVisible = input.is_map_visible === true;
                const isMapHidden = input.is_map_visible === false;
                title = isMapVisible ? "협력업체 등록 완료" : isMapHidden ? "협력업체 등록 취소 완료" : title;
                description = isMapVisible
                    ? "협력업체로 등록되었습니다."
                    : isMapHidden
                      ? "협력업체 등록이 취소되었습니다."
                      : description;
            } else if (input.usage_period_end_at !== undefined) {
                title = "사용기간 종료일 저장 완료";
                description = input.usage_period_end_at
                    ? `사용기간 종료일이 ${input.usage_period_end_at}로 설정되었습니다.`
                    : "사용기간 종료일이 해제되었습니다.";
            }
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

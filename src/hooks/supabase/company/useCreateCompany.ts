"use client";

import { useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface CreateCompanyInput {
    company_name: string;
    company_phone: string;
    company_address: string;
    company_address_sub: string;
    representative_name: string;
    representative_phone: string;
}

export function useCreateCompany() {
    const [isLoading, setIsLoading] = useState(false);

    const createCompany = async (input: CreateCompanyInput) => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from("company")
                .insert({
                    company_name: input.company_name.trim(),
                    company_phone: input.company_phone.trim(),
                    company_address: input.company_address.trim(),
                    company_address_sub: input.company_address_sub.trim(),
                    representative_name: input.representative_name.trim(),
                    representative_phone: input.representative_phone.trim(),
                    is_registration_approved: false,
                })
                .select("id")
                .single();

            if (error) {
                console.error("❌ 가맹 신청 실패:", error);
                toast({
                    variant: "destructive",
                    title: "가맹 신청 실패",
                    description: error.message || "가맹 신청에 실패했습니다.",
                });
                return { success: false, error };
            }

            const companyId = data?.id;
            if (companyId) {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const currentEmail = user.email || user.user_metadata?.email;
                    const kakaoName = user.user_metadata?.full_name || user.user_metadata?.name || input.representative_name.trim();

                    let existingEmployee: { id: number } | null = null;
                    if (user.id) {
                        const { data: byUserId } = await supabase
                            .from("employee")
                            .select("id")
                            .eq("supabase_user_id", user.id)
                            .maybeSingle();
                        existingEmployee = byUserId as { id: number } | null;
                    }
                    if (!existingEmployee && currentEmail) {
                        const { data: byEmail } = await supabase
                            .from("employee")
                            .select("id")
                            .eq("kakao_email", currentEmail)
                            .maybeSingle();
                        existingEmployee = byEmail as { id: number } | null;
                    }

                    if (existingEmployee) {
                        await supabase
                            .from("employee")
                            .update({
                                company_id: companyId,
                                position: "대표",
                                manager: "대표",
                                name: input.representative_name.trim(),
                                phone: input.representative_phone.trim() || null,
                            })
                            .eq("id", existingEmployee.id);
                    } else {
                        await supabase.from("employee").insert({
                            supabase_user_id: user.id,
                            kakao_name: kakaoName || null,
                            kakao_email: currentEmail || null,
                            email: currentEmail || "",
                            name: input.representative_name.trim(),
                            company_id: companyId,
                            position: "대표",
                            manager: "대표",
                            phone: input.representative_phone.trim() || null,
                            created_at: new Date().toISOString(),
                        });
                    }
                }
            }

            toast({
                title: "가맹 신청 완료",
                description: "가맹 신청이 접수되었습니다. 검토 후 연락드리겠습니다.",
            });
            return { success: true, data };
        } catch (err) {
            console.error("❌ 가맹 신청 중 오류:", err);
            toast({
                variant: "destructive",
                title: "오류 발생",
                description: "가맹 신청 중 오류가 발생했습니다.",
            });
            return { success: false, error: err };
        } finally {
            setIsLoading(false);
        }
    };

    return { createCompany, isLoading };
}

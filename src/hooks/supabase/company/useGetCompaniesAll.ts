"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/utils/supabase/client";
import { toast } from "../../use-toast";

/** company_data JSON 구조: 사업자등록증, 중개업등록증, 외부사진, 회사 소개 */
export interface CompanyData {
    business_registration?: string;
    broker_license?: string;
    exterior_photos?: string[];
    company_introduction?: string; // 회사 소개 글
}

export interface Company {
    id: number;
    company_name: string | null;
    company_phone: string | null;
    company_address: string | null;
    company_address_sub: string | null;
    representative_name?: string | null;
    representative_phone?: string | null;
    broker_registration_number?: string | null;
    company_data?: CompanyData | null;
    is_registration_approved?: boolean; // 부동산 등록 승인여부
    created_at: string;
}

export function useGetCompaniesAll() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);

    const loadCompanies = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("company")
                .select("*")
                .order("id", { ascending: true });

            if (error) {
                console.error("❌ 부동산 정보 로드 실패:", error);
                toast({
                    variant: "destructive",
                    title: "부동산 목록 로드 실패",
                    description: error.message || "부동산 목록을 불러오는데 실패했습니다.",
                });
                return;
            }

            if (data) {
                setCompanies(data as Company[]);
            }
        } catch (err) {
            console.error("❌ 오류 발생:", err);
            toast({
                variant: "destructive",
                title: "오류 발생",
                description: "부동산 목록을 불러오는 중 오류가 발생했습니다.",
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCompanies();
    }, [loadCompanies]);

    return { companies, loading, loadCompanies };
}








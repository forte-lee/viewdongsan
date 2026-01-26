"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { toast } from "../../use-toast";

export interface Company {
    id: number;
    company_name: string | null;
    company_phone: string | null;
    company_address: string | null;
    company_address_sub: string | null;
    created_at: string;
}

export function useGetCompaniesAll() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCompanies = async () => {
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
        };

        loadCompanies();
    }, []);

    return { companies, loading };
}








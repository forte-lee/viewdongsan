"use client";

import { Button, Separator } from "@/components/ui";
import { useRouter, useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Label } from "@radix-ui/react-label";
import { supabase } from "@/utils/supabase/client";
import { Card, CardContent } from "@/components/ui";
import { toast } from "@/hooks/use-toast";
import type { CompanyData } from "@/hooks/supabase/company/useGetCompaniesAll";

interface CompanyInfo {
    id: number;
    company_name: string;
    company_phone?: string | null;
    company_address?: string | null;
    company_address_sub?: string | null;
    representative_name?: string | null;
    representative_phone?: string | null;
    broker_registration_number?: string | null;
    company_data?: CompanyData | null;
    is_registration_approved?: boolean;
    created_at?: string;
}

function SiteAdminCompanyDetailPage() {
    const router = useRouter();
    const params = useParams();
    const companyId = params?.companyId ? Number(params.companyId) : null;

    const [isLoading, setIsLoading] = useState(true);
    const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);

    useEffect(() => {
        const loadCompanyInfo = async () => {
            if (!companyId || isNaN(companyId)) {
                setIsLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from("company")
                    .select(
                        "id, company_name, company_phone, company_address, company_address_sub, representative_name, representative_phone, broker_registration_number, company_data, is_registration_approved, created_at"
                    )
                    .eq("id", companyId)
                    .maybeSingle();

                if (error) {
                    console.error("❌ 회사 정보 로드 실패:", error);
                    toast({
                        variant: "destructive",
                        title: "오류 발생",
                        description: "회사 정보를 불러오는 데 실패했습니다.",
                    });
                    setIsLoading(false);
                    return;
                }

                if (data) {
                    setCompanyInfo(data as CompanyInfo);
                }
            } catch (error) {
                console.error("❌ 회사 정보 로드 중 오류:", error);
                toast({
                    variant: "destructive",
                    title: "오류 발생",
                    description: "회사 정보를 불러오는 중 오류가 발생했습니다.",
                });
            } finally {
                setIsLoading(false);
            }
        };

        loadCompanyInfo();
    }, [companyId]);

    return (
        <>
            <div className="page__manage__header">
                <div className="flex flex-row justify-between items-center">
                    <div className="flex flex-row justify-between items-start">
                        <Button
                            variant={"outline"}
                            size={"icon"}
                            onClick={() => router.push("/site-admin/companies")}
                        >
                            <ChevronLeft />
                        </Button>
                        <div className="flex flex-row justify-start items-end gap-3 pl-4">
                            <Label className={"text-3xl font-bold"}>회사 상세 정보</Label>
                            <Label className={"text-xl text-gray-500 font-bold"}>
                                ({companyInfo?.company_name || `회사 #${companyId}`})
                            </Label>
                        </div>
                    </div>
                </div>
            </div>
            <Separator className="my-1" />
            <div className="page__manage__body">
                <div className="flex flex-col w-full items-center justify-start gap-1">
                    {isLoading ? (
                        <div className="page__manage__body__noData">
                            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                                로딩 중...
                            </h3>
                        </div>
                    ) : companyInfo ? (
                        <div className="page__manage__body__isData w-full max-w-6xl p-4">
                            <Card className="bg-white rounded-lg shadow-sm border border-gray-200 w-full">
                                <CardContent className="p-6">
                                    <div className="flex flex-col gap-6">
                                        <div className="flex flex-col gap-4">
                                            <h2 className="text-lg font-semibold text-gray-900">회사 정보</h2>

                                            <div className="flex items-center gap-6">
                                                <Label className="text-sm text-gray-600 font-medium min-w-[160px]">
                                                    회사명
                                                </Label>
                                                <span className="text-sm text-gray-900">
                                                    {companyInfo.company_name || "-"}
                                                </span>
                                            </div>

                                            <Separator className="my-1" />

                                            <div className="flex items-center gap-6">
                                                <Label className="text-sm text-gray-600 font-medium min-w-[160px]">
                                                    연락처
                                                </Label>
                                                <span className="text-sm text-gray-900">
                                                    {companyInfo.company_phone || "-"}
                                                </span>
                                            </div>

                                            <Separator className="my-1" />

                                            <div className="flex items-start gap-6">
                                                <Label className="text-sm text-gray-600 font-medium min-w-[160px] pt-1">
                                                    주소
                                                </Label>
                                                <div className="flex flex-col gap-1">
                                                    {companyInfo.company_address && (
                                                        <span className="text-sm text-gray-900">
                                                            {companyInfo.company_address}
                                                        </span>
                                                    )}
                                                    {companyInfo.company_address_sub && (
                                                        <span className="text-sm text-gray-900">
                                                            {companyInfo.company_address_sub}
                                                        </span>
                                                    )}
                                                    {!companyInfo.company_address &&
                                                        !companyInfo.company_address_sub && (
                                                            <span className="text-sm text-gray-500">-</span>
                                                        )}
                                                </div>
                                            </div>

                                            <Separator className="my-1" />

                                            <div className="flex items-center gap-6">
                                                <Label className="text-sm text-gray-600 font-medium min-w-[160px]">
                                                    대표자 이름
                                                </Label>
                                                <span className="text-sm text-gray-900">
                                                    {companyInfo.representative_name || "-"}
                                                </span>
                                            </div>

                                            <Separator className="my-1" />

                                            <div className="flex items-center gap-6">
                                                <Label className="text-sm text-gray-600 font-medium min-w-[160px]">
                                                    대표자 연락처
                                                </Label>
                                                <span className="text-sm text-gray-900">
                                                    {companyInfo.representative_phone || "-"}
                                                </span>
                                            </div>

                                            <Separator className="my-1" />

                                            <div className="flex items-center gap-6">
                                                <Label className="text-sm text-gray-600 font-medium min-w-[160px]">
                                                    중개등록번호
                                                </Label>
                                                <span className="text-sm text-gray-900">
                                                    {companyInfo.broker_registration_number || "-"}
                                                </span>
                                            </div>

                                            <Separator className="my-1" />

                                            <div className="flex items-center gap-6">
                                                <Label className="text-sm text-gray-600 font-medium min-w-[160px]">
                                                    가입일
                                                </Label>
                                                <span className="text-sm text-gray-900">
                                                    {companyInfo.created_at
                                                        ? new Date(companyInfo.created_at).toLocaleDateString("ko-KR", {
                                                              year: "numeric",
                                                              month: "long",
                                                              day: "numeric",
                                                          })
                                                        : "-"}
                                                </span>
                                            </div>

                                            <Separator className="my-1" />

                                            <div className="flex items-center gap-6">
                                                <Label className="text-sm text-gray-600 font-medium min-w-[160px]">
                                                    부동산 등록 승인여부
                                                </Label>
                                                <span
                                                    className={`text-sm font-medium ${
                                                        companyInfo.is_registration_approved
                                                            ? "text-green-600"
                                                            : "text-amber-600"
                                                    }`}
                                                >
                                                    {companyInfo.is_registration_approved ? "승인됨" : "미승인"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <div className="page__manage__body__noData">
                            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                                회사 정보를 찾을 수 없습니다.
                            </h3>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default SiteAdminCompanyDetailPage;

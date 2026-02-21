"use client";

import { Button, Separator } from "@/components/ui";
import { useRouter, useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Label } from "@radix-ui/react-label";
import { supabase } from "@/utils/supabase/client";
import { Card, CardContent } from "@/components/ui";
import { toast } from "@/hooks/use-toast";
import { useUpdateCompany } from "@/hooks/supabase/company/useUpdateCompany";
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
    is_map_visible?: boolean;
    registration_approved_at?: string | null;
    map_visible_at?: string | null;
    usage_period_end_at?: string | null;
    created_at?: string;
}

function SiteAdminCompanyDetailPage() {
    const router = useRouter();
    const params = useParams();
    const companyId = params?.companyId ? Number(params.companyId) : null;
    const isPopup = typeof window !== "undefined" && window.opener !== null;
    const { updateCompany, isLoading: isUpdating } = useUpdateCompany();

    const [isLoading, setIsLoading] = useState(true);
    const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
    const [processingField, setProcessingField] = useState<string | null>(null);
    const [usagePeriodEndInput, setUsagePeriodEndInput] = useState<string>("");

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
                        "id, company_name, company_phone, company_address, company_address_sub, representative_name, representative_phone, broker_registration_number, company_data, is_registration_approved, is_map_visible, registration_approved_at, map_visible_at, usage_period_end_at, created_at"
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
                    const info = data as CompanyInfo;
                    setCompanyInfo(info);
                    setUsagePeriodEndInput(info.usage_period_end_at || "");
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

    const handleApprove = async () => {
        if (!companyId || !window.confirm("해당 회사의 부동산 등록을 승인하시겠습니까?")) return;
        setProcessingField("approval");
        const success = await updateCompany(companyId, { is_registration_approved: true });
        setProcessingField(null);
        if (success) {
            const now = new Date().toISOString();
            setCompanyInfo((prev) => (prev ? { ...prev, is_registration_approved: true, registration_approved_at: now } : null));
        }
    };

    const handleRevokeApprove = async () => {
        if (!companyId || !window.confirm("해당 회사의 부동산 등록 승인을 취소하시겠습니까?")) return;
        setProcessingField("approval");
        const success = await updateCompany(companyId, { is_registration_approved: false });
        setProcessingField(null);
        if (success) {
            setCompanyInfo((prev) => (prev ? { ...prev, is_registration_approved: false, registration_approved_at: null } : null));
        }
    };

    const handleMapVisible = async () => {
        if (!companyId || !window.confirm("해당 회사를 협력업체로 등록하시겠습니까?")) return;
        setProcessingField("map");
        const success = await updateCompany(companyId, { is_map_visible: true });
        setProcessingField(null);
        if (success) {
            const now = new Date().toISOString();
            setCompanyInfo((prev) => (prev ? { ...prev, is_map_visible: true, map_visible_at: now } : null));
        }
    };

    const handleMapHidden = async () => {
        if (!companyId || !window.confirm("해당 회사의 협력업체 등록을 취소하시겠습니까?")) return;
        setProcessingField("map");
        const success = await updateCompany(companyId, { is_map_visible: false });
        setProcessingField(null);
        if (success) {
            setCompanyInfo((prev) => (prev ? { ...prev, is_map_visible: false, map_visible_at: null } : null));
        }
    };

    const handleUsagePeriodEndSave = async () => {
        if (!companyId) return;
        const value = usagePeriodEndInput.trim() || null;
        setProcessingField("usage");
        const success = await updateCompany(companyId, { usage_period_end_at: value });
        setProcessingField(null);
        if (success) {
            setCompanyInfo((prev) => (prev ? { ...prev, usage_period_end_at: value } : null));
        }
    };

    return (
        <>
            {!isPopup && (
                <>
                    <div className="page__manage__header">
                        <div className="flex flex-row justify-between items-center">
                            <div className="flex flex-row justify-between items-start">
                                <Button
                                    variant={"outline"}
                                    size={"icon"}
                                    onClick={() => router.push("/site-admin/companies")}
                                    title="목록으로"
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
                </>
            )}
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
                                                        ? new Date(companyInfo.created_at).toLocaleString("ko-KR", {
                                                              year: "numeric",
                                                              month: "long",
                                                              day: "numeric",
                                                              hour: "2-digit",
                                                              minute: "2-digit",
                                                              second: "2-digit",
                                                          })
                                                        : "-"}
                                                </span>
                                            </div>

                                            <Separator className="my-1" />

                                            <div className="flex items-center gap-6">
                                                <Label className="text-sm text-gray-600 font-medium min-w-[160px]">
                                                    부동산 등록 승인
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
                                                {!companyInfo.is_registration_approved ? (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-green-600 border-green-300 hover:bg-green-50"
                                                        onClick={handleApprove}
                                                        disabled={processingField !== null || isUpdating}
                                                    >
                                                        {processingField === "approval" ? "처리 중..." : "승인"}
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-red-600 border-red-300 hover:bg-red-50"
                                                        onClick={handleRevokeApprove}
                                                        disabled={processingField !== null || isUpdating}
                                                    >
                                                        {processingField === "approval" ? "처리 중..." : "승인취소"}
                                                    </Button>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-6">
                                                <Label className="text-sm text-gray-600 font-medium min-w-[160px]">
                                                    부동산 등록 승인일
                                                </Label>
                                                <span className="text-sm text-gray-900">
                                                    {companyInfo.registration_approved_at
                                                        ? new Date(companyInfo.registration_approved_at).toLocaleString("ko-KR", {
                                                              year: "numeric",
                                                              month: "long",
                                                              day: "numeric",
                                                              hour: "2-digit",
                                                              minute: "2-digit",
                                                              second: "2-digit",
                                                          })
                                                        : "-"}
                                                </span>
                                            </div>

                                            <Separator className="my-1" />

                                            <div className="flex items-center gap-6">
                                                <Label className="text-sm text-gray-600 font-medium min-w-[160px]">
                                                    협력업체 등록
                                                </Label>
                                                <span
                                                    className={`text-sm font-medium ${
                                                        companyInfo.is_map_visible
                                                            ? "text-blue-600"
                                                            : "text-gray-500"
                                                    }`}
                                                >
                                                    {companyInfo.is_map_visible ? "등록됨" : "미등록"}
                                                </span>
                                                {!companyInfo.is_map_visible ? (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-blue-600 border-blue-300 hover:bg-blue-50"
                                                        onClick={handleMapVisible}
                                                        disabled={!companyInfo.is_registration_approved || processingField !== null || isUpdating}
                                                        title={!companyInfo.is_registration_approved ? "부동산 등록 승인 후 사용 가능" : undefined}
                                                    >
                                                        {processingField === "map" ? "처리 중..." : "협력업체 등록"}
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-gray-600 border-gray-300 hover:bg-gray-50"
                                                        onClick={handleMapHidden}
                                                        disabled={!companyInfo.is_registration_approved || processingField !== null || isUpdating}
                                                        title={!companyInfo.is_registration_approved ? "부동산 등록 승인 후 사용 가능" : undefined}
                                                    >
                                                        {processingField === "map" ? "처리 중..." : "협력업체 등록 취소"}
                                                    </Button>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-6">
                                                <Label className="text-sm text-gray-600 font-medium min-w-[160px]">
                                                    협력업체 등록일
                                                </Label>
                                                <span className="text-sm text-gray-900">
                                                    {companyInfo.map_visible_at
                                                        ? new Date(companyInfo.map_visible_at).toLocaleString("ko-KR", {
                                                              year: "numeric",
                                                              month: "long",
                                                              day: "numeric",
                                                              hour: "2-digit",
                                                              minute: "2-digit",
                                                              second: "2-digit",
                                                          })
                                                        : "-"}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-6">
                                                <Label className="text-sm text-gray-600 font-medium min-w-[160px]">
                                                    사용기간 종료일
                                                </Label>
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="date"
                                                            value={usagePeriodEndInput}
                                                            onChange={(e) => setUsagePeriodEndInput(e.target.value)}
                                                            className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                                                        />
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={handleUsagePeriodEndSave}
                                                            disabled={processingField !== null || isUpdating}
                                                        >
                                                            {processingField === "usage" ? "저장 중..." : "저장"}
                                                        </Button>
                                                    </div>
                                                    {companyInfo.usage_period_end_at && (
                                                        <span className="text-sm text-gray-600">
                                                            {new Date(companyInfo.usage_period_end_at + "T23:59:00").toLocaleString("ko-KR", {
                                                                year: "numeric",
                                                                month: "long",
                                                                day: "numeric",
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            })}
                                                        </span>
                                                    )}
                                                </div>
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

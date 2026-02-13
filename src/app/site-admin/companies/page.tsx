"use client";

import { Button, Separator } from "@/components/ui";
import { useRouter } from "next/navigation";
import React, { useState, useMemo } from "react";
import { ChevronLeft, Search } from "lucide-react";
import { Label } from "@radix-ui/react-label";
import { useGetCompaniesAll, type Company } from "@/hooks/supabase/company/useGetCompaniesAll";
import { useUpdateCompany } from "@/hooks/supabase/company/useUpdateCompany";
import {
    Card,
    CardContent,
    CardTitle,
} from "@/components/ui";

type ApprovalFilter = "" | "approved" | "unapproved";

function SiteAdminCompaniesPage() {
    const router = useRouter();
    const { companies, loading, loadCompanies } = useGetCompaniesAll();
    const { updateCompany, isLoading: isUpdating } = useUpdateCompany();
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [filterApproval, setFilterApproval] = useState<ApprovalFilter>("");

    const filteredCompanies = useMemo(() => {
        const keyword = searchKeyword.trim().toLowerCase();
        return companies.filter((company) => {
            if (keyword) {
                const searchTargets = [
                    company.company_name,
                    company.company_phone,
                    company.company_address,
                    company.company_address_sub,
                    company.representative_name,
                    company.representative_phone,
                ].filter(Boolean);
                const matchSearch = searchTargets.some((t) =>
                    String(t).toLowerCase().includes(keyword)
                );
                if (!matchSearch) return false;
            }
            if (filterApproval === "approved" && !company.is_registration_approved) return false;
            if (filterApproval === "unapproved" && company.is_registration_approved) return false;
            return true;
        });
    }, [companies, searchKeyword, filterApproval]);

    const handleResetFilters = () => {
        setSearchKeyword("");
        setFilterApproval("");
    };

    const handleApprove = async (companyId: number) => {
        if (!window.confirm("해당 회사의 부동산 등록을 승인하시겠습니까?")) return;
        setProcessingId(companyId);
        const success = await updateCompany(companyId, { is_registration_approved: true });
        setProcessingId(null);
        if (success) {
            loadCompanies();
        }
    };

    const handleRevokeApprove = async (companyId: number) => {
        if (!window.confirm("해당 회사의 부동산 등록 승인을 취소하시겠습니까?")) return;
        setProcessingId(companyId);
        const success = await updateCompany(companyId, { is_registration_approved: false });
        setProcessingId(null);
        if (success) {
            loadCompanies();
        }
    };

    return (
        <>
            <div className="page__manage__header">
                <div className="flex flex-row justify-between items-center">
                    <div className="flex flex-row justify-between items-start">
                        <Button
                            variant={"outline"}
                            size={"icon"}
                            onClick={() => router.push("/site-admin/properties")}
                        >
                            <ChevronLeft />
                        </Button>
                        <div className="flex flex-row justify-start items-end gap-3 pl-4">
                            <Label className={"text-3xl font-bold"}>전체 회사 관리</Label>
                            <Label className={"text-xl text-gray-500 font-bold"}>(전체 회사 리스트)</Label>
                            <Label className={"text-lg text-amber-600 font-semibold"}>
                                (회사수 : {filteredCompanies.length}개
                                {(searchKeyword || filterApproval) &&
                                    ` / 전체 ${companies.length}개`}
                                )
                            </Label>
                        </div>
                    </div>
                </div>
            </div>
            <Separator className="my-1" />
            <div className="page__manage__body">
                <div className="flex flex-col w-full items-stretch gap-1">
                    {/* 필터 및 검색 영역 */}
                    <div className="p-4 border-b border-gray-200 bg-white">
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-wrap items-center gap-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-sm bg-gray-100 text-gray-800 hover:bg-gray-200"
                                    onClick={handleResetFilters}
                                >
                                    초기화
                                </Button>
                                <div className="relative flex-1 min-w-[200px] max-w-md">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="회사명, 연락처, 주소, 대표자 검색"
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                                        value={searchKeyword}
                                        onChange={(e) => setSearchKeyword(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Label className="text-sm font-medium whitespace-nowrap">부동산 등록 승인</Label>
                                    <select
                                        value={filterApproval}
                                        onChange={(e) => setFilterApproval(e.target.value as ApprovalFilter)}
                                        className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                                    >
                                        <option value="">전체</option>
                                        <option value="approved">승인됨</option>
                                        <option value="unapproved">미승인</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="page__manage__body__noData">
                            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                                로딩 중...
                            </h3>
                        </div>
                    ) : companies.length !== 0 ? (
                        <div className="page__manage__body__isData w-full max-w-full p-4 self-stretch !items-stretch">
                            <div className="flex flex-col gap-2 w-full min-w-0">
                                {filteredCompanies.length !== 0 ? filteredCompanies.map((company: Company) => (
                                    <Card key={company.id} className="hover:shadow-lg transition-shadow w-full">
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between gap-4 flex-wrap">
                                                <div className="flex flex-col gap-2">
                                                    <CardTitle className="text-lg m-0">
                                                        {company.company_name || `회사 #${company.id}`}
                                                    </CardTitle>
                                                    <div className="flex flex-col gap-1 text-sm text-gray-600">
                                                        <div className="flex gap-4">
                                                            <span className="font-medium min-w-[140px] shrink-0">연락처</span>
                                                            <span>{company.company_phone || "-"}</span>
                                                        </div>
                                                        <div className="flex gap-4">
                                                            <span className="font-medium min-w-[140px] shrink-0">주소</span>
                                                            <span>
                                                                {company.company_address || "-"}
                                                                {company.company_address_sub && (
                                                                    <> {company.company_address_sub}</>
                                                                )}
                                                            </span>
                                                        </div>
                                                        <div className="flex gap-4">
                                                            <span className="font-medium min-w-[140px] shrink-0">대표자</span>
                                                            <span>{company.representative_name || "-"}</span>
                                                        </div>
                                                        <div className="flex gap-4">
                                                            <span className="font-medium min-w-[140px] shrink-0">대표 연락처</span>
                                                            <span>{company.representative_phone || "-"}</span>
                                                        </div>
                                                        <div className="flex gap-4">
                                                            <span className="font-medium min-w-[140px] shrink-0">가입일</span>
                                                            <span>
                                                                {company.created_at
                                                                    ? new Date(company.created_at).toLocaleDateString("ko-KR", {
                                                                          year: "numeric",
                                                                          month: "long",
                                                                          day: "numeric",
                                                                      })
                                                                    : "-"}
                                                            </span>
                                                        </div>
                                                        <div className="flex gap-4">
                                                            <span className="font-medium min-w-[140px] shrink-0">부동산 등록 승인</span>
                                                            <span
                                                                className={
                                                                    company.is_registration_approved
                                                                        ? "text-green-600"
                                                                        : "text-amber-600"
                                                                }
                                                            >
                                                                {company.is_registration_approved ? "승인됨" : "미승인"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    {!company.is_registration_approved ? (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-green-600 border-green-300 hover:bg-green-50"
                                                            onClick={() => handleApprove(company.id)}
                                                            disabled={processingId === company.id || isUpdating}
                                                        >
                                                            {processingId === company.id ? "승인 중..." : "승인"}
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-red-600 border-red-300 hover:bg-red-50"
                                                            onClick={() => handleRevokeApprove(company.id)}
                                                            disabled={processingId === company.id || isUpdating}
                                                        >
                                                            {processingId === company.id ? "취소 중..." : "승인취소"}
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-amber-600 border-amber-300 hover:bg-amber-50"
                                                        onClick={() =>
                                                            router.push(`/site-admin/companies/${company.id}`)
                                                        }
                                                    >
                                                        상세 보기
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )) : (
                                    <div className="page__manage__body__noData py-12">
                                        <h3 className="scroll-m-20 text-xl font-semibold tracking-tight text-gray-500">
                                            검색 결과가 없습니다.
                                        </h3>
                                        <p className="text-sm text-gray-400 mt-2">필터 조건을 변경해 보세요.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="page__manage__body__noData">
                            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                                등록된 회사가 없습니다.
                            </h3>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default SiteAdminCompaniesPage;

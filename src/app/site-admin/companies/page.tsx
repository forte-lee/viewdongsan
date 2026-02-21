"use client";

import { Button, Separator } from "@/components/ui";
import { useRouter } from "next/navigation";
import React, { useState, useMemo, useRef, useEffect } from "react";
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
type MapVisibleFilter = "" | "visible" | "hidden";

function SiteAdminCompaniesPage() {
    const router = useRouter();
    const { companies, loading, loadCompanies } = useGetCompaniesAll();
    const { updateCompany, isLoading: isUpdating } = useUpdateCompany();
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [filterApproval, setFilterApproval] = useState<ApprovalFilter>("");
    const [filterMapVisible, setFilterMapVisible] = useState<MapVisibleFilter>("");
    const popupCheckRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        return () => {
            if (popupCheckRef.current) clearInterval(popupCheckRef.current);
        };
    }, []);

    // 사용기간 종료일이 지난 회사 자동 승인취소/협력업체 등록 취소
    const expiredProcessedRef = useRef<Set<number>>(new Set());
    useEffect(() => {
        if (loading || companies.length === 0) return;

        const now = new Date();
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
        const expiredCompanies = companies.filter((c) => {
            const endDate = (c.usage_period_end_at || "").split("T")[0];
            return (
                endDate &&
                endDate < today &&
                (c.is_registration_approved || c.is_map_visible) &&
                !expiredProcessedRef.current.has(c.id)
            );
        });

        if (expiredCompanies.length === 0) return;

        expiredCompanies.forEach((c) => expiredProcessedRef.current.add(c.id));

        const runExpire = async () => {
            for (const company of expiredCompanies) {
                await updateCompany(company.id, {
                    is_registration_approved: false,
                    is_map_visible: false,
                });
            }
            loadCompanies();
        };
        runExpire();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [companies, loading]);

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
            if (filterMapVisible === "visible" && !company.is_map_visible) return false;
            if (filterMapVisible === "hidden" && company.is_map_visible) return false;
            return true;
        });
    }, [companies, searchKeyword, filterApproval, filterMapVisible]);

    const handleResetFilters = () => {
        setSearchKeyword("");
        setFilterApproval("");
        setFilterMapVisible("");
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

    const handleMapVisible = async (companyId: number) => {
        if (!window.confirm("해당 회사를 협력업체로 등록하시겠습니까?")) return;
        setProcessingId(companyId);
        const success = await updateCompany(companyId, { is_map_visible: true });
        setProcessingId(null);
        if (success) {
            loadCompanies();
        }
    };

    const handleMapHidden = async (companyId: number) => {
        if (!window.confirm("해당 회사의 협력업체 등록을 취소하시겠습니까?")) return;
        setProcessingId(companyId);
        const success = await updateCompany(companyId, { is_map_visible: false });
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
                                {(searchKeyword || filterApproval || filterMapVisible) &&
                                    ` / 전체 ${companies.length}개`}
                                )
                            </Label>
                        </div>
                    </div>
                </div>
            </div>
            <div className="page__manage__body">
                <div className="flex flex-col w-full items-stretch gap-1">
                    {/* 필터 및 검색 영역 */}
                    <div className="p-4 bg-[#f9f9f9]">
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
                                    <Label className="text-sm font-medium whitespace-nowrap">부동산 등록</Label>
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
                                <div className="flex items-center gap-2">
                                    <Label className="text-sm font-medium whitespace-nowrap">협력업체</Label>
                                    <select
                                        value={filterMapVisible}
                                        onChange={(e) => setFilterMapVisible(e.target.value as MapVisibleFilter)}
                                        className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                                    >
                                        <option value="">전체</option>
                                        <option value="visible">등록됨</option>
                                        <option value="hidden">미등록</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Separator className="my-1" />

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
                                    <Card
                                        key={company.id}
                                        className="hover:shadow-lg transition-shadow w-full cursor-pointer"
                                        onClick={() => {
                                            const w = 900;
                                            const h = 800;
                                            const left = (window.screen.width - w) / 2;
                                            const top = (window.screen.height - h) / 2;
                                            const popup = window.open(
                                                `/site-admin/companies/${company.id}`,
                                                `CompanyDetail_${company.id}`,
                                                `width=${w},height=${h},left=${left},top=${top},scrollbars=yes,resizable=yes`
                                            );
                                            if (popup) {
                                                if (popupCheckRef.current) clearInterval(popupCheckRef.current);
                                                popupCheckRef.current = setInterval(() => {
                                                    if (popup.closed) {
                                                        if (popupCheckRef.current) {
                                                            clearInterval(popupCheckRef.current);
                                                            popupCheckRef.current = null;
                                                        }
                                                        loadCompanies();
                                                    }
                                                }, 500);
                                            }
                                        }}
                                    >
                                        <CardContent className="p-5">
                                            {/* 상단: 회사명 + 버튼 */}
                                            <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-200">
                                                <CardTitle className="text-lg m-0">
                                                    {company.company_name || `회사 #${company.id}`}
                                                </CardTitle>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    {!company.is_registration_approved ? (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-green-600 border-green-300 hover:bg-green-50"
                                                            onClick={(e) => { e.stopPropagation(); handleApprove(company.id); }}
                                                            disabled={processingId === company.id || isUpdating}
                                                        >
                                                            {processingId === company.id ? "승인 중..." : "승인"}
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-red-600 border-red-300 hover:bg-red-50"
                                                            onClick={(e) => { e.stopPropagation(); handleRevokeApprove(company.id); }}
                                                            disabled={processingId === company.id || isUpdating}
                                                        >
                                                            {processingId === company.id ? "취소 중..." : "승인취소"}
                                                        </Button>
                                                    )}
                                                    {!company.is_map_visible ? (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-blue-600 border-blue-300 hover:bg-blue-50"
                                                            onClick={(e) => { e.stopPropagation(); handleMapVisible(company.id); }}
                                                            disabled={!company.is_registration_approved || processingId === company.id || isUpdating}
                                                            title={!company.is_registration_approved ? "부동산 등록 승인 후 사용 가능" : undefined}
                                                        >
                                                            {processingId === company.id ? "처리 중..." : "협력업체 등록"}
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-gray-600 border-gray-300 hover:bg-gray-50"
                                                            onClick={(e) => { e.stopPropagation(); handleMapHidden(company.id); }}
                                                            disabled={!company.is_registration_approved || processingId === company.id || isUpdating}
                                                            title={!company.is_registration_approved ? "부동산 등록 승인 후 사용 가능" : undefined}
                                                        >
                                                            {processingId === company.id ? "처리 중..." : "협력업체 등록 취소"}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* 본문: 2단 그리드 */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* 왼쪽: 기본 정보 */}
                                                <div className="flex flex-col gap-2 text-sm">
                                                    <div className="flex gap-3 py-1">
                                                        <span className="font-medium text-gray-500 min-w-[100px] shrink-0">연락처</span>
                                                        <span className="text-gray-800">{company.company_phone || "-"}</span>
                                                    </div>
                                                    <div className="flex gap-3 py-1">
                                                        <span className="font-medium text-gray-500 min-w-[100px] shrink-0">주소</span>
                                                        <span className="text-gray-800">
                                                            {company.company_address || "-"}
                                                            {company.company_address_sub && <> {company.company_address_sub}</>}
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-3 py-1">
                                                        <span className="font-medium text-gray-500 min-w-[100px] shrink-0">대표자</span>
                                                        <span className="text-gray-800">{company.representative_name || "-"}</span>
                                                    </div>
                                                    <div className="flex gap-3 py-1">
                                                        <span className="font-medium text-gray-500 min-w-[100px] shrink-0">대표 연락처</span>
                                                        <span className="text-gray-800">{company.representative_phone || "-"}</span>
                                                    </div>
                                                    <div className="flex gap-3 py-1">
                                                        <span className="font-medium text-gray-500 min-w-[100px] shrink-0">가입일</span>
                                                        <span className="text-gray-800">
                                                            {company.created_at
                                                                ? new Date(company.created_at).toLocaleString("ko-KR", {
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
                                                </div>

                                                {/* 오른쪽: 승인/등록 정보 */}
                                                <div className="flex flex-col gap-2 text-sm md:border-l md:border-gray-200 md:pl-6">
                                                    <div className="flex gap-3 py-1">
                                                        <span className="font-medium text-gray-500 min-w-[120px] shrink-0">부동산 등록 승인</span>
                                                        <span className={company.is_registration_approved ? "text-green-600 font-medium" : "text-amber-600"}>
                                                            {company.is_registration_approved ? "승인됨" : "미승인"}
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-3 py-1">
                                                        <span className="font-medium text-gray-500 min-w-[120px] shrink-0">부동산 등록 승인일</span>
                                                        <span className="text-gray-800">
                                                            {company.registration_approved_at
                                                                ? new Date(company.registration_approved_at).toLocaleString("ko-KR", {
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
                                                    <div className="flex gap-3 py-1">
                                                        <span className="font-medium text-gray-500 min-w-[120px] shrink-0">협력업체 등록</span>
                                                        <span className={company.is_map_visible ? "text-blue-600 font-medium" : "text-gray-500"}>
                                                            {company.is_map_visible ? "등록됨" : "미등록"}
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-3 py-1">
                                                        <span className="font-medium text-gray-500 min-w-[120px] shrink-0">협력업체 등록일</span>
                                                        <span className="text-gray-800">
                                                            {company.map_visible_at
                                                                ? new Date(company.map_visible_at).toLocaleString("ko-KR", {
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
                                                    <div className="flex gap-3 py-1">
                                                        <span className="font-medium text-gray-500 min-w-[120px] shrink-0">사용기간 종료일</span>
                                                        <span className="text-gray-800">
                                                            {company.usage_period_end_at
                                                                ? new Date(company.usage_period_end_at + "T23:59:00").toLocaleString("ko-KR", {
                                                                      year: "numeric",
                                                                      month: "long",
                                                                      day: "numeric",
                                                                      hour: "2-digit",
                                                                      minute: "2-digit",
                                                                  })
                                                                : "-"}
                                                        </span>
                                                    </div>
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

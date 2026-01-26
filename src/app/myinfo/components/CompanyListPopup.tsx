"use client";

import { useState, useMemo } from "react";
import { useGetCompaniesAll } from "@/hooks/supabase/company/useGetCompaniesAll";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, Input } from "@/components/ui";
import { Loader2, X, Search } from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import { toast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";

interface CompanyListPopupProps {
    user: User | null;
    onClose: () => void;
    onSuccess: () => void;
}

function CompanyListPopup({ user, onClose, onSuccess }: CompanyListPopupProps) {
    const { companies, loading } = useGetCompaniesAll();
    const [applyingCompanyId, setApplyingCompanyId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    // 검색어로 필터링
    const filteredCompanies = useMemo(() => {
        if (!searchTerm.trim()) {
            return companies;
        }
        return companies.filter((company) =>
            company.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [companies, searchTerm]);

    const handleApply = async (companyId: number) => {
        if (!user?.user_metadata?.email) {
            toast({
                variant: "destructive",
                title: "오류",
                description: "사용자 정보를 찾을 수 없습니다.",
            });
            return;
        }

        setApplyingCompanyId(companyId);

        try {
            // employee 테이블에서 현재 사용자의 company_id와 position 업데이트
            const { error } = await supabase
                .from("employee")
                .update({ 
                    company_id: companyId,
                    position: "승인대기"
                })
                .eq("kakao_email", user.user_metadata.email);

            if (error) {
                console.error("❌ 부동산 신청 실패:", error);
                toast({
                    variant: "destructive",
                    title: "신청 실패",
                    description: error.message || "부동산 신청에 실패했습니다.",
                });
                return;
            }

            toast({
                title: "신청 완료",
                description: "부동산 신청이 완료되었습니다. 승인을 기다려주세요.",
            });

            onSuccess();
            onClose();
        } catch (err) {
            console.error("❌ 오류 발생:", err);
            toast({
                variant: "destructive",
                title: "오류 발생",
                description: "신청 중 오류가 발생했습니다.",
            });
        } finally {
            setApplyingCompanyId(null);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-[90%] max-w-4xl max-h-[90vh] flex flex-col">
                {/* 헤더 */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-800">부동산 목록</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* 검색창 */}
                <div className="px-6 pt-4 pb-2 border-b">
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="부동산명으로 검색..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        {searchTerm && (
                            <Button
                                variant="outline"
                                onClick={() => setSearchTerm("")}
                                className="whitespace-nowrap"
                            >
                                초기화
                            </Button>
                        )}
                    </div>
                </div>

                {/* 내용 */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="flex flex-col items-center gap-4">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                <p className="text-gray-600">부동산 목록을 불러오는 중...</p>
                            </div>
                        </div>
                    ) : filteredCompanies.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-600">
                                {searchTerm ? "검색 결과가 없습니다." : "등록된 부동산이 없습니다."}
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {filteredCompanies.map((company) => (
                                <Card key={company.id} className="hover:shadow-md transition-shadow">
                                    <div className="p-4">
                                        {/* 부동산명과 신청 버튼 행 */}
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-lg font-semibold text-gray-800">
                                                {company.company_name || "부동산명 없음"}
                                            </h3>
                                            <Button
                                                variant="ghost"
                                                className="h-7 w-12 font-normal text-blue-600 hover:text-blue-600 hover:bg-blue-50 text-xs"
                                                onClick={() => handleApply(company.id)}
                                                disabled={applyingCompanyId === company.id}
                                            >
                                                {applyingCompanyId === company.id ? (
                                                    <>
                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                    </>
                                                ) : (
                                                    "신청"
                                                )}
                                            </Button>
                                        </div>
                                        {/* 연락처와 주소 행 */}
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="flex items-start">
                                                <span className="font-medium text-gray-600 w-20 flex-shrink-0">연락처:</span>
                                                <span className="text-gray-800">
                                                    {company.company_phone || "정보 없음"}
                                                </span>
                                            </div>
                                            <div className="flex items-start">
                                                <span className="font-medium text-gray-600 w-20 flex-shrink-0">주소:</span>
                                                <span className="text-gray-800">
                                                    {company.company_address && company.company_address_sub
                                                        ? `${company.company_address} ${company.company_address_sub}`
                                                        : company.company_address || company.company_address_sub || "정보 없음"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CompanyListPopup;


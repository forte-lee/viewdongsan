"use client";

import { Button, Label, Separator } from "@/components/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ChevronLeft, Search } from "lucide-react";

/**
 * 전화번호 검색 페이지
 * 매물 테이블(property)의 연락처 필드 기준으로 검색
 */
export default function PhoneSearchPage() {
    const router = useRouter();

    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState<Array<{
        id: number;
        property_type: string;
        data: Record<string, unknown>;
        employee_id: number;
        created_at: string;
        employee: { id: number; kakao_email?: string; email?: string; kakao_name?: string; name?: string } | { id: number; kakao_email?: string; email?: string; kakao_name?: string; name?: string }[] | null;
        employeeEmail: string;
        employeeName: string;
    }>>([]);
    const [loading, setLoading] = useState(false);

    // ✅ 전화번호 검색
    const handleSearch = async () => {
        if (!searchTerm.trim()) return;

        try {
            setLoading(true);

            // 하이픈 제거 후 검색
            const clean = searchTerm.replace(/[-\s]/g, "");

            // property 테이블의 data JSON 내부에서 전화번호 검색
            const { data, error } = await supabase
                .from("property")
                .select("id, property_type, data, employee_id, created_at, employee(id, kakao_email, email, kakao_name, name)")
                .ilike("data->>contact_number", `%${clean}%`);

            if (error) throw error;
            
            // employee 정보를 결과에 매핑
            const resultsWithEmployee = (data || []).map((item) => {
                // Supabase 조인 결과는 배열일 수 있으므로 첫 번째 요소를 사용
                const employee = Array.isArray(item.employee) 
                    ? item.employee[0] 
                    : item.employee;
                return {
                    ...item,
                    employeeEmail: employee?.kakao_email || employee?.email || "-",
                    employeeName: employee?.kakao_name || employee?.name || "-",
                };
            });
            
            setResults(resultsWithEmployee);
        } catch (err) {
            console.error("검색 오류:", err);
            toast({
                variant: "destructive",
                title: "검색 실패",
                description: "전화번호 검색 중 오류가 발생했습니다.",
            });
        } finally {
            setLoading(false);
        }
    };

    // ✅ 엔터로도 검색 실행
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") handleSearch();
    };

    return (
        <div className="flex flex-col w-full p-5">
            {/* 상단 헤더 */}
            <div className="flex items-center justify-between mb-4">
                <Button variant="outline" size="icon" onClick={() => router.push("/guest")}>
                    <ChevronLeft />
                </Button>

                <div className="flex flex-row items-end gap-2">
                    <Label className="text-3xl font-bold">전화번호 검색</Label>
                    <Label className="text-lg text-gray-500 font-semibold">(매물 연락처 기준)</Label>
                </div>

                <Button
                    variant="outline"
                    className="bg-blue-600 hover:bg-blue-500 text-white"
                    onClick={() => {
                        setResults([]);
                        setSearchTerm("");
                    }}
                >
                    초기화
                </Button>
            </div>

            {/* 검색창 */}
            <div className="flex flex-row justify-center items-center gap-2 mb-4">
                <input
                    type="text"
                    placeholder="전화번호(일부 입력 가능)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="border border-gray-300 p-2 rounded w-2/3"
                />
                <Button
                    onClick={handleSearch}
                    className="bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2"
                >
                    <Search size={18} /> 검색
                </Button>
            </div>

            <Separator className="my-2" />

            {/* 결과 테이블 */}
            <div className="overflow-x-auto mt-4">
                <table className="min-w-full border border-gray-300 text-sm text-center">
                    <thead className="bg-gray-100 font-semibold">
                        <tr>
                            <th className="border px-3 py-2">단지명</th>
                            <th className="border px-3 py-2">주소</th>
                            <th className="border px-3 py-2">동</th>
                            <th className="border px-3 py-2">호실</th>
                            <th className="border px-3 py-2">등록자</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="py-5 text-gray-500">
                                    검색 중입니다...
                                </td>
                            </tr>
                        ) : results.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-6 text-gray-400">
                                    검색 시 있으면 나오고 없으면 그냥 계속 흰 바탕
                                </td>
                            </tr>
                        ) : (
                            results.map((item) => {
                                const d = item.data || {};
                                return (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="border px-3 py-2">{String(d.complex_name || "-")}</td>
                                        <td className="border px-3 py-2">{String(d.address || "-")}</td>
                                        <td className="border px-3 py-2">{String(d.dong || "-")}</td>
                                        <td className="border px-3 py-2">{String(d.ho || "-")}</td>
                                        <td className="border px-3 py-2">{item.employeeEmail || "-"}</td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

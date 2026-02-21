"use client";

import { Button, Separator } from "@/components/ui";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useMemo } from "react";
import { ChevronLeft, ChevronDown, ChevronUp, Search } from "lucide-react";
import { Label } from "@radix-ui/react-label";
import { Employee } from "@/types";
import { useAtom } from "jotai";
import { employeesAtom } from "@/store/atoms";
import { useGetEmployeesAll } from "@/hooks/supabase/manager/useGetEmployeesAll";
import { supabase } from "@/utils/supabase/client";
import {
    Card,
    CardContent,
    CardTitle,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui";
import { useGetCompaniesAll, type Company } from "@/hooks/supabase/company/useGetCompaniesAll";

const POSITION_OPTIONS = ["대표", "실장", "부장", "팀장", "차장", "과장", "대리", "주임", "사원", "인턴", "승인대기"];
const MANAGER_OPTIONS = ["대표", "매니저", "직원"];

function SiteAdminEmployeesPage() {
    const router = useRouter();
    const [employees, setEmployees] = useAtom(employeesAtom);
    const { companies } = useGetCompaniesAll();
    const [isLoading, setIsLoading] = useState(true);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [filterCompanyId, setFilterCompanyId] = useState<number | "">("");
    const [filterPosition, setFilterPosition] = useState<string>("");
    const [filterManager, setFilterManager] = useState<string>("");
    const [filterExpanded, setFilterExpanded] = useState(false);

    useGetEmployeesAll();

    useEffect(() => {
        const loadEmployees = async () => {
            try {
                const { data, error } = await supabase
                    .from("employee")
                    .select("*")
                    .order("id", { ascending: true });

                if (error) {
                    console.error("❌ 직원 정보 로드 실패:", error);
                    setIsLoading(false);
                    return;
                }

                if (data) {
                    setEmployees(data as Employee[]);
                }
            } catch (error) {
                console.error("❌ 직원 정보 로드 중 오류:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadEmployees();
    }, [setEmployees]);

    const getCompanyName = (companyId: number | null) => {
        if (!companyId) return "-";
        const c = companies.find((co: Company) => co.id === companyId);
        return c?.company_name || `회사 #${companyId}`;
    };

    // 전체 직원 (퇴사 제외) + 검색 + 필터 적용
    const filteredEmployees = useMemo(() => {
        const baseFiltered = employees.filter(
            (emp) =>
                emp.position !== "" &&
                emp.position !== null &&
                emp.company_id !== null &&
                emp.company_id !== 0
        );

        const keyword = searchKeyword.trim().toLowerCase();
        const filtered = baseFiltered.filter((emp) => {
            if (keyword) {
                const searchTargets = [
                    emp.name,
                    emp.kakao_name,
                    emp.email,
                    emp.kakao_email,
                    emp.phone,
                    getCompanyName(emp.company_id),
                ].filter(Boolean);
                const matchSearch = searchTargets.some((t) =>
                    String(t).toLowerCase().includes(keyword)
                );
                if (!matchSearch) return false;
            }
            if (filterCompanyId !== "" && emp.company_id !== filterCompanyId) return false;
            if (filterPosition && emp.position !== filterPosition) return false;
            if (filterManager && emp.manager !== filterManager) return false;
            return true;
        });
        return filtered;
    }, [employees, searchKeyword, filterCompanyId, filterPosition, filterManager, companies]);

    const handleResetFilters = () => {
        setSearchKeyword("");
        setFilterCompanyId("");
        setFilterPosition("");
        setFilterManager("");
    };

    const positionOrder: Record<string, number> = {
        대표: 1,
        실장: 2,
        부장: 3,
        팀장: 4,
        차장: 5,
        과장: 6,
        대리: 7,
        주임: 8,
        사원: 9,
        인턴: 10,
        승인대기: 11,
    };

    const sortedEmployees = [...filteredEmployees]
        .map((emp) => ({
            ...emp,
            positionOrder: positionOrder[emp.position || ""] || 999,
        }))
        .sort((a, b) => {
            if (a.positionOrder !== b.positionOrder) return a.positionOrder - b.positionOrder;
            return a.id - b.id;
        });

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
                            <Label className={"text-3xl font-bold"}>전체 직원 관리</Label>
                            <Label className={"text-xl text-gray-500 font-bold"}>(전체 직원 리스트)</Label>
                            <Label className={"text-lg text-amber-600 font-semibold"}>
                                (직원수 : {sortedEmployees.length}명
                                {(searchKeyword || filterCompanyId || filterPosition || filterManager) &&
                                    ` / 전체 ${employees.filter((e) => e.position && e.company_id !== null && e.company_id !== 0).length}명`}
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
                    <div className="p-4 border-b border-gray-200 bg-[#f9f9f9]">
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-wrap items-center gap-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-sm bg-gray-100 text-gray-800 hover:bg-gray-200 flex items-center gap-2"
                                    onClick={() => setFilterExpanded((prev) => !prev)}
                                >
                                    필터
                                    {filterExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </Button>
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
                                        placeholder="이름, 이메일, 연락처, 소속 회사 검색"
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                                        value={searchKeyword}
                                        onChange={(e) => setSearchKeyword(e.target.value)}
                                    />
                                </div>
                            </div>
                            {filterExpanded && (
                                <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-gray-200">
                                    <div className="flex items-center gap-2">
                                        <Label className="text-sm font-medium whitespace-nowrap">소속 회사</Label>
                                        <select
                                            value={filterCompanyId}
                                            onChange={(e) =>
                                                setFilterCompanyId(e.target.value === "" ? "" : Number(e.target.value))
                                            }
                                            className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                                        >
                                            <option value="">전체</option>
                                            {companies.map((c: Company) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.company_name || `회사 #${c.id}`}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Label className="text-sm font-medium whitespace-nowrap">직급</Label>
                                        <select
                                            value={filterPosition}
                                            onChange={(e) => setFilterPosition(e.target.value)}
                                            className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                                        >
                                            <option value="">전체</option>
                                            {POSITION_OPTIONS.map((p) => (
                                                <option key={p} value={p}>
                                                    {p}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Label className="text-sm font-medium whitespace-nowrap">관리자</Label>
                                        <select
                                            value={filterManager}
                                            onChange={(e) => setFilterManager(e.target.value)}
                                            className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                                        >
                                            <option value="">전체</option>
                                            {MANAGER_OPTIONS.map((m) => (
                                                <option key={m} value={m}>
                                                    {m}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="page__manage__body__noData">
                            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                                로딩 중...
                            </h3>
                        </div>
                    ) : sortedEmployees.length !== 0 ? (
                        <div className="page__manage__body__isData w-full max-w-full p-4 self-stretch !items-stretch">
                            <TooltipProvider delayDuration={300}>
                            <div className="flex flex-col gap-2 w-full min-w-0">
                                {sortedEmployees.map((employee: Employee) => (
                                    <Card key={employee.id} className="hover:shadow-lg transition-shadow w-full">
                                        <CardContent className="p-3">
                                            <div className="grid grid-cols-[110px_140px_80px_80px_minmax(200px,1fr)] gap-4 items-start">
                                                <div className="flex flex-col gap-0.5 min-w-0">
                                                    <CardTitle className="text-lg m-0 truncate">
                                                        {employee.name}
                                                    </CardTitle>
                                                    {employee.kakao_name && (
                                                        <span className="text-xs text-gray-400 truncate">
                                                            카카오: {employee.kakao_name}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex flex-col gap-0.5 min-w-0">
                                                    <Label className="text-sm font-semibold">소속 회사</Label>
                                                    <span className="text-sm text-gray-700 truncate">
                                                        {getCompanyName(employee.company_id)}
                                                    </span>
                                                </div>

                                                <div className="flex flex-col gap-0.5 min-w-0">
                                                    <Label className="text-sm font-semibold">직급</Label>
                                                    <span className="text-sm text-gray-700">
                                                        {employee.position || "-"}
                                                    </span>
                                                </div>

                                                <div className="flex flex-col gap-0.5 min-w-0">
                                                    <Label className="text-sm font-semibold">관리자</Label>
                                                    <span className="text-sm text-gray-700">
                                                        {employee.manager || "-"}
                                                    </span>
                                                </div>

                                                <div className="flex flex-col gap-1 min-w-0">
                                                    <div className="flex items-center gap-2 min-h-[20px] min-w-0">
                                                        <span className="text-sm text-gray-700 whitespace-nowrap shrink-0 w-[52px]">
                                                            이메일
                                                        </span>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <span className="text-sm text-gray-700 truncate block min-w-0 flex-1 overflow-hidden cursor-default">
                                                                    {employee.email || "-"}
                                                                </span>
                                                            </TooltipTrigger>
                                                            <TooltipContent className="max-w-[320px] break-all">
                                                                {employee.email || "-"}
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                    <div className="flex items-center gap-2 min-h-[20px]">
                                                        <span className="text-sm text-gray-700 whitespace-nowrap shrink-0 w-[52px]">
                                                            연락처
                                                        </span>
                                                        <span className="text-sm text-gray-700 truncate block min-w-0">
                                                            {employee.phone || "-"}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 min-h-[20px]">
                                                        <span className="text-sm text-gray-700 whitespace-nowrap shrink-0 w-[52px]">
                                                            등록일
                                                        </span>
                                                        <span className="text-sm text-gray-700">
                                                            {employee.enter_date
                                                                ? new Date(employee.enter_date).toLocaleDateString("ko-KR")
                                                                : "-"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                            </TooltipProvider>
                        </div>
                    ) : (
                        <div className="page__manage__body__noData">
                            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                                등록된 직원이 없습니다.
                            </h3>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default SiteAdminEmployeesPage;

"use client";

import { Button, Label, Separator } from "@/components/ui";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useAuthCheck, useGetCompanyId } from "@/hooks/apis";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useAtomValue } from "jotai";
import { propertysAtom, employeesAtom } from "@/store/atoms";
import { isManagerAtom } from "@/store/atoms";

export default function PhoneMyListPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuthCheck();
    const employeeIdParam = searchParams.get("employeeId");

    const isManager = useAtomValue(isManagerAtom);

    // 회사 ID 가져오기 (UUID 기반)
    const { company } = useGetCompanyId(user);
    
    // 직원 목록 가져오기
    const employees = useAtomValue(employeesAtom);
    
    // 로그인한 사용자의 실제 employee_id 찾기 (UUID 기반)
    const loggedInEmployeeId = (() => {
        if (user?.id) {
            const employee = employees.find(emp => emp.supabase_user_id === user.id);
            if (employee) return employee.id;
        }
        return null;
    })();
    
    // 현재 사용자의 employee_id 찾기 (보안 검증은 useEffect에서 처리)
    const currentEmployeeId = (() => {
        // 1. 로그인한 사용자의 실제 employee_id를 먼저 가져옴
        const actualEmployeeId = loggedInEmployeeId;
        
        // 2. URL 파라미터에서 employeeId가 있으면 검증
        if (employeeIdParam) {
            const paramId = Number(employeeIdParam);
            if (!isNaN(paramId)) {
                // URL 파라미터의 employeeId가 로그인한 사용자의 employee_id와 일치하는지 확인
                if (actualEmployeeId !== null && paramId === actualEmployeeId) {
                    return paramId;
                }
                // 일치하지 않으면 null 반환 (useEffect에서 리다이렉트 처리)
                return null;
            }
        }
        
        // 3. URL 파라미터가 없거나 유효하지 않으면 로그인한 사용자의 employee_id 사용
        return actualEmployeeId;
    })();
    
    // ⭐ 보안 검증: URL 파라미터의 employeeId가 로그인한 사용자의 employee_id와 일치하는지 확인
    useEffect(() => {
        if (employeeIdParam && loggedInEmployeeId !== null) {
            const paramId = Number(employeeIdParam);
            if (!isNaN(paramId) && paramId !== loggedInEmployeeId) {
                // 권한이 없는 경우 올바른 URL로 리다이렉트
                router.replace(`/phone/myphone?employeeId=${loggedInEmployeeId}`);
            }
        } else if (!employeeIdParam && loggedInEmployeeId !== null) {
            // URL 파라미터가 없으면 로그인한 사용자의 employee_id로 리다이렉트
            router.replace(`/phone/myphone?employeeId=${loggedInEmployeeId}`);
        }
    }, [employeeIdParam, loggedInEmployeeId, router]);

    // 🔥 Jotai에서 전체 매물 가져오기
    const allProperties = useAtomValue(propertysAtom);

    // 상태
    const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
    const [keyword, setKeyword] = useState("");
    const [dong, setDong] = useState("");
    const [ho, setHo] = useState("");

    // 🔥 Jotai에서 매물이 바뀌면 자동 초기화 (소속 부동산 기반 필터링)
    useEffect(() => {
        if (!allProperties) return;

        // company_id로 필터링: 같은 company_id를 가진 employee의 employee_id만 표시
        const companyEmployeeIds = company !== null
            ? employees
                .filter((emp) => emp.company_id === company)
                .map((emp) => emp.id)
                .filter((id): id is number => id !== undefined && id !== null)
            : [];
    
        const filtered = allProperties.filter((p) => {
            const d = p.data || {};
            const hasValidAddress = !!d.complex_name || !!d.address;
            
            // company_id가 있으면 같은 company_id를 가진 employee의 매물만 표시
            // company_id가 null이면 매물을 표시하지 않음
            // employee_id 우선, 없으면 이메일로 매칭 (하위 호환)
            const matchCompany = company === null 
                ? false 
                : (p.employee_id !== null && p.employee_id !== undefined
                    ? companyEmployeeIds.includes(p.employee_id)
                    : false);
            
            return hasValidAddress && matchCompany;
        });
    
        setFilteredProperties(filtered);
    }, [allProperties, company, employees]);
    

    /** 🔍 검색 실행 */
    const handleSearch = () => {
        if (!allProperties || allProperties.length === 0) return;

        const kw = keyword.trim();
        const d = dong.trim();
        const h = ho.trim();

        // company_id로 필터링: 같은 company_id를 가진 employee의 employee_id만 표시
        const companyEmployeeIds = company !== null
            ? employees
                .filter((emp) => emp.company_id === company)
                .map((emp) => emp.id)
                .filter((id): id is number => id !== undefined && id !== null)
            : [];

        const result = allProperties.filter((p) => {
            const data = p.data || {};

            // company_id가 있으면 같은 company_id를 가진 employee의 매물만 표시
            // company_id가 null이면 매물을 표시하지 않음
            // employee_id 우선, 없으면 이메일로 매칭 (하위 호환)
            const matchCompany = company === null 
                ? false 
                : (p.employee_id !== null && p.employee_id !== undefined
                    ? companyEmployeeIds.includes(p.employee_id)
                    : false);

            // 🔥 단지명 & 주소 둘 다 없으면 검색 제외
            const hasValidAddress = !!data?.complex_name || !!data?.address;

            if (!hasValidAddress || !matchCompany) return false;

            const matchKeyword =
                !kw ||
                (data?.address && data.address.includes(kw)) ||
                (data?.complex_name && data.complex_name.includes(kw)) ||
                (Array.isArray(data?.phones) &&
                    data.phones.some((num: string) =>
                        num.replace(/[^0-9]/g, "").includes(
                            kw.replace(/[^0-9]/g, "")
                        )
                    ));

            const matchDong =
                !d || (data?.address_dong && String(data.address_dong).includes(d));
            const matchHo =
                !h || (data?.address_ho && String(data.address_ho).includes(h));

            return matchKeyword && matchDong && matchHo;
        });

        setFilteredProperties(result);
    };


    /** 🔄 Excel 내보내기 */
    const handleExportExcel = async () => {
        if (filteredProperties.length === 0) {
            toast({
                title: "엑셀 내보내기",
                description: "내보낼 데이터가 없습니다.",
            });
            return;
        }

        const XLSX = await import("xlsx");
        const FileSaver = await import("file-saver");

        const rows: Array<Record<string, string | number | null | undefined>> = [];

        filteredProperties.forEach((p) => {
            const d = p.data || {};

            const complex = d.complex_name || "";
            const fullAddress = [
                d.address || "",
                d.address_dong ? `${d.address_dong}동` : "",
                d.address_ho ? `${d.address_ho}호` : "",
            ]
                .filter(Boolean)
                .join(" ");

            const owners = Array.isArray(d.phone_owners) ? d.phone_owners : [];
            const phones = Array.isArray(d.phones) ? d.phones : [];

            const maxLen = Math.max(owners.length, phones.length, 1);

            for (let i = 0; i < maxLen; i++) {
                rows.push({
                    A: complex,
                    B: fullAddress,
                    C: owners[i] || "",
                    D: "",
                    E: "",
                    F: "",
                    G: phones[i] || "",
                });
            }
        });

        const ws = XLSX.utils.json_to_sheet(rows, {
            header: ["A", "B", "C", "D", "E", "F", "G"],
        });

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "전화번호부");

        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const blob = new Blob([wbout], { type: "application/octet-stream" });

        const fileName = `전화번호부_${new Date()
            .toLocaleDateString()
            .replaceAll(".", "")
            .replace(/\s/g, "")}.xlsx`;

        FileSaver.saveAs(blob, fileName);
    };


    return (
        <>
            {/* 헤더 */}
            <div className="page__phone__header">
                <div className="flex flex-row justify-between items-center">
                    <div className="flex flex-row justify-start items-start">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                                if (currentEmployeeId !== null) {
                                    router.push(`/phone/myphone?employeeId=${currentEmployeeId}`);
                                } else {
                                    alert("직원 정보를 찾을 수 없습니다.");
                                }
                            }}
                        >
                            <ChevronLeft />
                        </Button>
                        <div className="flex flex-row justify-start items-end gap-3 pl-4">
                            <Label className="text-3xl font-bold">전화번호 검색</Label>
                            <Label className="text-xl text-gray-500 font-bold">
                                ({`${user?.user_metadata.full_name || "사용자"}`}님의 매물)
                            </Label>
                        </div>
                    </div>

                    {isManager && (
                        <Button
                            type="button"
                            variant="outline"
                            className="font-normal text-white bg-blue-600 hover:text-white hover:bg-blue-400 w-1/6"
                            onClick={handleExportExcel}
                        >
                            엑셀 다운로드
                        </Button>
                    )}

                </div>

                {/* 검색창 */}
                <div className="flex flex-row items-center justify-between mt-4 w-full gap-2">
                    <input
                        type="text"
                        placeholder="주소 or 단지명 or 전화번호 입력"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                    <input
                        type="text"
                        placeholder="동"
                        value={dong}
                        onChange={(e) => setDong(e.target.value)}
                        className="w-28 border border-gray-300 rounded px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                    <input
                        type="text"
                        placeholder="호실"
                        value={ho}
                        onChange={(e) => setHo(e.target.value)}
                        className="w-28 border border-gray-300 rounded px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                    <Button
                        onClick={handleSearch}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded text-sm"
                    >
                        검색
                    </Button>
                </div>
            </div>

            <Separator className="my-3" />

            {/* 본문 */}
            <div className="page__phone__body">
                {filteredProperties.length > 0 ? (
                    <div className="page__phone__body__isData">
                        <table className="w-full text-sm border border-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="border p-2">No</th>
                                    <th className="border p-2">단지명</th>
                                    <th className="border p-2">주소</th>
                                    <th className="border p-2">호칭</th>
                                    <th className="border p-2">연락처</th>
                                    <th className="border p-2">등록자</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredProperties.map((p, idx) => {
                                    const d = p.data || {};

                                    // 🔹 주소 조합
                                    const fullAddress = [
                                        d.address || "",
                                        d.address_dong ? `${d.address_dong}동` : "",
                                        d.address_ho ? `${d.address_ho}호` : "",
                                    ]
                                        .filter(Boolean)
                                        .join(" ");

                                    // 🔹 호칭(소유자/관리자)
                                    const owners =
                                        Array.isArray(d.phone_owners) && d.phone_owners.length > 0
                                            ? d.phone_owners.join("\n")
                                            : "-";

                                    // 🔥 연락처 권한 처리 로직
                                    let phones = "-";

                                    if (isManager) {
                                        // 매니저는 전체 보기 가능
                                        phones =
                                            Array.isArray(d.phones) && d.phones.length > 0
                                                ? d.phones.join("\n")
                                                : "-";
                                    } else {
                                        // 일반 직원 → 자신이 등록한 매물만 표시
                                        if (currentEmployeeId !== null && p.employee_id === currentEmployeeId) {
                                            phones =
                                                Array.isArray(d.phones) && d.phones.length > 0
                                                    ? d.phones.join("\n")
                                                    : "-";
                                        } else {
                                            phones = "-"; // 다른 사람이 올린 매물은 연락처 비공개
                                        }
                                    }

                                    return (
                                        <tr key={p.id} className="hover:bg-gray-50">
                                            <td className="border p-2 text-center">{idx + 1}</td>
                                            <td className="border p-2">{d.complex_name || "-"}</td>
                                            <td className="border p-2">{fullAddress || "-"}</td>

                                            {/* 호칭 */}
                                            <td
                                                className="border p-2 whitespace-pre-line"
                                                dangerouslySetInnerHTML={{
                                                    __html: owners.replace(/\n/g, "<br/>")
                                                }}
                                            ></td>

                                            {/* 연락처 (권한 적용) */}
                                            <td
                                                className="border p-2 whitespace-pre-line"
                                                dangerouslySetInnerHTML={{
                                                    __html: phones.replace(/\n/g, "<br/>")
                                                }}
                                            ></td>

                                            <td className="border p-2 whitespace-nowrap">
                                                {(() => {
                                                    if (p.employee_id) {
                                                        const employee = employees.find(emp => emp.id === p.employee_id);
                                                        return employee ? (employee.kakao_name || employee.name || "-") : "-";
                                                    }
                                                    return "-";
                                                })()}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>

                        </table>
                    </div>
                ) : (
                    <div className="page__phone__body__noData">
                        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                            검색 결과 없음
                        </h3>
                    </div>
                )}
            </div>
        </>
    );
}

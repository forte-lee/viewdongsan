"use client";

import { Button, Separator } from "@/components/ui";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Label } from "@radix-ui/react-label";
import { Employee } from "@/types";
import { useAuthCheck } from "@/hooks/apis";
import { useAtomValue, useAtom } from "jotai";
import { employeesAtom, companyAtom, userEmailAtom } from "@/store/atoms";
import { useUpdateEmployee } from "@/hooks/supabase/manager/useUpdateEmployee";
import { useGetEmployeesAll } from "@/hooks/supabase/manager/useGetEmployeesAll";
import { useGetCompanyId } from "@/hooks/apis/search/useGetCompanyId";
import { supabase } from "@/utils/supabase/client";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Card,
    CardContent,
    CardTitle,
} from "@/components/ui";
import { DeleteEmployeePopup } from "@/components/common/popup/DeleteEmployeePopup";

function EmployeesManagePage() {
    const router = useRouter();
    const { user } = useAuthCheck();
    const [employees, setEmployees] = useAtom(employeesAtom);
    const companyId = useAtomValue(companyAtom);
    const userEmail = useAtomValue(userEmailAtom);
    const { updateEmployee } = useUpdateEmployee();
    const [isLoading, setIsLoading] = useState(true);

    // 현재 사용자가 대표인지 확인 (UUID 우선, 이메일 폴백)
    const currentUserEmployee = user?.id 
        ? employees.find((emp) => emp.supabase_user_id === user.id) || employees.find((emp) => emp.kakao_email === userEmail)
        : employees.find((emp) => emp.kakao_email === userEmail);
    const isCEO = currentUserEmployee?.position === "대표" || currentUserEmployee?.manager === "대표";
    const isManager = currentUserEmployee?.manager === "매니저" || currentUserEmployee?.manager === "대표";
    const canManageEmployees = isCEO || isManager; // 대표 또는 매니저만 퇴사 처리 가능

    // 직원 데이터 로드
    useGetEmployeesAll();

    // companyId 로드 (UUID 기반)
    const { company } = useGetCompanyId(user);

    // 페이지 진입 시 직원 데이터 다시 로드
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

    useEffect(() => {
        // companyId가 로드되면 로딩 완료
        if (companyId || company) {
            setIsLoading(false);
        }
    }, [companyId, company]);

    // company_id를 기준으로 직원 필터링 (퇴사 처리된 직원 제외)
    // 퇴사 처리된 직원: company_id가 null이거나 0이거나, position이 빈 문자열("")인 경우
    const filteredEmployees = companyId
        ? employees.filter((emp) => 
            emp.company_id !== null && 
            emp.company_id !== 0 && 
            emp.company_id === companyId &&
            emp.position !== "" &&
            emp.position !== null
        )
        : [];

    // 직급 순서 정의 (높은 순서부터)
    const positionOrder: Record<string, number> = {
        "대표": 1,
        "실장": 2,
        "부장": 3,
        "팀장": 4,
        "차장": 5,
        "과장": 6,
        "대리": 7,
        "주임": 8,
        "사원": 9,
        "인턴": 10,
        "승인대기": 11,
    };

    // 직급 순서대로 정렬하고 순번 부여
    const sortedAndNumberedEmployees = filteredEmployees
        .map((emp) => ({
            ...emp,
            positionOrder: positionOrder[emp.position || ""] || 999, // 직급이 없으면 맨 뒤로
        }))
        .sort((a, b) => {
            // 직급 순서로 정렬
            if (a.positionOrder !== b.positionOrder) {
                return a.positionOrder - b.positionOrder;
            }
            // 직급이 같으면 ID 순서로 정렬
            return a.id - b.id;
        })
        .map((emp, index) => ({
            ...emp,
            displayNumber: index + 1, // 1번부터 시작하는 순번
        }));

    // 직급 옵션
    const positionOptions = [
        "대표",
        "부장",
        "팀장",
        "실장",
        "과장",
        "차장",
        "대리",
        "주임",
        "사원",
        "인턴",
        "승인대기",
    ];

    // 관리자 옵션
    const managerOptions = ["대표", "매니저", "직원"];

    const handlePositionChange = async (employeeId: number, newPosition: string) => {
        // 현재 직원의 이전 직급 정보 가져오기
        const currentEmployee = employees.find((emp) => emp.id === employeeId);
        const previousPosition = currentEmployee?.position;

        // 같은 값으로 변경하려는 경우 무시
        if (previousPosition === newPosition) {
            return;
        }

        // UI 즉시 업데이트 (낙관적 업데이트)
        setEmployees((prev) =>
            prev.map((emp) =>
                emp.id === employeeId ? { ...emp, position: newPosition } : emp
            )
        );

        const success = await updateEmployee(employeeId, "position", newPosition, previousPosition);
        if (!success) {
            // 업데이트 실패 시 이전 값으로 롤백
            setEmployees((prev) =>
                prev.map((emp) =>
                    emp.id === employeeId ? { ...emp, position: previousPosition || "" } : emp
                )
            );
        } else {
            // 업데이트 성공 시 데이터 다시 로드하여 최신 상태 유지
            const { data, error } = await supabase
                .from("employee")
                .select("*")
                .order("id", { ascending: true });
            
            if (!error && data) {
                setEmployees(data as Employee[]);
            }
        }
    };

    const handleManagerChange = async (employeeId: number, newManager: string) => {
        // 현재 직원의 이전 관리자 정보 가져오기
        const currentEmployee = employees.find((emp) => emp.id === employeeId);
        const previousManager = currentEmployee?.manager;

        // 같은 값으로 변경하려는 경우 무시
        if (previousManager === newManager) {
            return;
        }

        // UI 즉시 업데이트 (낙관적 업데이트)
        setEmployees((prev) =>
            prev.map((emp) =>
                emp.id === employeeId ? { ...emp, manager: newManager } : emp
            )
        );

        const success = await updateEmployee(employeeId, "manager", newManager);
        if (!success) {
            // 업데이트 실패 시 이전 값으로 롤백
            setEmployees((prev) =>
                prev.map((emp) =>
                    emp.id === employeeId ? { ...emp, manager: previousManager || "" } : emp
                )
            );
        } else {
            // 업데이트 성공 시 데이터 다시 로드하여 최신 상태 유지
            const { data, error } = await supabase
                .from("employee")
                .select("*")
                .order("id", { ascending: true });
            
            if (!error && data) {
                setEmployees(data as Employee[]);
            }
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
                            onClick={() => router.push("/admin/adminmanage")}
                        >
                            <ChevronLeft />
                        </Button>
                        <div className="flex flex-row justify-start items-end gap-3 pl-4">
                            <Label className={"text-3xl font-bold"}>직원 관리</Label>
                            <Label className={"text-xl text-gray-500 font-bold"}>(소속 직원 리스트)</Label>
                            <Label className={"text-lg text-blue-600 font-semibold"}>
                                (직원수 : {sortedAndNumberedEmployees.length}명)
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
                    ) : filteredEmployees.length !== 0 ? (
                        <div className="page__manage__body__isData w-full p-4">
                            <div className="flex flex-col gap-2">
                                {sortedAndNumberedEmployees.map((employee: Employee & { displayNumber: number }) => (
                                    <Card key={employee.id} className="hover:shadow-lg transition-shadow">
                                        <CardContent className="p-3">
                                            {/* 첫 번째 줄: 이름, ID | 직급, 관리자 | 이메일, 연락처, 등록일 | 퇴사 버튼 */}
                                            <div className="flex items-start gap-4 w-full justify-between">
                                                {/* 왼쪽: 이름과 ID - 고정 너비 */}
                                                <div className="flex items-start gap-2 min-w-[100px]">
                                                    <span className="text-sm text-gray-500 whitespace-nowrap pt-1">#{employee.displayNumber}</span>
                                                    <div className="flex flex-col">
                                                        <CardTitle className="text-lg m-0 truncate">{employee.name}</CardTitle>
                                                        {employee.kakao_name && (
                                                            <span className="text-xs text-gray-400 mt-0.5">카카오: {employee.kakao_name}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <Separator orientation="vertical" className="h-16" />
                                                
                                                {/* 중간: 직급과 관리자 - 고정 너비 */}
                                                <div className="flex items-start gap-4 min-w-[280px]">
                                                    <div className="flex flex-col gap-1.5 min-w-[140px]">
                                                        <Label className="text-sm font-semibold">직급</Label>
                                                        <Select
                                                            value={employee.position || ""}
                                                            onValueChange={(value) =>
                                                                handlePositionChange(employee.id, value)
                                                            }
                                                            disabled={!isCEO && (employee.position === "대표" || employee.manager === "대표")}
                                                        >
                                                            <SelectTrigger 
                                                                className={`w-full h-9 ${
                                                                    employee.position === "승인대기" 
                                                                        ? "text-red-600 font-semibold border-red-300" 
                                                                        : ""
                                                                }`}
                                                            >
                                                                <SelectValue placeholder="직급 선택" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {positionOptions.map((pos) => (
                                                                    <SelectItem 
                                                                        key={pos} 
                                                                        value={pos}
                                                                        disabled={(pos === "대표" && !isCEO) || pos === "승인대기"}
                                                                        className={pos === "승인대기" ? "text-red-600 font-semibold" : ""}
                                                                    >
                                                                        {pos}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="flex flex-col gap-1.5 min-w-[140px]">
                                                        <Label className="text-sm font-semibold">관리자</Label>
                                                        <Select
                                                            value={employee.manager || ""}
                                                            onValueChange={(value) =>
                                                                handleManagerChange(employee.id, value)
                                                            }
                                                            disabled={!isCEO && (employee.position === "대표" || employee.manager === "대표")}
                                                        >
                                                            <SelectTrigger className="w-full h-9">
                                                                <SelectValue placeholder="관리자 선택" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {managerOptions.map((mgr) => (
                                                                    <SelectItem 
                                                                        key={mgr} 
                                                                        value={mgr}
                                                                        disabled={mgr === "대표" && !isCEO}
                                                                    >
                                                                        {mgr}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                                
                                                <Separator orientation="vertical" className="h-16" />
                                                
                                                {/* 오른쪽: 이메일, 연락처, 등록일 - 고정 너비 */}
                                                <div className="flex flex-col gap-1 min-w-[280px]">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-gray-700 whitespace-nowrap">이메일 :</span>
                                                        <span className="text-sm text-gray-700 truncate">{employee.email}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-gray-700 whitespace-nowrap">연락처 :</span>
                                                        <span className="text-sm text-gray-700">{employee.phone || "-"}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-gray-700 whitespace-nowrap">등록일 :</span>
                                                        <span className="text-sm text-gray-700">
                                                            {employee.enter_date
                                                                ? new Date(employee.enter_date).toLocaleDateString("ko-KR")
                                                                : "-"}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* 퇴사 버튼 - 대표 또는 매니저만 표시, 대표 직급은 비활성화 */}
                                                {canManageEmployees && (
                                                    <div className="flex items-center flex-shrink-0">
                                                        <DeleteEmployeePopup
                                                            employeeId={employee.id}
                                                            employeeName={employee.name}
                                                            disabled={employee.position === "대표" || employee.manager === "대표"}
                                                            onDelete={() => {
                                                                // 직원 리스트 새로고침
                                                                const loadEmployees = async () => {
                                                                    try {
                                                                        const { data, error } = await supabase
                                                                            .from("employee")
                                                                            .select("*")
                                                                            .order("id", { ascending: true });

                                                                        if (error) {
                                                                            console.error("❌ 직원 정보 로드 실패:", error);
                                                                            return;
                                                                        }
                                                                        setEmployees(data as Employee[]);
                                                                    } catch (error) {
                                                                        console.error("❌ 직원 정보 로드 중 오류:", error);
                                                                    }
                                                                };
                                                                loadEmployees();
                                                            }}
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                disabled={employee.position === "대표" || employee.manager === "대표"}
                                                                className="whitespace-nowrap font-normal text-rose-600 hover:text-rose-600 hover:bg-red-50 text-xs disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-rose-600 disabled:hover:bg-transparent"
                                                            >
                                                                퇴사
                                                            </Button>
                                                        </DeleteEmployeePopup>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
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

export default EmployeesManagePage;


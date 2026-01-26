"use client";

import { Button, Label, Separator } from "@/components/ui";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { guestsAtom, employeesAtom } from "@/store/atoms";
import { supabase } from "@/utils/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuthCheck } from "@/hooks/apis";
import { useAtomValue } from "jotai";

function GuestPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const employeeIdParam = searchParams.get("employeeId");

    const [guests, setGuests] = useAtom(guestsAtom); // ✅ 전역 상태 사용
    const { user } = useAuthCheck();
    const employees = useAtomValue(employeesAtom);
    const [isModalOpen, setIsModalOpen] = useState(false); // ✅ 모달 상태 추가
    const [sortKey, setSortKey] = useState<"create_at">("create_at"); // 기본 정렬 기준
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc"); // 기본 정렬 순서

    const [filter, setFilter] = useState<{ types: string[]; propertys: string[] }>({
        types: [],
        propertys: [],
      });
    
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
                router.replace(`/guest?employeeId=${loggedInEmployeeId}`);
            }
        } else if (!employeeIdParam && loggedInEmployeeId !== null) {
            // URL 파라미터가 없으면 로그인한 사용자의 employee_id로 리다이렉트
            router.replace(`/guest?employeeId=${loggedInEmployeeId}`);
        }
    }, [employeeIdParam, loggedInEmployeeId, router]);

    // ✅ 새로고침 시 Atom 데이터가 없으면 Supabase에서 가져오기 (employee_id 기반)
    useEffect(() => {
        const fetchGuests = async () => {
            if (currentEmployeeId === null) return;

            try {
                const { data, error } = await supabase
                    .from("guest")
                    .select("*")
                    .eq("employee_id", currentEmployeeId);

                if (error) throw error;
                if (data.length > 0) {
                    setGuests(data); // ✅ Atom에 데이터 저장
                }
            } catch (error) {
                console.error("🚨 손님 데이터 가져오기 실패:", error);
                toast({
                    variant: "destructive",
                    title: "에러 발생",
                    description: "손님 데이터를 가져오는 중 문제가 발생했습니다.",
                });
            }
        };

        if (guests.length === 0) {
            fetchGuests(); // ✅ Atom 데이터가 없을 때만 API 호출
        }
    }, [currentEmployeeId]);

    // 손님 등록 버튼 클릭 시 모달 열기
    const handleRegister = () => {
        setIsModalOpen(true);
    };

    // 모달 닫기 함수
    const closeModal = () => {
        setIsModalOpen(false);
    };

    // ✅ 정렬 로직
    const sortedGuests = [...guests].sort((a, b) => {
        const dateA = new Date(a[sortKey]).getTime();
        const dateB = new Date(b[sortKey]).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    return (
        <>
            <div className="page__guest__header">
                <div className="flex flex-row justify-between items-center">
                    <Button
                        variant={"outline"}
                        size={"icon"}
                        onClick={() => router.push("/guest")}
                    >
                        <ChevronLeft />
                        
                    </Button>
                    <div className="flex flex-row justify-start items-end gap-3">
                        <Label className={"text-3xl font-bold"}>손님 관리</Label>
                        <Label className={"text-xl text-gray-500 font-bold"}>(내 손님 리스트)</Label>
                    </div>

                    <Button
                        variant={"outline"}
                        className={"font-normal text-white bg-blue-600 hover:text-white hover:bg-blue-400 w-1/6"}
                        onClick={handleRegister} // ✅ 모달 열기
                    >
                        새 손님등록
                    </Button>
                </div>
                <div className="page__guest__header__top">
                    <div className="flex flex-row justify-between items-center">
                        
                        {/* 정렬 UI */}
                        <div className="flex items-center justify-end gap-4">
                            <select
                                value={sortKey}
                                onChange={(e) => setSortKey(e.target.value as "create_at")}
                                className="border border-gray-300 p-2 rounded"
                            >
                                <option value="create_at">등록일</option>
                            </select>
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                                className="border border-gray-300 p-2 rounded"
                            >
                                <option value="desc">내림차순</option>
                                <option value="asc">오름차순</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            <Separator className="my-1" />

            <div className="page__guest__body">
                <div className="flex flex-col w-full items-center justify-start gap-1">
                    {sortedGuests.length !== 0 ? (
                        <div className="page__guest__body__isData">
                            {/* TODO: 손님 리스트 렌더링 */}
                        </div>
                    ) : (
                        <div className="page__guest__body__noData">
                            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                                등록된 손님이 없습니다.
                            </h3>
                            <small className="text-sm font-medium leading-none text-[#6d6d6d] mt-3 mb-7">
                                손님등록하기
                            </small>
                            <button onClick={handleRegister}>
                                <Image
                                    src={"/assets/images/button.svg"}
                                    width={74}
                                    height={74}
                                    alt="rounded-button"
                                />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default GuestPage;

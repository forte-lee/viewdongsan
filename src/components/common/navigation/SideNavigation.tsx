"use client";

import { useAuth, useGetCompanyId } from "@/hooks/apis";
import { Button } from "@/components/ui";
import { useRouter, usePathname } from "next/navigation";
import { useCompanyInfo } from "@/hooks/apis/search/useCompanyInfo";
import { Separator } from "@radix-ui/react-separator";

// ⭐ Atom values
import { useAtomValue } from "jotai";
import {
    employeesAtom,
    userEmailAtom,
    guestNewPropertiesAtom,
    guestPropertysAtom,
    guestsAtom
} from "@/store/atoms";

function SideNavigation() {
    const router = useRouter();
    const pathname = usePathname();
    const { user } = useAuth();

    // 🔥 Atom에서 읽기
    const allEmployees = useAtomValue(employeesAtom);
    const userEmail = useAtomValue(userEmailAtom);
    
    // 회사 ID 가져오기 (UUID 기반)
    const { company } = useGetCompanyId(user);
    
    // 소속 부동산 직원만 필터링
    const employees = company !== null
        ? allEmployees.filter((emp) => emp.company_id === company)
        : [];
    
    // 현재 사용자의 employee_id 찾기 (UUID 우선, 이메일 폴백)
    const currentEmployee = (() => {
        if (user?.id) {
            const employee = allEmployees.find(emp => emp.supabase_user_id === user.id);
            if (employee) return employee;
        }
        // 폴백: 이메일로 찾기
        if (userEmail) {
            const employee = allEmployees.find(emp => 
                emp.kakao_email === userEmail || emp.email === userEmail
            );
            if (employee) return employee;
        }
        return null;
    })();
    const currentEmployeeId = currentEmployee?.id ?? null;

    // 대표만 직원 리스트를 볼 수 있음
    const isRepresentative = currentEmployee?.manager === "대표";

    const guestNewProperties = useAtomValue(guestNewPropertiesAtom);
    const guestPropertys = useAtomValue(guestPropertysAtom);
    const guests = useAtomValue(guestsAtom);
    
    // ✅ 실제 NEW 매물이 있는지 확인 (현재 로그인한 사용자의 employee_id와 일치하고 알림이 ON인 것만)
    const hasNewItems = (() => {
        // 빈 객체인지 확인
        const keys = Object.keys(guestNewProperties);
        if (keys.length === 0) return false;
        
        if (currentEmployeeId === null) return false; // employee_id가 없으면 NEW 없음
        
        // 현재 로그인한 사용자의 employee_id와 일치하고 알림이 ON인 guestproperty만 확인
        return Object.entries(guestNewProperties).some(([guestpropertyId, propertyIds]) => {
            // 배열이 존재하고 길이가 0보다 커야 함
            if (!Array.isArray(propertyIds) || propertyIds.length === 0) return false;
            
            // guestproperty → guest → employee_id 확인
            const gp = guestPropertys.find(p => p.id === Number(guestpropertyId));
            if (!gp) return false;
            
            const guest = guests.find(g => g.id === gp.guest_id);
            return guest?.employee_id === currentEmployeeId && gp?.alarm === true;
        });
    })();
    
    // ✅ 디버깅: N 표시 상태 확인
    if (process.env.NODE_ENV === 'development') {
        const nonEmptyEntries = Object.entries(guestNewProperties).filter(
            ([, ids]) => Array.isArray(ids) && ids.length > 0
        );
        if (hasNewItems || nonEmptyEntries.length > 0) {
            console.log("🔍 N 표시 디버깅:", {
                guestNewProperties,
                totalKeys: Object.keys(guestNewProperties).length,
                nonEmptyEntries: nonEmptyEntries.length,
                entries: nonEmptyEntries,
                hasNewItems,
            });
        }
    }
    
    // ✅ "내 손님 리스트" 페이지에 있을 때는 N 배지를 표시하지 않음
    const isGuestMylistPage = pathname?.startsWith("/guest/mylist");
    const hasNew = hasNewItems && !isGuestMylistPage;

    const { companyName, isRegistrationApproved } = useCompanyInfo();

    // 부동산 등록 승인되지 않은 경우: 메뉴 대신 "승인 대기중" 버튼만 표시
    const showApprovedMenus = isRegistrationApproved === true;

    return (
        <aside className="page__aside">
            <div className="flex flex-col h-full gap-3">
                <Button
                    variant={"outline"}
                    className={"font-normal bg-blue-50 text-blue-700 hover:text-white hover:bg-blue-600"}
                    onClick={() => router.push(`/`)}
                >
                    외부 페이지로 이동
                </Button>

                <Separator className="my-1" />

                {showApprovedMenus ? (
                    <>
                        {/* ⭐ 내 손님 리스트 버튼 + NEW 뱃지 */}
                        <div className="relative w-full">
                            <Button
                                variant={"secondary"}
                                className="relative w-full font-normal text-white bg-blue-600 hover:text-white hover:bg-blue-400"
                                onClick={() => {
                                    if (currentEmployeeId !== null) {
                                        router.push(`/guest/mylist?employeeId=${currentEmployeeId}`);
                                    } else {
                                        alert("직원 정보를 찾을 수 없습니다. 로그인을 확인해주세요.");
                                    }
                                }}
                            >
                                <span className="absolute left-1/2 -translate-x-1/2">
                                    내 손님 리스트
                                </span>

                                {hasNew && (
                                    <span className="absolute right-3 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                                        N
                                    </span>
                                )}
                            </Button>
                        </div>

                        <Button
                            variant={"secondary"}
                            className={"font-normal text-white bg-blue-600 hover:text-white hover:bg-blue-400"}
                            onClick={() => {
                                if (currentEmployeeId !== null) {
                                    router.push(`/phone/myphone?employeeId=${currentEmployeeId}`);
                                } else {
                                    alert("직원 정보를 찾을 수 없습니다. 로그인을 확인해주세요.");
                                }
                            }}
                        >
                            전화번호 검색
                        </Button>

                        <Button
                            variant={"secondary"}
                            className={"font-normal text-white bg-blue-600 hover:text-white hover:bg-blue-400"}
                            onClick={() => {
                                if (currentEmployeeId !== null) {
                                    router.push(`/manage/mylist?employeeId=${currentEmployeeId}`);
                                } else {
                                    alert("직원 정보를 찾을 수 없습니다. 로그인을 확인해주세요.");
                                }
                            }}
                        >
                            내 매물 리스트
                        </Button>

                        <Separator className="my-1" />

                        <Button
                            variant={"secondary"}
                            className={"font-normal text-white bg-blue-600 hover:text-white hover:bg-blue-400"}
                            onClick={() => router.push(`/manage/`)}
                        >
                            전체 매물 리스트
                        </Button>
                    </>
                ) : (
                    <Button
                        variant={"secondary"}
                        className={"font-normal text-amber-700 bg-amber-100 hover:bg-amber-200 cursor-not-allowed"}
                        disabled
                    >
                        승인 대기중
                    </Button>
                )}

                {/* 🔥 대표만 직원별 매물리스트 노출 (승인된 경우에만) */}
                {isRepresentative && showApprovedMenus && (
                    <div className="flex flex-col mt-4 gap-2">
                        <small className="text-sm font-medium leading-none text-[#a6a6a6]">
                            <li className="bg-[#f5f5f5] min-h-9 flex items-center gap-2 py-2 px-[10px] rounded-sm text-sm text-neutral-400">
                                <span className="text-neutral-700">
                                    {companyName ? `${companyName} 매물리스트` : "매물리스트"}
                                </span>
                            </li>
                        </small>

                        <ul className="flex flex-col">
                            {employees.length > 0 ? (
                                employees.map((employee) => (
                                    <li
                                        key={employee.id}
                                        className="cursor-pointer text-xs p-2 border-b hover:bg-gray-200"
                                        onClick={() =>
                                            router.push(
                                                `/manage/otherlist?employeeId=${employee.id}`
                                            )
                                        }
                                    >
                                        {employee.name}
                                    </li>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500">직원 정보가 없습니다.</p>
                            )}
                        </ul>
                    </div>
                )}
            </div>
        </aside>
    );
}

export { SideNavigation };

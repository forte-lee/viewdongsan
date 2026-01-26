"use client";

import { Button, Separator } from '@/components/ui';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCreateProperty, useAuthCheck } from '@/hooks/apis';
import { useAtomValue } from 'jotai';
import { employeesAtom } from '@/store/atoms';


function RegisterPage() {
    const router = useRouter();
    const { user } = useAuthCheck();
    const employees = useAtomValue(employeesAtom);
    const useCreatePropertyCard = useCreateProperty();
    
    // 현재 사용자의 employee_id 찾기 (UUID 우선)
    const currentEmployeeId = (() => {
        if (user?.id) {
            const employee = employees.find(emp => emp.supabase_user_id === user.id);
            if (employee) return employee.id;
        }
        return null;
    })();

    // 타입 선택 시 즉시 propertyCard 생성
    const handleTypeClick = (type: string) => {   
        useCreatePropertyCard(type);
    };

    return (
        <>
            {/* 헤더부분 */}
            <div className="page__manage__header">
                <div>
                    <Button 
                        variant={"outline"} 
                        size={"icon"}                         
                        onClick={() => {
                            if (currentEmployeeId !== null) {
                                router.push(`/manage/mylist?employeeId=${currentEmployeeId}`);
                            } else {
                                alert("직원 정보를 찾을 수 없습니다.");
                            }
                        }}
                        >
                        <ChevronLeft />
                    </Button>
                </div>

                <div className="page__manage__header__top">
                    <label className={"text-3xl font-bold"}>매물 등록</label>
                    <Separator className="my-3" />
                </div>
            </div>

            {/* 바디부분 */}
            <div className="page__manage__body">
                <div className={"justify-center grid grid-cols-3 gap-6"}>
                    {[
                        { type: "아파트", label: "아파트" },
                        { type: "오피스텔", label: "오피스텔" },
                        { type: "공동주택(아파트 외)", label: "공동주택(아파트 외)" },
                        { type: "단독주택(임대)", label: "단독주택(임대)" },
                        { type: "상업/업무/공업용", label: "상업/업무/공업용" },
                        { type: "건물", label: "건물(통임대, 통매매)" },
                        { type: "토지", label: "토지" },
                    ].map(({type, label}) => (
                        <Button
                            variant={"outline"}
                            key={type}
                            className={"p-5 w-60 h-52 text-2xl font-bold text-blue-700 border-blue-700 hover:bg-blue-100 hover:text-blue-700 cursor-pointer"}
                            onClick={() => handleTypeClick(type)}
                        >
                            {label}
                        </Button>
                    ))}
                </div>
            </div>
        </>
    )
}

export default RegisterPage
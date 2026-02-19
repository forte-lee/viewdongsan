"use client";

import { Button, Separator } from '@/components/ui';
import { ChevronLeft, Building2, Building, Home, Landmark, Warehouse, TreePine } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCreateProperty, useAuthCheck } from '@/hooks/apis';
import { useAtomValue } from 'jotai';
import { employeesAtom } from '@/store/atoms';

const PROPERTY_TYPES = [
    { type: "아파트", label: "아파트", icon: Building2 },
    { type: "오피스텔", label: "오피스텔", icon: Building },
    { type: "공동주택(아파트 외)", label: "공동주택(아파트 외)", icon: Home },
    { type: "단독주택(임대)", label: "단독주택(임대)", icon: Home },
    { type: "상업/업무/공업용", label: "상업/업무/공업용", icon: Warehouse },
    { type: "건물", label: "건물(통임대, 통매매)", icon: Landmark },
    { type: "토지", label: "토지", icon: TreePine },
] as const;

function RegisterPage() {
    const router = useRouter();
    const { user } = useAuthCheck();
    const employees = useAtomValue(employeesAtom);
    const createProperty = useCreateProperty();
    
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
        createProperty(type);
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
            <div className="page__manage__body !pt-2 !pb-2">
                <div className="w-full max-w-4xl grid grid-cols-2 sm:grid-cols-3 gap-4 items-start content-start">
                    {PROPERTY_TYPES.map(({ type, label, icon: Icon }) => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => handleTypeClick(type)}
                            className="group flex flex-col h-72 rounded-xl border-2 border-blue-500 bg-white overflow-hidden
                                hover:border-blue-600 hover:bg-blue-50/50 hover:shadow-md
                                transition-all duration-200 cursor-pointer text-left"
                        >
                            <div className="flex-[2] min-h-0 w-full flex items-center justify-center py-8 px-4 bg-blue-50/80 group-hover:bg-blue-100/80">
                                <Icon className="w-24 h-24 text-blue-600 group-hover:text-blue-700 flex-shrink-0" strokeWidth={1.5} />
                            </div>
                            <div className="flex-[1] min-h-[52px] flex items-center justify-center px-3 py-2 bg-white border-t border-gray-300 overflow-hidden">
                                <span className="text-lg font-semibold text-gray-800 group-hover:text-blue-700 break-words text-center line-clamp-2">
                                    {label}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </>
    )
}

export default RegisterPage
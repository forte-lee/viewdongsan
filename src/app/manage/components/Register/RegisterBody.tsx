"use client";

import { Button, ScrollArea, Separator } from "@/components/ui";
import { useAuthCheck } from "@/hooks/apis";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { ReactNode, useState, useRef } from "react";
import { useAtomValue } from "jotai";
import { employeesAtom } from "@/store/atoms";

interface RegisterBodyProps {
    handleSubmit: (temp: boolean) => Promise<void>; // ✅ handleSubmit이 Promise를 반환하도록 수정
    missingFields: string[]; // ✅ 누락된 필수 입력 항목 리스트
    children: ReactNode; // ✅ children 속성 타입 정의
}

function RegisterBody({ children, handleSubmit, missingFields }: RegisterBodyProps) {
    const router = useRouter();
    const { user } = useAuthCheck(); // ✅ 로그인 상태 및 사용자 정보 확인
    const employees = useAtomValue(employeesAtom);
    const [isSubmitting, setIsSubmitting] = useState(false); // ✅ 하단 버튼 로딩 상태
    
    // 현재 사용자의 employee_id 찾기 (UUID 우선)
    const currentEmployeeId = (() => {
        if (user?.id) {
            const employee = employees.find(emp => emp.supabase_user_id === user.id);
            if (employee) return employee.id;
        }
        return null;
    })();
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    // 필드명을 기반으로 해당 섹션으로 스크롤하는 함수
    const scrollToField = (fieldName: string) => {
        // 1. 바깥 스크롤을 최상단으로 이동
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // page__manage 요소가 있으면 그것도 최상단으로
        const pageManage = document.querySelector('.page__manage');
        if (pageManage) {
            pageManage.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // 필드명과 실제 DOM에서 찾을 텍스트 매핑
        const fieldMap: Record<string, string> = {
            "매물종류": "매물종류",
            "용도": "용도",
            "용도지역": "용도지역",
            "단지명": "단지명",
            "소재지": "소재지",
            "관리처": "관리처",
            "연락처": "연락처",
            "거래종류": "거래종류",
            "거래금액": "거래금액",
            "관리비": "관리비",
            "입주예정일": "입주예정일",
            "입주가능일": "입주가능일",
            "참고면적": "참고면적",
            "대지면적": "대지면적",
            "연면적": "연면적",
            "층": "층",
            "건축물일자": "건축물일자",
            "반려동물": "반려동물",
            "구조": "구조",
            "주차가능여부": "주차가능여부",
            "주차방식": "주차방식",
            "총주차": "총주차",
            "위반사항": "위반사항",
            "특이사항(외부노출)": "특이사항",
            "옵션": "옵션",
            "매물 사진": "매물사진",
            "평가": "평가",
            "임차인수": "임차인수",
            "총보증금": "총보증금",
            "총월세": "총월세",
            "총관리비": "총관리비",
        };

        const searchText = fieldMap[fieldName] || fieldName;
        
        // 모든 Label 요소를 찾아서 텍스트가 포함된 것을 찾기
        const labels = Array.from(document.querySelectorAll('label'));
        const targetElement = labels.find((el) => {
            const text = el.textContent || '';
            // 필수 마크를 제외하고 검색 텍스트가 포함되어 있는지 확인
            const cleanText = text.replace(/\s+/g, '').replace('필수', '');
            return cleanText.includes(searchText.replace(/\s+/g, ''));
        });

        if (targetElement) {
            // 부모 섹션 찾기 (flex-col p-3 클래스를 가진 가장 가까운 부모)
            let parent = targetElement.parentElement;
            let depth = 0;
            let sectionElement: HTMLElement | null = null;
            
            while (parent && depth < 10) {
                const classList = Array.from(parent.classList);
                if (classList.some(cls => cls.includes('flex-col') || cls.includes('p-3'))) {
                    sectionElement = parent as HTMLElement;
                    break;
                }
                parent = parent.parentElement;
                depth++;
            }

            const target = sectionElement || targetElement;

            // 바깥 스크롤이 먼저 이동한 후 내부 스크롤 이동
            setTimeout(() => {
                // 모든 가능한 스크롤 컨테이너 찾기
                const allContainers: Array<{ element: HTMLElement; type: string }> = [];
                
                // 1. ScrollArea Viewport
                const viewports = document.querySelectorAll('[data-radix-scroll-area-viewport]');
                viewports.forEach(vp => {
                    if (vp.contains(target)) {
                        allContainers.push({ element: vp as HTMLElement, type: 'ScrollArea Viewport' });
                    }
                });
                
                // 2. overflow-auto 컨테이너
                const overflowContainers = document.querySelectorAll('.overflow-auto');
                overflowContainers.forEach(container => {
                    if (container.contains(target) && !allContainers.some(c => c.element === container)) {
                        allContainers.push({ element: container as HTMLElement, type: 'overflow-auto' });
                    }
                });
                
                // 3. 타겟의 부모 중 스크롤 가능한 요소
                let element: HTMLElement | null = target;
                while (element) {
                    const style = window.getComputedStyle(element);
                    const hasScroll = (style.overflowY === 'auto' || style.overflowY === 'scroll') &&
                                     element.scrollHeight > element.clientHeight;
                    
                    if (hasScroll && !allContainers.some(c => c.element === element)) {
                        allContainers.push({ element, type: 'parent with overflow' });
                    }
                    element = element.parentElement;
                }
                
                console.log('찾은 모든 스크롤 컨테이너:', allContainers.map(c => ({
                    type: c.type,
                    scrollHeight: c.element.scrollHeight,
                    clientHeight: c.element.clientHeight,
                    scrollTop: c.element.scrollTop,
                    canScroll: c.element.scrollHeight > c.element.clientHeight
                })));
                
                // 가장 적합한 컨테이너 선택 (타겟을 포함하고 스크롤 가능)
                const suitableContainer = allContainers.find(c => 
                    c.element.contains(target) && 
                    c.element.scrollHeight > c.element.clientHeight
                );
                
                if (suitableContainer) {
                    const container = suitableContainer.element;
                    const containerRect = container.getBoundingClientRect();
                    const targetRect = target.getBoundingClientRect();
                    
                    const currentScroll = container.scrollTop;
                    const distance = targetRect.top - containerRect.top;
                    const newScrollTop = Math.max(0, currentScroll + distance - 20);
                    
                    console.log('스크롤 시도:', {
                        type: suitableContainer.type,
                        currentScroll,
                        distance,
                        newScrollTop,
                        maxScroll: container.scrollHeight - container.clientHeight
                    });
                    
                    // 여러 방법으로 강제 스크롤 (scrollIntoView 사용 안 함 - passive 이벤트 에러 방지)
                    container.scrollTop = newScrollTop;
                    
                    // requestAnimationFrame으로 부드러운 스크롤 적용
                    requestAnimationFrame(() => {
                        container.scrollTop = newScrollTop;
                        requestAnimationFrame(() => {
                            container.scrollTop = newScrollTop;
                            // scrollTo는 사용하되, scrollIntoView는 사용하지 않음
                            container.scrollTo({
                                top: newScrollTop,
                                behavior: 'smooth'
                            });
                        });
                    });
                } else {
                    console.log('적합한 컨테이너 없음, 수동 스크롤 시도');
                    // scrollIntoView 대신 수동으로 스크롤 계산
                    const targetRect = target.getBoundingClientRect();
                    const scrollY = window.scrollY + targetRect.top - 20;
                    window.scrollTo({
                        top: scrollY,
                        behavior: 'smooth'
                    });
                }
            }, 300); // 바깥 스크롤이 이동할 시간을 기다림
        }
    };

    // ✅ 등록하기 버튼
    const handleRegister = async () => {
        if (missingFields.length > 0) {
            alert(`⚠️ 필수 입력 항목을 모두 입력해주세요:\n\n${missingFields.join(", ")}`);
            // 알림이 닫힌 후 첫 번째 미입력 항목으로 스크롤
            setTimeout(() => {
                if (missingFields.length > 0) {
                    scrollToField(missingFields[0]);
                }
            }, 100);
            return; // 🚫 필수 입력값이 누락되었으면 등록 중지
        }

        try {
            setIsSubmitting(true); // ✅ 등록 시작
            await handleSubmit(true); // ✅ 정식 등록
            toast({
                variant: "default",
                title: "등록 완료",
                description: "매물이 성공적으로 등록되었습니다.",
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "등록 실패",
                description: "매물 등록 중 오류가 발생했습니다.",
            });
            console.error(error);
        } finally {
            if (currentEmployeeId !== null) {
                router.push(`/manage/mylist?employeeId=${currentEmployeeId}`);
            }
            setIsSubmitting(false); // ✅ 등록 완료
        }
    };

    // ✅ 임시 저장 버튼
    const handleTempSave = async () => {
        try {
            setIsSubmitting(true);
            await handleSubmit(false); // ✅ 임시 저장
            toast({
                variant: "default",
                title: "임시 저장 완료",
                description: "매물이 임시 저장되었습니다.",
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "저장 실패",
                description: "임시 저장 중 오류가 발생했습니다.",
            });
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            {/* 바디 부분 */}
            <div className="flex w-full h-full pr-4 pl-4 overflow-auto max-h-[75vh]">
                {/* 스크롤 가능한 영역 */}
                <ScrollArea ref={scrollAreaRef} className="flex-1 w-full pr-4 pl-4">
                    <div className="flex w-full flex-col justify-start pb-10"> {/* 아래 버튼 공간 여유 */}
                        {children}
                    </div>

                    <div className="m-4"></div>
                    <Separator className="w-full m-2"></Separator>
                    <div className="m-2"></div>

                    {/* 버튼 영역 */}
                    <div className="flex justify-center items-center gap-4">
                        {/* 임시 저장 버튼 */}
                        <Button
                            variant={"outline"}
                            className="text-gray-600 bg-gray-50 hover:text-gray-600 hover:bg-gray-200"
                            onClick={handleTempSave}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "저장 중..." : "임시저장"}
                        </Button>

                        {/* 등록하기 버튼 */}
                        <Button
                            variant={"outline"}
                            className="text-white bg-blue-700 hover:text-blue-600 hover:bg-blue-200"
                            onClick={handleRegister}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "등록 중..." : "등록하기"}
                        </Button>
                    </div>

                    <div className="m-4"></div>
                </ScrollArea>
            </div>
        </div>
    );
}

export { RegisterBody };

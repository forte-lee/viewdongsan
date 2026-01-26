"use client";

import { SideNavigation } from "@/components/common/navigation/SideNavigation";
import { useEffect, useState } from "react";

function PhoneLayout({ children }: { children: React.ReactNode }) {
    const [isPopup, setIsPopup] = useState<boolean | undefined>(undefined); // 초기값 undefined로 설정 (깜빡임 방지)

    useEffect(() => {
        // window.opener가 있으면 팝업
        setIsPopup(typeof window !== "undefined" && window.opener !== null);
    }, []);

    if (isPopup === undefined) return null; // 렌더링 전 깜빡임 방지

    return (
        <div className="page">
            {/* 팝업이 아닐 때만 사이드 내비게이션 표시 */}
            {!isPopup && <SideNavigation />}

            {/* 메인 영역 */}
            <main className={isPopup ? "flex flex-col w-full h-full" : "page__phone"}>
                {children}
            </main>
        </div>
    );
}

export default PhoneLayout;

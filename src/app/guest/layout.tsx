"use client";

import { SideNavigation } from "@/components/common/navigation/SideNavigation";
import { useEffect, useState } from "react";

function GuestLayout({ children }: { children: React.ReactNode }) {
    const [isPopup, setIsPopup] = useState<boolean | undefined>(undefined); // ✅ 초기값을 undefined로 설정

    useEffect(() => {
        setIsPopup(typeof window !== "undefined" && window.opener !== null);
    }, []);

    // ✅ isPopup이 아직 설정되지 않았다면 아무것도 렌더링하지 않음 (잠깐 보였다가 사라지는 현상 방지)
    if (isPopup === undefined) return null;

    return (
        <div className="page">
            {!isPopup && <SideNavigation />} {/* ✅ 팝업이 아닐 때만 사이드바 표시 */}
            <main className={isPopup ? "flex flex-col w-full h-full" : "page__guest" }>{children}</main>
        </div>
    );
}

export default GuestLayout;

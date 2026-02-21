"use client";

import { SiteAdminSideNavigation } from "@/components/common/navigation/SiteAdminSideNavigation";
import { useCheckSiteAdminAccess } from "@/hooks/apis/manager/useCheckSiteAdminAccess";
import LayoutInitializer from "@/components/common/etc/LayoutInitializer";
import { useEffect, useState } from "react";

function SiteAdminLayout({ children }: { children: React.ReactNode }) {
    const { isAuthorized } = useCheckSiteAdminAccess();
    const [isPopup, setIsPopup] = useState(false);

    useEffect(() => {
        setIsPopup(typeof window !== "undefined" && window.opener !== null);
    }, []);

    if (isAuthorized === null) {
        return (
            <div className="flex items-center justify-center w-full h-screen">
                <div className="text-xl font-semibold">로딩 중...</div>
            </div>
        );
    }

    if (isAuthorized === false) {
        return (
            <div className="flex items-center justify-center w-full h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">접근 권한 없음</h2>
                    <p className="text-gray-600">사이트 관리자 페이지는 지정된 관리자만 접근할 수 있습니다.</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <LayoutInitializer />
            <div className="page">
                {!isPopup && <SiteAdminSideNavigation />}
                <main className={`page__admin relative ${isPopup ? "!ml-0 w-full" : ""}`}>{children}</main>
            </div>
        </>
    );
}

export default SiteAdminLayout;

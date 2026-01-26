"use client";

import { AdminSideNavigation } from "@/components/common/navigation/AdminSideNavigation";
import { useCheckAdminAccess } from "@/hooks/apis/manager/useCheckAdminAccess";
import LayoutInitializer from "@/components/common/etc/LayoutInitializer";

function AdminLayout({ children }: { children: React.ReactNode }) {
    const { isAuthorized } = useCheckAdminAccess();

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
                    <p className="text-gray-600">관리자 페이지는 매니저 또는 대표만 접근할 수 있습니다.</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <LayoutInitializer />
            <div className="page">
                <AdminSideNavigation />
                <main className="page__admin relative">{children}</main>
            </div>
        </>
    );
}

export default AdminLayout;


"use client";

import { SideNavigation } from "@/components/common/navigation/SideNavigation";
import { useCompanyInfo } from "@/hooks/apis/search/useCompanyInfo";
import { Clock } from "lucide-react";

function ManageLayout({ children }: { children: React.ReactNode }) {
    const { isRegistrationApproved } = useCompanyInfo();

    // 부동산 등록 미승인 시: 매물 관리 내용 대신 안내 문구만 표시
    const showContent = isRegistrationApproved === true;

    return (
        <div className="page">
            <SideNavigation />
            <main className="page__manage relative">
                {showContent ? (
                    children
                ) : (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full gap-6 px-4">
                        <div className="flex flex-col items-center gap-4 p-8 rounded-xl bg-amber-50/80 border border-amber-200/60 max-w-md">
                            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-amber-100">
                                <Clock className="w-8 h-8 text-amber-600" strokeWidth={2} />
                            </div>
                            <p className="text-2xl font-bold text-amber-800">승인 대기중입니다.</p>
                            <p className="text-sm text-amber-700/90 text-center leading-relaxed">
                                부동산 등록 승인 후 매물 관리 서비스를 이용하실 수 있습니다.
                                <br />
                                잠시만 기다려 주세요.
                            </p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default ManageLayout;
"use client";

import { Button } from "@/components/ui";
import { supabase } from "@/utils/supabase/client";
import { Label } from "@radix-ui/react-label";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { useAuthCheck, useCompanyInfo } from "@/hooks/apis";
import { useAtomValue } from "jotai";
import { uploadInProgressCountAtom, uploadInProgressPropertyIdsAtom, employeesAtom, userEmailAtom } from "@/store/atoms";
import { Loader2 } from "lucide-react";

function CommonHeader() {
    const router = useRouter();
    const pathname = usePathname();
    const { isChecking, user } = useAuthCheck(); // 로그인 상태 및 사용자 정보 확인
    const { companyName } = useCompanyInfo(); // 회사 이름 가져오기
    const uploadInProgressCount = useAtomValue(uploadInProgressCountAtom);
    const uploadInProgressPropertyIds = useAtomValue(uploadInProgressPropertyIdsAtom);
    const employees = useAtomValue(employeesAtom);
    const userEmail = useAtomValue(userEmailAtom);
    const isUploading = uploadInProgressCount > 0;

    // 내부 페이지인지 확인 (메인 페이지, 인증 페이지, 공개 페이지가 아닌 경우)
    const isInternalPage = pathname && !["/", "/auth", "/auth/callback", "/property-ad", "/property-detail", "/property-main-detail"].includes(pathname) && !pathname.startsWith("/tools");
    
    // 헤더 제목 결정
    const headerTitle = isInternalPage && user && companyName 
        ? `${companyName}의 매물 관리`
        : "뷰동산";

    // 현재 사용자의 직급 및 관리자 여부 확인 (UUID 우선, 이메일 폴백)
    const currentUserEmployee = user?.id 
        ? employees.find((emp) => emp.supabase_user_id === user.id) || employees.find((emp) => emp.kakao_email === userEmail)
        : employees.find((emp) => emp.kakao_email === userEmail);
    const userPosition = currentUserEmployee?.position || "";
    const userManager = currentUserEmployee?.manager || "";
    
    // 매니저 또는 대표인지 확인
    const isManager = userManager === "매니저" || userManager === "대표";
    const isCEO = userPosition === "대표";
    const isAdmin = isManager || isCEO;

    // 사이트 관리자 접근 허용 이메일 (안병근)
    const SITE_ADMIN_EMAILS = ["hyo0369@daum.net"];
    const userEmailStr = (
        user?.user_metadata?.email ||
        userEmail ||
        currentUserEmployee?.kakao_email ||
        currentUserEmployee?.email ||
        ""
    )
        .toLowerCase()
        .trim();
    const isSiteAdmin = SITE_ADMIN_EMAILS.some((e) => userEmailStr === e.toLowerCase());

    const handleAuth = async () => {
        if (user) {
            try {
                // 로그아웃
                const { error } = await supabase.auth.signOut();
                if (error) {
                    toast({
                        title: "로그아웃 실패!",
                        description: `${error}`,
                    });
                } else {
                    console.log("Supabase 로그아웃 완료");
                    toast({
                        title: "로그아웃 완료!",
                        description: "정상적으로 로그아웃 되었습니다.",
                    });
                    router.push("/"); // 로그아웃 후 메인 페이지로 이동
                }
            } catch (error) {
                toast({
                    title: "로그아웃 실패!",
                    description: `${error}`,
                });
            }
        } else {
            try {
                // 로그인 시도
                const { error } = await supabase.auth.signInWithOAuth({
                    provider: "kakao",
                    options: {
                        redirectTo: `${window.location.origin}/`,
                    },
                });
                if (error) {
                    toast({
                        title: "로그인 실패!",
                        description: `${error}`,
                    });
                } else {
                    console.log("로그인 진행 중...");
                }
            } catch (error) {
                toast({
                    title: "로그인 실패!",
                    description: `${error}`,
                });
            }
        }
    };

    if (isChecking) {
        return <div>로딩 중...</div>; // 로그인 확인 중 로딩 메시지
    }

    return (
        <header className={"flex items-center justify-between w-full h-[56px] p-4 border-b border-gray-200 bg-white"}>
            <div className={"flex items-center justify-center h-full gap-2"}>
                <span className={"text-2xl font-bold bg-transparent"}>{headerTitle}</span>
            </div>
            <div className={"flex items-center justify-center gap-4"}>
                {/* 로그인 상태: 이름(이메일) | 로그아웃 */}
                {user ? (
                    <>
                        {/* ✅ 이미지 업로드 인디케이터 (이름 왼쪽) */}
                        {isUploading && (
                            <div className="flex items-center gap-2 rounded-full bg-blue-600 text-white px-3 py-1 shadow">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <div className="flex flex-col leading-tight">
                                    {uploadInProgressPropertyIds.length > 0 && (
                                        <span className="text-xs font-semibold">
                                            매물번호: {uploadInProgressPropertyIds.join(", ")}
                                        </span>
                                    )}
                                    <span className="text-xs">
                                        이미지 처리 중... ({uploadInProgressCount})
                                    </span>
                                </div>
                            </div>
                        )}
                        <Label className={"text-[#6d6d6d]"}>
                            {`${user.user_metadata?.full_name || "사용자"} 님 (${user.user_metadata?.email || ""})`}
                        </Label>
                        <span className="text-gray-300">|</span>
                        {isAdmin && (
                            <Button
                                variant={"secondary"}
                                className={"font-normal text-white bg-blue-600 hover:text-white hover:bg-blue-400"}
                                onClick={() => router.push("/admin")}
                                disabled={isChecking}
                            >
                                관리자
                            </Button>
                        )}
                        {isSiteAdmin && (
                            <Button
                                variant={"secondary"}
                                className={"font-normal text-white bg-amber-600 hover:text-white hover:bg-amber-500"}
                                onClick={() => router.push("/site-admin")}
                                disabled={isChecking}
                            >
                                사이트관리자
                            </Button>
                        )}
                        <Button
                            variant={"secondary"}
                            className={"font-normal text-white bg-blue-600 hover:text-white hover:bg-blue-400"}
                            onClick={() => {
                                const width = 800;
                                const height = 900;
                                const left = (window.screen.width - width) / 2;
                                const top = (window.screen.height - height) / 2;
                                window.open(
                                    "/myinfo",
                                    "내 정보",
                                    `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
                                );
                            }}
                            disabled={isChecking}
                        >
                            내 정보
                        </Button>
                        <Button
                            variant={"secondary"}
                            className={"font-normal text-white bg-blue-600 hover:text-white hover:bg-blue-400"}
                            onClick={handleAuth}
                            disabled={isChecking}
                        >
                            로그아웃
                        </Button>
                    </>
                ) : (
                    <>
                        <Button
                            variant={"secondary"}
                            className={"font-normal text-white bg-blue-600 hover:text-white hover:bg-blue-400"}
                            onClick={handleAuth}
                            disabled={isChecking}
                        >
                            로그인
                        </Button>
                        <Label className={"text-[#6d6d6d]"}>비회원</Label>
                    </>
                )}
            </div>
        </header>
    );
}

export default CommonHeader;

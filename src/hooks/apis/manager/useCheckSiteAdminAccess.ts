"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAtomValue } from "jotai";
import { employeesAtom, userEmailAtom } from "@/store/atoms";
import { useAuthCheck } from "@/hooks/apis";
import { toast } from "../../use-toast";

/** 사이트 관리자 접근 허용 이메일 목록 */
const SITE_ADMIN_ALLOWED_EMAILS = [
    "hyo0369@daum.net",      // 안병근
    "wonju0618@naver.com",   // 이원주 과장
    "wonju0618@naver.cor",   // 이원주 과장 (DB 오타 대응)
    "wonju0618@gmail.com",   // 이원주 과장
];

export function useCheckSiteAdminAccess() {
    const router = useRouter();
    const { user } = useAuthCheck();
    const employees = useAtomValue(employeesAtom);
    const userEmail = useAtomValue(userEmailAtom);
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        if (!user || !userEmail || employees.length === 0) {
            setIsAuthorized(null);
            return;
        }

        // 현재 사용자의 직원 정보 찾기
        const currentUserEmployee = user.id
            ? employees.find((emp) => emp.supabase_user_id === user.id) ||
              employees.find((emp) => emp.kakao_email === userEmail) ||
              employees.find((emp) => emp.email === userEmail)
            : employees.find((emp) => emp.kakao_email === userEmail) ||
              employees.find((emp) => emp.email === userEmail);

        if (!currentUserEmployee) {
            setIsAuthorized(false);
            toast({
                variant: "destructive",
                title: "접근 권한 없음",
                description: "직원 정보를 찾을 수 없습니다.",
            });
            router.push("/");
            return;
        }

        // 허용된 이메일 목록에 있는지 확인 (사이트 관리자만 접근 가능)
        const normalizedUserEmail = (userEmail || "").toLowerCase().trim();
        const normalizedKakaoEmail = (currentUserEmployee.kakao_email || "").toLowerCase().trim();
        const normalizedEmail = (currentUserEmployee.email || "").toLowerCase().trim();

        const isAllowed =
            SITE_ADMIN_ALLOWED_EMAILS.some(
                (allowed) =>
                    normalizedUserEmail === allowed.toLowerCase() ||
                    normalizedKakaoEmail === allowed.toLowerCase() ||
                    normalizedEmail === allowed.toLowerCase()
            );

        if (isAllowed) {
            setIsAuthorized(true);
        } else {
            setIsAuthorized(false);
            toast({
                variant: "destructive",
                title: "접근 권한 없음",
                description: "사이트 관리자 페이지는 지정된 관리자만 접근할 수 있습니다.",
            });
            router.push("/");
        }
    }, [user, userEmail, employees, router]);

    return { isAuthorized };
}

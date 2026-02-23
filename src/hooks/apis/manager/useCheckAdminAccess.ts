"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAtomValue } from "jotai";
import { employeesAtom, userEmailAtom } from "@/store/atoms";
import { useAuth } from "@/hooks/apis";
import { toast } from "../../use-toast";

export function useCheckAdminAccess() {
    const router = useRouter();
    const { user } = useAuth();
    const employees = useAtomValue(employeesAtom);
    const userEmail = useAtomValue(userEmailAtom);
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        if (!user || !userEmail || employees.length === 0) {
            setIsAuthorized(null);
            return;
        }

        // 현재 사용자의 직원 정보 찾기 (UUID 우선, 이메일 폴백)
        const currentUserEmployee = user.id 
            ? employees.find((emp) => emp.supabase_user_id === user.id) || employees.find((emp) => emp.kakao_email === userEmail)
            : employees.find((emp) => emp.kakao_email === userEmail);

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

        // 매니저 또는 대표인지 확인
        const isManager = currentUserEmployee.manager === "매니저" || currentUserEmployee.manager === "대표";
        const isCEO = currentUserEmployee.position === "대표" || currentUserEmployee.manager === "대표";

        if (isManager || isCEO) {
            setIsAuthorized(true);
        } else {
            setIsAuthorized(false);
            toast({
                variant: "destructive",
                title: "접근 권한 없음",
                description: "관리자 페이지는 매니저 또는 대표만 접근할 수 있습니다.",
            });
            router.push("/");
        }
    }, [user, userEmail, employees, router]);

    return { isAuthorized };
}


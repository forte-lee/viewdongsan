"use client";

import { useEffect } from "react";
import { useSetAtom, useAtomValue } from "jotai";
import { employeesAtom, isManagerAtom, userEmailAtom } from "@/store/atoms";
import { useAuthCheck } from "@/hooks/login/useAuthCheck";

export function useCheckManager() {
    const employees = useAtomValue(employeesAtom);
    const userEmail = useAtomValue(userEmailAtom);
    const { user } = useAuthCheck();
    const setIsManager = useSetAtom(isManagerAtom);

    useEffect(() => {
        if (!employees.length || !user) return;

        // UUID 우선, 이메일 폴백
        const emp = user.id 
            ? employees.find((e) => e.supabase_user_id === user.id) || employees.find((e) => e.kakao_email === userEmail)
            : employees.find((e) => e.kakao_email === userEmail);

        setIsManager(emp?.manager === "매니저");
    }, [employees, user, userEmail]);
}

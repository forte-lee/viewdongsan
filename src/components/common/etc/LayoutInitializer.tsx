"use client";

import { useEffect } from "react";
import { useGetEmployeesAll } from "@/hooks/supabase/manager/useGetEmployeesAll";
import { useCheckManager } from "@/hooks/apis";
import { useLoadGuestNewProperties } from "@/hooks/apis";

export default function LayoutInitializer() {
    useGetEmployeesAll();   // 직원 목록 로드 (회사 기준)
    useCheckManager();      // 로그인한 사용자의 매니저 여부 계산

    const loadGuestNewProperties = useLoadGuestNewProperties();

    /** 🔥 앱 최초 실행 시 NEW 매물 전체 로드 */
    useEffect(() => {
        loadGuestNewProperties();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null; // 화면에는 아무것도 렌더링하지 않음
}

"use client";

import { useEffect } from "react";
import { useGetEmployeesAll } from "@/hooks/supabase/manager/useGetEmployeesAll";
import { useCheckManager } from "@/hooks/apis";

export default function LayoutInitializer() {
    useGetEmployeesAll();   // 직원 목록 로드 (회사 기준)
    useCheckManager();      // 로그인한 사용자의 매니저 여부 계산

    return null; // 화면에는 아무것도 렌더링하지 않음
}

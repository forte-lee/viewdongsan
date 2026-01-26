"use client";

import { useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { useSetAtom } from "jotai";
import { employeesAtom } from "@/store/atoms";
import { Employee } from "@/types";


export function useGetEmployeesAll() {
    const setEmployees = useSetAtom(employeesAtom);

    useEffect(() => {
        const loadEmployees = async () => {
            const { data, error } = await supabase
                .from("employee")
                .select("*")
                .order("id", { ascending: true });

            if (error) {
                console.error("❌ 직원 정보 로드 실패:", error);
                return;
            }

            setEmployees(data as Employee[]);
        };

        loadEmployees();
    }, []);
}

"use client";

import { Property } from "@/types";
import { supabase } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "../../use-toast";
import { useGetCompanyId } from "@/hooks/apis/search/useGetCompanyId";
import { useAuth } from "@/hooks/apis";

function useGetPropertyDeleteAll() {
    const { user } = useAuth();
    const { company } = useGetCompanyId(user); // UUID 기반
    const [propertyDeletes, setPropertyDeletes] = useState<Property[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const getPropertyDeletesAll = async () => {
        if (!company) {
            console.warn("⚠️ 회사 ID가 없어 삭제 매물을 가져올 수 없습니다.");
            return;
        }

        setIsLoading(true);
        try {
            // 회사의 모든 직원 ID 가져오기
            const { data: employees, error: employeesError } = await supabase
                .from("employee")
                .select("id")
                .eq("company_id", company);

            if (employeesError) {
                throw employeesError;
            }

            if (!employees || employees.length === 0) {
                setPropertyDeletes([]);
                setIsLoading(false);
                return;
            }

            const employeeIds = employees
                .map((emp) => emp.id)
                .filter((id): id is number => id !== undefined && id !== null);

            // property_delete에서 회사 직원들의 매물 가져오기 (employee_id 기반)
            const { data } = await supabase
                .from("property_delete")
                .select("*")
                .in("employee_id", employeeIds)
                .throwOnError();

            if (data) {
                setPropertyDeletes(data as Property[]);
            }
        } catch (error) {
            console.error("삭제 매물 데이터 가져오기 실패:", error);
            toast({
                variant: "destructive",
                title: "데이터 로드 실패",
                description: "서버 오류 발생",
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (company) {
            getPropertyDeletesAll();
        }
    }, [company]);

    return { propertyDeletes, getPropertyDeletesAll, isLoading };
}

export { useGetPropertyDeleteAll };


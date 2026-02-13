"use client";

import { Property } from "@/types";
import { supabase } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "../../use-toast";

/** 사이트 관리자용: 전체 삭제 매물 조회 (모든 회사) */
function useGetPropertyDeleteAllSiteAdmin() {
    const [propertyDeletes, setPropertyDeletes] = useState<Property[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const getPropertyDeletesAll = async () => {
        setIsLoading(true);
        try {
            const { data } = await supabase
                .from("property_delete")
                .select("*")
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
        getPropertyDeletesAll();
    }, []);

    return { propertyDeletes, getPropertyDeletesAll, isLoading };
}

export { useGetPropertyDeleteAllSiteAdmin };

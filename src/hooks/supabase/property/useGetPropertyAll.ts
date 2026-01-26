"use client";

import { propertysAtom } from "@/store/atoms";
import { supabase } from "@/utils/supabase/client";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { toast } from "../../use-toast";

function useGetPropertyAll() {
    const [propertysAll, setPropertysAll] = useAtom(propertysAtom);

    const getPropertysAll = async () => {
        try {
            const { data } = await supabase
                .from("property")
                .select("*")
                .throwOnError(); // 🔹 에러 발생 시 catch로 자동 이동

            if (data) {
                setPropertysAll(data); // 🔹 Atom 상태 업데이트
            }
        } catch (error) {
            console.error("데이터 가져오기 실패:", error);
            toast({
                variant: "destructive",
                title: "데이터 로드 실패",
                description: "서버 오류 발생",
            });
        }
    };

    // 🔹 첫 로딩 시 자동 실행
    useEffect(() => {
        getPropertysAll();
    }, []);

    return { propertysAll, getPropertysAll };
}

export { useGetPropertyAll };

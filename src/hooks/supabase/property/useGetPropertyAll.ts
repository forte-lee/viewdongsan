"use client";

import { propertysAtom } from "@/store/atoms";
import { supabase } from "@/utils/supabase/client";
import { Property } from "@/types";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { toast } from "../../use-toast";

/**
 * Supabase REST(PostgREST)는 프로젝트의 max rows(기본 1000)마다 한 번에 반환 행 수가 제한됩니다.
 * 첫 화면 등에서 `property` 전체가 필요할 때는 이 크기로 끊어 여러 번 받아 이어 붙입니다.
 */
export const PROPERTY_FETCH_PAGE_SIZE = 1000;

/**
 * `property` 테이블의 전체 행을 가져옵니다(허용 정책·RLS가 적용된 클라이언트 기준).
 * — 메인·지도·전사 필터 등 첫 로드 시 Atom/메모리에 올릴 때 사용합니다.
 */
export async function fetchAllProperties(): Promise<Property[]> {
    const accumulated: Property[] = [];
    let from = 0;

    for (;;) {
        const { data } = await supabase
            .from("property")
            .select("*")
            .order("id", { ascending: true })
            .range(from, from + PROPERTY_FETCH_PAGE_SIZE - 1)
            .throwOnError();

        const rows = (data ?? []) as Property[];
        accumulated.push(...rows);

        if (rows.length < PROPERTY_FETCH_PAGE_SIZE) break;
        from += PROPERTY_FETCH_PAGE_SIZE;
    }

    return accumulated;
}

function useGetPropertyAll() {
    const [propertysAll, setPropertysAll] = useAtom(propertysAtom);

    const getPropertysAll = async () => {
        try {
            const all = await fetchAllProperties();
            setPropertysAll(all);
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

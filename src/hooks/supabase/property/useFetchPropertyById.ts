"use client";

import { supabase } from "@/utils/supabase/client";
import { useState, useCallback } from "react";
import { Property } from "@/types";

/**
 * 링크 공유 시 비로그인 사용자가 매물 상세를 볼 수 있도록
 * ID로 매물을 Supabase에서 직접 조회
 */
function useFetchPropertyById() {
    const [property, setProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProperty = useCallback(async (propertyId: number) => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: fetchError } = await supabase
                .from("property")
                .select("*")
                .eq("id", propertyId)
                .single();

            if (fetchError) {
                setError(fetchError.message);
                setProperty(null);
                return null;
            }

            if (data) {
                setProperty(data as Property);
                return data as Property;
            }
            return null;
        } catch (e) {
            const msg = e instanceof Error ? e.message : "매물 조회 실패";
            setError(msg);
            setProperty(null);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return { property, loading, error, fetchProperty };
}

export { useFetchPropertyById };

"use client";

import { useAtom } from "jotai";
import { propertysAtom } from "@/store/atoms";
import { useEffect, useState } from "react";
import { Property } from "@/types"; // Property 타입 가져오기
import { supabase } from "@/utils/supabase/client";
import { isSameNumericId } from "@/utils/sameNumericId";

//단일 매물 정보 가져오기
function useGetPropertyById(propertyId: number | null) {
    const [propertysAll] = useAtom(propertysAtom); // Jotai Atom 사용
    const [property, setProperty] = useState<Property | null>(null); // 초기값 및 타입 설정

    useEffect(() => {
        if (!propertyId) {
            setProperty(null);
            return;
        }

        const fromAtom = Array.isArray(propertysAll)
            ? propertysAll.find((item) => isSameNumericId(item.id, propertyId))
            : undefined;
        if (fromAtom) {
            setProperty(fromAtom);
            return;
        }

        let cancelled = false;

        (async () => {
            try {
                const { data, error } = await supabase
                    .from("property")
                    .select("*")
                    .eq("id", Number(propertyId))
                    .maybeSingle();

                if (cancelled) return;
                if (error || !data) {
                    setProperty(null);
                    return;
                }
                setProperty(data as Property);
            } catch {
                if (!cancelled) setProperty(null);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [propertyId, propertysAll]); // atom이 채워지면 atom 우선으로 다시 맞춤

    return { property };
}

export { useGetPropertyById };

"use client";

import { useAtom } from "jotai";
import { propertysAtom } from "@/store/atoms";
import { useEffect, useState } from "react";
import { Property } from "@/types"; // Property 타입 가져오기

//단일 매물 정보 가져오기
function useGetPropertyById(propertyId: number | null) {
    const [propertysAll] = useAtom(propertysAtom); // Jotai Atom 사용
    const [property, setProperty] = useState<Property | null>(null); // 초기값 및 타입 설정

    useEffect(() => {
        if (!propertyId) return; // propertyId가 없으면 실행하지 않음
        if (!Array.isArray(propertysAll) || propertysAll.length === 0) return; // 데이터가 없으면 실행 안 함

        // ✅ Atom에서 해당 ID의 매물 찾기
        const filteredProperty = propertysAll.find((item) => item.id === propertyId);
        setProperty(filteredProperty || null);
    }, [propertyId, propertysAll]); // 의존성 배열 최적화

    return { property };
}

export { useGetPropertyById };

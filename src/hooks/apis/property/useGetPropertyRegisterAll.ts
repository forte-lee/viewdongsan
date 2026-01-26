"use client";

import { propertysAtom } from "@/store/atoms";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { Property } from "@/types";

function useGetPropertyRegisterAll() {
    const [propertys] = useAtom(propertysAtom); // ✅ 전체 매물 데이터 가져오기
    const [filteredPropertys, setFilteredPropertys] = useState<Property[]>([]); // ✅ 필터링된 매물 목록

    const getPropertys = () => {
        // ✅ 이미 가져온 데이터에서 is_register가 true인 것만 필터링
        const filtered = propertys.filter((property) => property.is_register === true);
        setFilteredPropertys(filtered);
    };

    // ✅ `propertysAtom`이 변경될 때 자동으로 필터링 적용
    useEffect(() => {
        getPropertys();
    }, [propertys]);

    return { propertys: filteredPropertys, getPropertys };
}

export { useGetPropertyRegisterAll };

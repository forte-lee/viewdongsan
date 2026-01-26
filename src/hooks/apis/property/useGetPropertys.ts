"use client";

import { propertysAtom } from "@/store/atoms";
import { useAtom } from "jotai";
import { useEffect, useState, useRef } from "react";
import { Property } from "@/types";

//employee_id로 매칭되는 데이터 가져오기
function useGetPropertys() {
    const [propertys] = useAtom(propertysAtom); // ✅ 전체 매물 목록 가져오기
    const [filteredPropertys, setFilteredPropertys] = useState<Property[]>([]); // ✅ 필터링된 매물 목록
    const lastFilterInputRef = useRef<number | null | undefined>(undefined); // ✅ 마지막 필터링 조건 저장

    const getPropertys = (employeeId?: number | null) => {
        // ✅ 마지막 필터링 조건 저장
        lastFilterInputRef.current = employeeId;
        
        if (employeeId === undefined) {
            setFilteredPropertys(propertys); // ✅ 조건이 없으면 전체 목록 반환
            return;
        }

        // ✅ employee_id로 매칭
        const filtered = propertys.filter((property) => {
            if (employeeId !== null && employeeId !== undefined) {
                return property.employee_id === employeeId;
            }
            return false;
        });
        setFilteredPropertys(filtered);
    };

    // ✅ propertysAtom 변경 시 마지막 필터링 조건으로 다시 필터링
    useEffect(() => {
        const lastInput = lastFilterInputRef.current;
        
        if (lastInput === undefined) {
            // 필터링 조건이 없었으면 전체 목록 표시
            setFilteredPropertys(propertys);
        } else {
            // 마지막 필터링 조건으로 다시 필터링
            const filtered = propertys.filter((property) => {
                if (lastInput !== null && lastInput !== undefined) {
                    return property.employee_id === lastInput;
                }
                return false;
            });
            setFilteredPropertys(filtered);
        }
    }, [propertys]);

    return { propertys: filteredPropertys, getPropertys };
}

export { useGetPropertys };

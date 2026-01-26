"use client";

import { useAtom } from "jotai";
import { guestsAtom } from "@/store/atoms";

function useGetGuests() {
    const [guests] = useAtom(guestsAtom); // ✅ 전역 상태에서 손님 목록 가져오기

    // ✅ employee_id로 필터링하는 함수
    const getGuestsByEmployeeId = (employeeId: number | null) => {
        if (employeeId === null) return [];
        return guests.filter((guest) => guest.employee_id === employeeId);
    };

    return { guests, getGuestsByEmployeeId };
}

export { useGetGuests };

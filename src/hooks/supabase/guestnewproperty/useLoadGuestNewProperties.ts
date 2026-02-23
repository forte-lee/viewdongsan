"use client";

import { useSetAtom } from "jotai";
import { guestNewPropertiesAtom, guestPropertysAtom, guestsAtom, employeesAtom } from "@/store/atoms";
import { supabase } from "@/utils/supabase/client";
import { getDefaultStore } from "jotai";
import { useAuth } from "@/hooks/apis";

const store = getDefaultStore();

export function useLoadGuestNewProperties() {
    const setNewMap = useSetAtom(guestNewPropertiesAtom);
    const { user } = useAuth();

    const loadGuestNewProperties = async () => {
        // ✅ 현재 로그인한 사용자의 employee_id 찾기
        const employees = store.get(employeesAtom);
        const currentEmployeeId = (() => {
            if (user?.id) {
                const employee = employees.find(emp => emp.supabase_user_id === user.id);
                if (employee) return employee.id;
            }
            return null;
        })();

        if (currentEmployeeId === null) {
            console.log("⚠️ employee_id 없음 - 빈 객체로 초기화");
            setNewMap({});
            return;
        }

        const { data, error } = await supabase
            .from("guest_new_properties")
            .select("guestproperty_id, property_id, is_read")
            .eq("is_read", false);

        if (error) {
            console.error("❌ NEW 데이터 로드 오류:", error);
            // 에러 발생 시 빈 객체로 초기화
            setNewMap({});
            return;
        }

        // ✅ 데이터가 없으면 빈 객체로 초기화
        if (!data || data.length === 0) {
            console.log("✅ NEW 매물 없음 - 빈 객체로 초기화");
            setNewMap({});
            return;
        }

        // ✅ 현재 로그인한 사용자의 employee_id와 일치하고 알림이 ON인 guestproperty만 필터링
        const guestPropertys = store.get(guestPropertysAtom);
        const guests = store.get(guestsAtom);
        
        // guestproperty → guest → employee_id로 필터링
        const validGuestPropertyIds = new Set(
            guestPropertys
                .filter(gp => {
                    const guest = guests.find(g => g.id === gp.guest_id);
                    return guest?.employee_id === currentEmployeeId && gp.alarm === true;
                })
                .map(gp => gp.id)
        );

        // 상태 변환 → guestproperty_id : [property_ids...]
        const map: Record<number, number[]> = {};

        data.forEach((row) => {
            // ✅ 현재 로그인한 사용자의 employee_id와 일치하고 알림이 ON인 경우만 추가
            if (validGuestPropertyIds.has(row.guestproperty_id)) {
                if (!map[row.guestproperty_id]) map[row.guestproperty_id] = [];
                map[row.guestproperty_id].push(row.property_id);
            }
        });

        // ✅ 빈 배열 제거 (N 표시가 사라지지 않는 문제 해결)
        Object.keys(map).forEach((key) => {
            if (map[Number(key)].length === 0) {
                delete map[Number(key)];
            }
        });

        // ✅ 디버깅: 로드된 데이터 확인
        const nonEmptyEntries = Object.entries(map).filter(
            ([, ids]) => Array.isArray(ids) && ids.length > 0
        );
        console.log("📥 NEW 매물 로드 완료:", {
            totalRows: data.length,
            totalKeys: Object.keys(map).length,
            nonEmptyEntries: nonEmptyEntries.length,
            entries: nonEmptyEntries,
        });

        setNewMap(map);
    };

    return loadGuestNewProperties;
}

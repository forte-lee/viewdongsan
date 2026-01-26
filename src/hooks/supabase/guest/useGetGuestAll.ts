"use client";

import { supabase } from "@/utils/supabase/client";
import { useAtom } from "jotai";
import { guestsAtom } from "@/store/atoms";
import { toast } from "../../use-toast";
import { useEffect } from "react";

function useGetGuestAll() {
    const [guests, setGuests] = useAtom(guestsAtom);

    const getGuests = async () => {
        try {
            const { data, error } = await supabase.from("guest").select("*");

            if (error) throw error;

            if (data) {
                setGuests(data); // ✅ Atom 상태 업데이트
            }
        } catch (error) {
            console.error("🚨 손님 데이터 가져오기 실패:", error);
            toast({
                variant: "destructive",
                title: "손님 데이터 로드 실패",
                description: "서버 오류 발생",
            });
        }
    };

    // ✅ 처음 한 번 실행 (컴포넌트 마운트 시)
    useEffect(() => {
        if (guests.length === 0) {
            getGuests();
        }
    }, []);

    return { guests, getGuests };
}

export { useGetGuestAll };

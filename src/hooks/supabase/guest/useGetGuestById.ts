"use client";

import { toast } from "../../use-toast";
import { supabase } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { Guest } from "@/types";

function useGetGuestById(guestId: Number) {
    const [guest, setGuest] = useState<Guest | null>(null); // ✅ 개별 손님 상태 관리   

    const getGuestById = async () => {
        try {
            const { data, status, error } = await supabase.from("guest").select("*").eq("id", guestId);

            if(data && status === 200) setGuest(data[0]);
            if(error) {
                toast({
                    variant: "destructive",
                    title: "에러가 발생했습니다.",
                    description: `Supabase 오류: ${error.message} || "알 수 없는 오류"`,
                });
            }
        }catch(error) {
            console.log(error)
            toast({
                variant: "destructive",
                title: "네트워크 오류",
                description: "서버와 연결할 수 없습니다. 다시 시도해주세요!",
            });
        }

    };

    useEffect(()=> {
        if(guestId) getGuestById();
    }, []);

    return {guest, getGuestById};
}

export { useGetGuestById };
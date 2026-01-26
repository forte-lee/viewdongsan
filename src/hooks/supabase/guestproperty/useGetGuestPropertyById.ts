"use client";

import { toast } from "../../use-toast";
import { supabase } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { GuestProperty } from "@/types";

function useGetGuestPropertyById(guestPropertyId: Number) {
    const [guestProperty, setGuestProperty] = useState<GuestProperty | null>(null);

    const getGuestPropertyById = async () => {
        try {
            const { data, status, error } = await supabase.from("guestproperty").select("*").eq("id", guestPropertyId);

            if(data && status === 200) setGuestProperty(data[0]);
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
        if(guestPropertyId) getGuestPropertyById();
    }, []);

    return {guestProperty, getGuestPropertyById};
}

export { useGetGuestPropertyById };
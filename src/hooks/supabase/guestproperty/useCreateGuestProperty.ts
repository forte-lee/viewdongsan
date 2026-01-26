"use client";

import { supabase } from "@/utils/supabase/client";
import { toast } from "../../use-toast";
import { useAuthCheck } from "../../login/useAuthCheck";
import { useAtom } from "jotai";
import { guestPropertysAtom } from "@/store/atoms"; // ✅ guestPropertysAtom 가져오기
import { GuestProperty } from "@/types";

function useCreateGuestProperty() {
    // const { user } = useAuthCheck(); // TODO: 사용 예정
    const [, setGuestPropertys] = useAtom(guestPropertysAtom); // ✅ guestPropertysAtom 상태 가져오기
    
    const createGuestProperty = async (property_Type: string, guestId: number) => {
        try {
            console.log("🛠️ 선택한 매물 타입:", property_Type);

            if (!guestId) {
                console.error("⚠️ guestId가 유효하지 않습니다.");
                return;
            }

            let guestName: string | null = null;

            // ✅ 손님 이름 찾기
            const { data: guest, error: guestError } = await supabase
                .from("guest")
                .select("id, name")
                .eq("id", guestId)
                .single();

            if (guestError) {
                console.warn("⚠️ 손님 정보를 찾을 수 없음:", guestError.message);
            } else {
                guestName = guest.name;
            }

            // ✅ `guestproperty` 테이블에 추가
            const { data, error } = await supabase
                .from("guestproperty")
                .insert([
                    {
                        create_at: new Date(),
                        update_at: new Date(),
                        alarm: false,
                        data: [],
                        type: property_Type,
                        guest_id: guestId,
                        guest_name: guestName,
                    },
                ])
                .select();

            console.log("🛠️ Supabase Insert 결과:", { data, error });

            if (error) {
                console.error("⚠️ guestproperty 삽입 중 오류 발생:", error.message);
                return;
            }

            if (data && data.length > 0) {
                const newProperty: GuestProperty = data[0];

                // ✅ guestPropertysAtom에 새 매물 추가하여 UI 즉시 업데이트
                setGuestPropertys((prev) => [...prev, newProperty]);

                // ✅ 새로운 팝업으로 세부 등록 창을 띄우기
                let detailPageURL = "";
                switch (property_Type) {
                    case "주거":
                        detailPageURL = `/guest/register/${newProperty.id}/house`;
                        break;
                    case "상가/사무실/산업":
                        detailPageURL = `/guest/register/${newProperty.id}/office`;
                        break;
                    case "건물":
                        detailPageURL = `/guest/register/${newProperty.id}/building`;
                        break;
                    case "토지":
                        detailPageURL = `/guest/register/${newProperty.id}/land`;
                        break;
                }

                const popup = window.open(
                    detailPageURL,
                    "_blank",
                    `width=900,height=900,left=${(window.screen.width - 900) / 2},top=${(window.screen.height - 900) / 2},resizable=no,scrollbars=yes`
                );

                if (!popup) {
                    alert("팝업 차단이 되어있을 수 있습니다. 팝업을 허용해주세요.");
                }
            }
        } catch (error) {
            console.error("⚠️ 손님 매물 등록 실패:", error);
            toast({
                variant: "destructive",
                title: "네트워크 오류",
                description: "서버와 연결할 수 없습니다. 다시 시도해주세요!",
            });
        }
    };

    return createGuestProperty;
}

export { useCreateGuestProperty };

import { useAuth } from "@/app/context/AuthContext";
import { Button, Label } from "@/components/ui";
import { useUpdateRegisterState } from "@/hooks/supabase/property/useUpdateRegisterState";
import { propertysAtom } from "@/store/atoms";
import { Property } from "@/types";
import { useAtom } from "jotai";
import { useState, useEffect } from "react";

interface AdminPropertyReadCardHeaderProps {
    propertyId: number;
}

function AdminPropertyReadCardHeader({ propertyId }: AdminPropertyReadCardHeaderProps) {
    const { user } = useAuth();
    const [propertysAll] = useAtom(propertysAtom);
    
    const property = propertysAll.find((item) => item.id === propertyId) || {} as Property;

    // 모든 hooks는 조건부 return 전에 호출되어야 함
    const [isOn, setIsOn] = useState(property.on_board_state?.on_board_state || false);
    const [board, setBoard] = useState(property.on_board_state);
    const [isLoading, setIsLoading] = useState(false);

    const updateState = useUpdateRegisterState();

    // useEffect로 property 변경 시 상태 동기화
    useEffect(() => {
        if (property && property.id) {
            setIsOn(property.on_board_state?.on_board_state || false);
            setBoard(property.on_board_state);
        }
    }, [property]);

    if (!property || !property.id) {
        return (
            <div className="flex flex-col w-full justify-center items-center p-2">
                <Label className="flex p-2">{`${propertyId}`}</Label>
                <span className="text-red-500 text-xs">매물을 찾을 수 없음</span>
            </div>
        );
    }

    const toggleButton = async () => {
        if (!user) {
            alert("로그인 정보가 없습니다.");
            return;
        }

        setIsLoading(true);

        try {            
            const updatedBoard = {
                ...board,
                on_board_state: !isOn,
                on_board_at: new Date(),
                on_board_update_user: user.user_metadata?.full_name,
            };
            
            setBoard(updatedBoard);
            setIsOn(!isOn);

            await updateState(propertyId, "on_board_state", updatedBoard);

            console.log("업데이트 성공:", updatedBoard);
        } catch (error) {
            console.error("상태 변경 실패:", error);
            alert("상태를 변경하는 중 문제가 발생했습니다. 다시 시도해주세요.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col w-full justify-center items-center p-2">
            <Label className="flex p-2">{`${propertyId}`}</Label>
            <Button
                variant={"outline"}
                className={`flex w-[30px] h-[30px] ${
                    isOn
                        ? "bg-green-500 text-white hover:bg-green-400 hover:text-white"
                        : "bg-gray-500 text-white hover:bg-gray-400 hover:text-white"
                }`}
                onClick={toggleButton}
                disabled={isLoading}
            >
                {isLoading ? "..." : isOn ? "On" : "Off"}
            </Button>
        </div>
    );
}

export { AdminPropertyReadCardHeader };


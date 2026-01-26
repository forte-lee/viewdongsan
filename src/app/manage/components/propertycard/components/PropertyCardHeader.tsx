import { useAuth } from "@/app/context/AuthContext";
import { Button, Label } from "@/components/ui";
import { useUpdateRegisterState } from "@/hooks/supabase/property/useUpdateRegisterState";
import { propertysAtom } from "@/store/atoms";
import { Property } from "@/types";
import { useAtom } from "jotai";
import { useState } from "react";

interface PropertyCardHeaderProps {
    propertyId: number;
}

function PropertyCardHeader({ propertyId }: PropertyCardHeaderProps) {
    const { user } = useAuth(); // 현재 로그인한 사용자 정보 가져오기
    const [propertysAll] = useAtom(propertysAtom); // 전체 매물 리스트 상태
    
    // 해당 propertyId와 일치하는 매물 찾기
    const property = propertysAll.find((item) => item.id === propertyId) || {} as Property;

    // 모든 hooks는 조건부 return 전에 호출되어야 함
    const [isOn, setIsOn] = useState(property.on_board_state?.on_board_state || false); // 초기 상태: ON
    const [board, setBoard] = useState(property.on_board_state);
    const [isLoading, setIsLoading] = useState(false); // 로딩 상태
    const updateState = useUpdateRegisterState();
    
    // 매물이 없을 경우 early return
    if (!property || !property.id) {
        return (
            <div className="flex flex-col w-1/12 justify-center items-center p-2">
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

        setIsLoading(true); // 로딩 시작

        try {            
            // 새로운 상태 값 업데이트
            const updatedBoard = {
                ...board,
                on_board_state: !isOn, // 상태 토글
                on_board_at: new Date(), // 현재 날짜/시간 저장
                on_board_update_user: user.user_metadata?.full_name, // 현재 로그인한 사용자
            };
            
            setBoard(updatedBoard);
            setIsOn(!isOn);

            await updateState(propertyId, "on_board_state", updatedBoard);

            console.log("업데이트 성공:", updatedBoard);
        } catch (error) {
            console.error("상태 변경 실패:", error);
            alert("상태를 변경하는 중 문제가 발생했습니다. 다시 시도해주세요.");
        } finally {
            setIsLoading(false); // 로딩 종료
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
                disabled={isLoading} // 로딩 중 버튼 비활성화
            >
                {isLoading ? "..." : isOn ? "On" : "Off"} {/* 로딩 상태 표시 */}
            </Button>
        </div>
    );
}

export { PropertyCardHeader };

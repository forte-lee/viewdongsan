import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useGetGuestById, useUpdateGuest } from "@/hooks/apis";
import { toast } from "@/hooks/use-toast";

const defaultState = {
    name: "",
    sex: "",
    phone: [] as string[],
    memo: "",
};


function useRegisterGuest() {
    const { id } = useParams();
    const { guest } = useGetGuestById(Number(id));
    const updateGuest = useUpdateGuest();

    // 전체 상태를 객체로 관리
    const [state, setState] = useState({ ...defaultState });

    // 필드 단일 업데이트 함수
    const setField = (key: keyof typeof state, value: string | string[]) => {
        setState((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    // 상태 초기화
    const updateState = () => {
        if (!guest?.data) {
            // property.data가 없으면 기본 상태로 초기화
            setState({ ...defaultState });
            return;
        }
        const data = guest.data;

        setState({
            ...defaultState,
            ...data
        });
    };

    // const resetState = () => {
    //     setState({ ...defaultState });
    // }; // TODO: 상태 초기화 기능 구현 시 사용

    useEffect(() => {
        updateState();
    }, [guest]);

    //중복선택 버튼 처리
    const toggleSelection = (
        value: string,
        currentArray: string[],
        setArray: (newArray: string[]) => void
    ) => {
        const isSelected = currentArray.includes(value);
        const newArray = isSelected
            ? currentArray.filter((item) => item !== value) // 선택 해제
            : [...currentArray, value]; // 선택 추가
        setArray(newArray);
    };
    
    // 서버에 저장 핸들러
    const handleSubmit = async () => {
        try {
            const updatedData = {                                                                   // data 저장
                ...guest?.data,
                ...state,
            };
            await updateGuest(Number(id), "data", updatedData, "update_at", new Date());         // update 날짜 수정
        } catch (error) {
            toast({
                variant: "destructive",
                title: "네트워크 오류",
                description: "서버와 연결할 수 없습니다. 다시 시도해주세요.",
            });
            throw error;
        }
    };

    return {
        state,
        setField,
        toggleSelection,
        handleSubmit,
    };
}

export { useRegisterGuest };
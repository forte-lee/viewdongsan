import { useState, useEffect, useRef } from "react";
import { useParams, usePathname } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { useGetGuestPropertyById, useUpdateGuestProperty } from  "@/hooks/apis";

const defaultState = {
    type: "",

    person: "",

    company_name: "",

    propertys_check: false,
    propertys: [] as string[],
    property_allow: "",
    property_allow_memo: "",

    estate_check: false,
    estate_use: [] as string[],             //사용용도

    land_use_check: false,
    land_use: [] as string[],               //용도지역
    
    trade_types: [] as string[],                   //거래종류

    trade_possible_cash: "",                
    trade_premium: "",

    trade_price_check: false,
    trade_price_min: "",
    trade_price_max: "",

    trade_deposit_check: false,
    trade_deposit_min: "",
    trade_deposit_max: "",

    trade_rent_check: false,
    trade_rent_deposit_check: false,
    trade_rent_deposit_min: "",
    trade_rent_deposit_max: "",
    trade_rent_min: "",
    trade_rent_max: "",

    enter_date_check: false,
    enter_date: undefined as Date | undefined,
    enter_is_discuss: false,
    enter_is_now: false,

    locations_check: false,
    locations: [] as string[],


    area_check: false,
    area_reference: "",
    area_ground: "",
    area_grossfloor: "",

    room_check: false,
    room_number: "",
    room_bathroom_number: "",
    room_is_livingroom: "",

    parking_check: false,
    parking_number: "",
    parking_is_car: "",

    pet_check: false,
    pet_is_pet: "",
    pet_memo: "",

    floor_check: false,
    floor_types: [] as string[],

    elevator_check: false,
    elevator_is: "",

    interior_check: false,
    interior : "",

    enter_load_check: false,
    enter_load: "",

    alarm: "",
    
    sublease_check: false,
    sublease: "",
    sublease_memo: "",

    extra_memo: "",
};


function useRegisterGuestProperty() {
    const { id } = useParams();
    const pathname = usePathname();
    const { guestProperty } = useGetGuestPropertyById(Number(id));
    const updateGuestProperty = useUpdateGuestProperty();

    // 전체 상태를 객체로 관리
    const [state, setState] = useState({ ...defaultState });
    const draftStorageKey = `guest_property_draft_${id}`;
    const isInitialLoadRef = useRef(true);
    const hasRestoredDraftRef = useRef(false);
    const prevPathnameRef = useRef(pathname);
    const isSubmittingRef = useRef(false); // ✅ 등록 중인지 추적하는 ref

    // ✅ 최신 상태를 참조하기 위한 ref
    const stateRef = useRef(state);
    
    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    // ✅ 즉시 저장 함수 (페이지 이탈 시 사용)
    const saveImmediately = () => {
        if (isInitialLoadRef.current) return;
        
        try {
            // 타임스탬프와 함께 저장
            const draftData = {
                data: stateRef.current,
                timestamp: new Date().toISOString(),
            };
            localStorage.setItem(draftStorageKey, JSON.stringify(draftData));
            console.log("🚀 즉시 저장 완료 (페이지 이탈):", new Date().toISOString());
        } catch (error) {
            console.error("❌ 즉시 저장 실패:", error);
        }
    };

    // ✅ 버튼 클릭 항목 필드 목록 - TODO: 버튼 필드 기능 구현 시 사용
    // const buttonFields = [
    //     'trade_types', 'estate_use', 'land_use', 'propertys', 'locations',
    //     'floor_types', 'trade_price_check', 'trade_deposit_check', 'trade_rent_check',
    //     'enter_date_check', 'area_check', 'room_check', 'parking_check',
    //     'pet_check', 'elevator_check', 'interior_check', 'enter_load_check',
    //     'sublease_check', 'land_use_check', 'estate_check', 'propertys_check',
    //     'alarm', 'parking_is_car', 'elevator_is', 'interior', 'enter_load',
    //     'pet_is_pet', 'room_is_livingroom', 'property_allow', 'type'
    // ];

    // 필드 단일 업데이트 함수
    const setField = (key: keyof typeof state, value: string | string[] | boolean | Date | undefined) => {
        setState((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    // ✅ localStorage에서 임시 저장 데이터 복원
    const restoreDraft = (compareWithDbUpdateAt?: Date) => {
        if (hasRestoredDraftRef.current) {
            console.log("이미 복원 완료됨");
            return false;
        }
        
        try {
            const savedDraft = localStorage.getItem(draftStorageKey);
            console.log("임시 저장 데이터 확인:", savedDraft ? "있음" : "없음", draftStorageKey);
            
            if (savedDraft) {
                const parsedDraft = JSON.parse(savedDraft);
                
                // 새로운 형식 (타임스탬프 포함)인지 확인
                let draftData: typeof defaultState;
                let draftTimestamp: Date | null = null;
                
                if (parsedDraft.data && parsedDraft.timestamp) {
                    // 새로운 형식
                    draftData = parsedDraft.data;
                    draftTimestamp = new Date(parsedDraft.timestamp);
                    console.log("임시 저장 데이터 타임스탬프:", draftTimestamp.toISOString());
                } else {
                    // 기존 형식 (하위 호환성)
                    draftData = parsedDraft;
                }
                
                // DB 업데이트 시간과 비교
                if (compareWithDbUpdateAt && draftTimestamp) {
                    const dbUpdateAt = new Date(compareWithDbUpdateAt);
                    if (dbUpdateAt > draftTimestamp) {
                        console.log("DB 데이터가 더 최신이므로 DB 데이터 사용");
                        return false; // DB 데이터 사용
                    }
                    console.log("localStorage 데이터가 더 최신이므로 localStorage 데이터 사용");
                }
                
                console.log("임시 저장 데이터 파싱 성공:", Object.keys(draftData).length, "개 필드");
                
                // Date 객체 복원
                const restoredWithDates = {
                    ...draftData,
                    enter_date: draftData.enter_date ? new Date(draftData.enter_date) : undefined,
                };

                setState({
                    ...defaultState,
                    ...restoredWithDates,
                });
                
                hasRestoredDraftRef.current = true;
                
                console.log("임시 저장 데이터 복원 완료");
                toast({
                    title: "임시 저장된 내용을 복원했습니다",
                    description: "이전에 입력하던 내용이 자동으로 불러와졌습니다.",
                });
                return true; // 복원 성공
            }
        } catch (error) {
            console.error("임시 저장 데이터 복원 실패:", error);
        }
        return false; // 복원 실패 또는 데이터 없음
    };

    // 상태 초기화
    const updateState = () => {
        // 이미 복원했다면 더 이상 처리하지 않음 (복원된 상태 유지)
        if (hasRestoredDraftRef.current) {
            console.log("이미 복원 완료, 상태 유지");
            return;
        }
        
        // 초기 로드 시에만 복원 시도
        if (!isInitialLoadRef.current) {
            return; // 이미 처리 완료
        }
        
        // guestProperty가 로드되었는지 확인
        if (!guestProperty) {
            // guestProperty가 아직 로드되지 않았으면 localStorage 복원 시도
            const restored = restoreDraft();
            if (restored) {
                isInitialLoadRef.current = false;
                console.log("guestProperty 로드 전, localStorage 복원 완료");
            }
            return;
        }
        
        // DB 데이터가 있는지 확인
        const hasData = guestProperty.data && Object.keys(guestProperty.data).length > 0 &&
                       (guestProperty.data.person || guestProperty.data.type || guestProperty.data.trade_types?.length > 0);
        
        if (hasData) {
            // DB 데이터가 있으면 타임스탬프 비교
            const dbUpdateAt = guestProperty.update_at ? new Date(guestProperty.update_at) : null;
            const restored = restoreDraft(dbUpdateAt || undefined);
            
            if (restored) {
                // localStorage 데이터가 더 최신이거나 복원 성공
                console.log("localStorage 데이터로 복원 완료 (DB 데이터보다 최신)");
                isInitialLoadRef.current = false;
                return;
            } else {
                // DB 데이터가 더 최신이면 DB 데이터 사용
                console.log("DB 데이터가 더 최신, DB 데이터 사용");
                const data = guestProperty.data;
                setState({
                    ...defaultState,
                    ...data
                });
                isInitialLoadRef.current = false;
                return;
            }
        } else {
            // DB 데이터가 없으면 localStorage 복원 시도
            const restored = restoreDraft();
            isInitialLoadRef.current = false;
            if (!restored) {
                setState({ ...defaultState });
                console.log("DB 데이터 없음, localStorage도 없음, 기본 상태로 초기화");
            } else {
                console.log("DB 데이터 없음, localStorage 복원 완료");
            }
            return;
        }
    };

    // const resetState = () => { // TODO: 상태 초기화 기능 구현 시 사용
    //     setState({ ...defaultState });
    //     localStorage.removeItem(draftStorageKey);
    // };

    // ✅ 경로 변경 시 초기화 (페이지 재방문 시 복원 가능하도록)
    useEffect(() => {
        // 경로가 변경되거나 컴포넌트가 마운트될 때마다 초기화
        isInitialLoadRef.current = true;
        hasRestoredDraftRef.current = false;
        console.log("경로/컴포넌트 초기화:", pathname, "게스트 매물 ID:", id);
    }, [pathname, id]); // 경로나 ID가 변경될 때마다 초기화

    // ✅ guestProperty 변경 시 상태 업데이트
    useEffect(() => {
        updateState();
    }, [guestProperty]);

    // ✅ 10초마다 주기적으로 자동 저장
    useEffect(() => {
        // 초기 로드 시에는 저장하지 않음
        if (isInitialLoadRef.current) {
            return;
        }
        
        const intervalId = setInterval(() => {
            try {
                // 타임스탬프와 함께 저장
                const draftData = {
                    data: stateRef.current,
                    timestamp: new Date().toISOString(),
                };
                localStorage.setItem(draftStorageKey, JSON.stringify(draftData));
                
                console.log("⏰ 10초 주기 자동 저장 완료:", {
                    timestamp: new Date().toISOString(),
                    fieldCount: Object.keys(stateRef.current).length,
                });
            } catch (error) {
                console.error("❌ 주기적 저장 실패:", error);
            }
        }, 10000); // 10초마다 실행
        
        return () => {
            clearInterval(intervalId);
        };
    }, [draftStorageKey]); // draftStorageKey가 변경될 때만 재설정

    // ✅ 페이지 경로 변경 감지 및 즉시 저장
    useEffect(() => {
        // 경로가 변경되었고, 이전 경로가 등록 페이지였다면 저장
        if (prevPathnameRef.current !== pathname && prevPathnameRef.current.includes('/register/')) {
            console.log("페이지 이동 감지:", prevPathnameRef.current, "->", pathname);
            saveImmediately();
        }
        prevPathnameRef.current = pathname;
    }, [pathname]);

    // ✅ 페이지 이탈 시 즉시 저장 및 경고 (beforeunload)
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            // ✅ 등록 중이면 경고 표시하지 않음 (ref와 window 플래그 모두 확인)
            if (isSubmittingRef.current || (typeof window !== "undefined" && (window as any).__isSubmittingGuestProperty)) {
                return;
            }
            
            // 먼저 저장
            saveImmediately();
            
            // 저장되지 않은 변경사항이 있는지 확인하여 경고
            const hasUnsavedChanges = Object.keys(stateRef.current).some((key) => {
                const value = stateRef.current[key as keyof typeof state];
                if (Array.isArray(value)) {
                    return value.length > 0;
                }
                if (value instanceof Date) {
                    return true;
                }
                if (typeof value === "string") {
                    return value.trim() !== "";
                }
                if (typeof value === "boolean") {
                    return value !== false;
                }
                return value !== "" && value !== undefined && value !== null;
            });

            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = "입력하신 내용이 저장되지 않았습니다. 페이지를 떠나시겠습니까?";
                return e.returnValue;
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, []); // 의존성 없음 - saveImmediately와 stateRef를 사용

    // ✅ 탭 전환/숨김 시 저장 (visibilitychange)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                console.log("페이지 숨김 감지, 즉시 저장");
                saveImmediately();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, []); // 의존성 없음 - saveImmediately는 stateRef를 사용

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
        // setArray가 setField를 호출하므로 setField에서 저장됨
    };
    
    // 서버에 저장 핸들러
    const handleSubmit = async () => {
        try {
            // ✅ 등록 시작 플래그 설정
            isSubmittingRef.current = true;
            
            const updatedData = {                                                                   // data 저장
                ...guestProperty?.data,
                ...state,
                type: state.type || guestProperty?.type || "",  // ✅ data에도 명시적으로 type 삽입
            };
            await updateGuestProperty(Number(id), "data", updatedData, "update_at", new Date());         // update 날짜 수정
            
            // ✅ 저장 성공 시 localStorage에서 임시 저장 데이터 삭제
            localStorage.removeItem(draftStorageKey);
            
            toast({
                title: "저장 완료",
                description: "매물 정보가 정상적으로 저장되었습니다.",
            });
        } catch (error) {
            // ✅ 에러 발생 시 플래그 해제
            isSubmittingRef.current = false;
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

export { useRegisterGuestProperty };
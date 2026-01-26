import { useState, useEffect, useRef } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import { useGetPropertyById, useUpdateProperty } from "@/hooks/apis";
import { toast } from "@/hooks/use-toast";
import { ImageListType } from "react-images-uploading";
import { useAtom, useAtomValue } from "jotai";
import { companyAtom, uploadInProgressCountAtom, uploadInProgressPropertyIdsAtom } from "@/store/atoms";
import { useUploadImages } from "../../image/useUploadImages";
import { supabase } from "@/utils/supabase/client";


const defaultState = {
    name: "",
    type: "",
    address: "",
    address_roadname: "",
    address_dong: "",
    address_ho: "",
    address_detail: "",
    latitude: "",
    longitude: "",
    complex_name: "",
    alarm: "",
    manager: "",
    manager_memo: "",
    phones: [] as string[],
    phone_owners: [] as string[],
    phone_telecoms: [] as string[],
    trade_types: [] as string[],
    trade_price: "",
    trade_price_vat: false,
    trade_deposit: "",
    trade_rent_deposit: "",
    trade_rent: "",
    trade_rent_vat: false,
    trade_rent_deposit_sub: "",
    trade_rent_sub: "",
    trade_rent_sub_vat: false,
    admin_cost: "",
    admin_cost_vat: false,
    admin_cost_self: false,
    admin_cost_includes: [] as string[],
    admin_cost_memo: "",
    already_tenant: "",
    already_tenant_memo: "",
    already_end_date: undefined as Date | undefined,
    already_renew_request: "",
    already_renew_request_memo: "",
    already_deposit: "",
    already_rent: "",
    already_admin_cost: "",
    already_premium: "",
    already_premium_memo: "",
    already_jobtype: "",
    already_jobwant: "",    
    enter_date: undefined as Date | undefined,
    enter_is_discuss: false,
    enter_is_now: false,
    enter_is_hasi: false,
    building_total_tenant: "",
    building_total_deposit: "",
    building_total_rent: "",
    building_total_admincost: "",
    building_total_cost: "",
    building_total_rate: "",
    building_rooms: [] as string[],
    building_deposits: [] as string[],
    building_rents: [] as string[],
    building_admincosts: [] as string[],
    building_memos: [] as string[],
    building_enddates: [] as Date[],
    building_jobs: [] as string[],
    base_infomation_memo: "",
    estate_use: "",
    interior: "",
    interior_memo: "",
    area_ground: "",
    area_grossfloor: "",
    area_supply: "",
    area_exclusive: "",
    area_type: "",
    area_reference: "",
    area_land_share: "",
    floor_applicable: "",
    floor_level: "",
    floor_top: "",
    floor_underground: "",
    floor_semibasement: false,
    floor_rooftop: false,
    direction_standard: "",
    direction_side: "",
    construction_standard: "",
    construction_date: undefined as Date | undefined,
    pet_allowed: "",
    pet_condition: "",
    water_possible: "",
    water_memo: "",
    structure_room: "",
    structure_bathroom: "",
    structure_living_room: "",
    structure_living_room_memo: "",
    parking_total: "",
    parking_method: [] as string[],
    parking_method_memo: "",
    parking_available: "",
    parking_number: "",
    parking_cost: "",
    parking_memo: "",
    violation: "",
    violation_memo: "",
    enterload: "",
    enterload_memo: "",
    land_use: "",
    land_use_memo: "",
    loan_held: "",
    loan_availability: "",
    other_information: "",
    heating_method: "",
    heating_fuel: "",
    house_aircon: [] as string[],
    house_options: [] as string[],
    house_options_memo: "",
    house_security: [] as string[],
    house_security_memo: "",
    house_other: [] as string[],
    house_other_memo: "",
    images: [] as ImageListType,
    images_watermark: [] as string[],
    evaluation: "",
    evaluation_star: "",
    naver_ad_number: "",
    secret_memo: "",
};


function useRegisterProperty() {
    const { id } = useParams();
    const pathname = usePathname();
    const { property } = useGetPropertyById(Number(id));
    const updateProperty = useUpdateProperty();
    const company = useAtomValue(companyAtom); // ✅ 회사 ID 가져오기
    const [uploadInProgressCount, setUploadInProgressCount] = useAtom(uploadInProgressCountAtom); // ✅ 전역 업로드 카운트
    const [uploadInProgressPropertyIds, setUploadInProgressPropertyIds] = useAtom(uploadInProgressPropertyIdsAtom); // ✅ 업로드 중인 매물 번호 목록

    const [state, setState] = useState({ ...defaultState });
    const draftStorageKey = `property_draft_${id}`;
    const isInitialLoadRef = useRef(true);
    const hasRestoredDraftRef = useRef(false);
    const prevPathnameRef = useRef(pathname);

    // ✅ localStorage에 즉시 저장하는 함수
    const saveToLocalStorage = (currentState: typeof state) => {
        if (isInitialLoadRef.current) return; // 초기 로드 시에는 저장하지 않음
        
        try {
            // 이미지는 제외하고 저장 (File 객체는 직렬화 불가)
            const { images, images_watermark, ...stateToSave } = currentState;
            
            // 타임스탬프와 함께 저장
            const draftData = {
                data: stateToSave,
                timestamp: new Date().toISOString(),
            };
            localStorage.setItem(draftStorageKey, JSON.stringify(draftData));
            console.log("즉시 저장 완료:", new Date().toISOString());
        } catch (error) {
            console.error("즉시 저장 실패:", error);
        }
    };

    // ✅ 버튼 클릭 항목 필드 목록
    const buttonFields = [
        'trade_types', 'house_options', 'house_aircon', 'house_security', 'house_other',
        'parking_method', 'admin_cost_includes', 'phones', 'phone_owners', 'phone_telecoms',
        'building_rooms', 'building_deposits', 'building_rents', 'building_admincosts',
        'building_memos', 'building_enddates', 'building_jobs',
        'direction_standard', 'direction_side', 'construction_standard', 'pet_allowed',
        'violation', 'enterload', 'land_use', 'heating_method', 'heating_fuel',
        'interior', 'water_possible', 'alarm', 'estate_use', 'type'
    ];

    // ✅ 단일 필드 업데이트
    const setField = (key: keyof typeof state, value: any) => {
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
            console.log("🔍 localStorage 확인:", {
                key: draftStorageKey,
                hasData: !!savedDraft,
                dataLength: savedDraft?.length || 0,
            });
            
            if (savedDraft) {
                // 저장된 데이터의 일부를 로그로 출력
                try {
                    const preview = JSON.parse(savedDraft);
                    console.log("📦 저장된 데이터 미리보기:", {
                        hasData: !!preview.data,
                        hasTimestamp: !!preview.timestamp,
                        timestamp: preview.timestamp,
                        sampleFields: preview.data ? {
                            direction_standard: preview.data.direction_standard,
                            direction_side: preview.data.direction_side,
                            construction_standard: preview.data.construction_standard,
                            pet_allowed: preview.data.pet_allowed,
                        } : null,
                    });
                } catch (e) {
                    console.error("데이터 미리보기 실패:", e);
                }
                const parsedDraft = JSON.parse(savedDraft);
                
                // 새로운 형식 (타임스탬프 포함)인지 확인
                let draftData: any;
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
                
                // DB 업데이트 시간과 비교 (정보만 로깅, 복원은 항상 진행)
                if (compareWithDbUpdateAt && draftTimestamp) {
                    const dbUpdateAt = new Date(compareWithDbUpdateAt);
                    const timeDiff = draftTimestamp.getTime() - dbUpdateAt.getTime();
                    console.log("타임스탬프 비교:", {
                        dbUpdateAt: dbUpdateAt.toISOString(),
                        draftTimestamp: draftTimestamp.toISOString(),
                        timeDiffMs: timeDiff,
                        dbIsNewer: dbUpdateAt > draftTimestamp,
                        localStorageIsNewer: draftTimestamp > dbUpdateAt
                    });
                    
                    if (draftTimestamp > dbUpdateAt) {
                        console.log("✅ localStorage 데이터가 더 최신 (최근 입력), 복원 진행");
                    } else {
                        console.log("⚠️ DB 데이터가 더 최신이지만, 사용자가 입력한 내용이 있을 수 있으므로 localStorage 데이터 복원");
                    }
                    // 타임스탬프와 관계없이 localStorage 데이터 복원 (사용자가 입력한 내용 우선)
                } else {
                    console.log("타임스탬프 비교 불가, localStorage 데이터 사용", {
                        hasDbUpdateAt: !!compareWithDbUpdateAt,
                        hasDraftTimestamp: !!draftTimestamp
                    });
                }
                
                console.log("임시 저장 데이터 파싱 성공:", Object.keys(draftData).length, "개 필드");
                console.log("복원할 주요 필드:", {
                    type: draftData.type,
                    address: draftData.address,
                    direction_standard: draftData.direction_standard,
                    direction_side: draftData.direction_side,
                    construction_standard: draftData.construction_standard,
                    pet_allowed: draftData.pet_allowed,
                    trade_types: draftData.trade_types,
                });
                
                // 이미지는 제외하고 복원 (이미지는 File 객체라 직렬화 불가)
                const { images, images_watermark, ...restoredData } = draftData;
                
                // Date 객체 복원
                const restoredWithDates = {
                    ...restoredData,
                    already_end_date: restoredData.already_end_date ? new Date(restoredData.already_end_date) : undefined,
                    enter_date: restoredData.enter_date ? new Date(restoredData.enter_date) : undefined,
                    construction_date: restoredData.construction_date ? new Date(restoredData.construction_date) : undefined,
                    building_enddates: restoredData.building_enddates?.map((d: string) => d ? new Date(d) : undefined) || [],
                };

                console.log("복원 전 상태:", {
                    direction_standard: state.direction_standard,
                    direction_side: state.direction_side,
                    construction_standard: state.construction_standard,
                    pet_allowed: state.pet_allowed,
                });
                
                setState({
                    ...defaultState,
                    ...restoredWithDates,
                });
                
                hasRestoredDraftRef.current = true;
                
                console.log("✅ 임시 저장 데이터 복원 완료, 상태 설정됨");
                console.log("복원 후 상태:", {
                    direction_standard: restoredWithDates.direction_standard,
                    direction_side: restoredWithDates.direction_side,
                    construction_standard: restoredWithDates.construction_standard,
                    pet_allowed: restoredWithDates.pet_allowed,
                });
                
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

    // ✅ DB 값 로드 → 상태 반영
    const updateState = () => {
        console.log("🔄 updateState 호출:", {
            hasRestored: hasRestoredDraftRef.current,
            isInitialLoad: isInitialLoadRef.current,
            hasProperty: !!property,
        });
        
        // 이미 복원했다면 더 이상 처리하지 않음 (복원된 상태 유지)
        if (hasRestoredDraftRef.current) {
            console.log("✅ 이미 복원 완료, 상태 유지");
            return;
        }
        
        // 초기 로드 시에만 복원 시도
        if (!isInitialLoadRef.current) {
            console.log("⚠️ 초기 로드가 아니므로 복원하지 않음");
            return; // 이미 처리 완료
        }
        
        // property가 로드되었는지 확인
        if (!property) {
            console.log("📡 property 로드 전, localStorage 복원 시도");
            // property가 아직 로드되지 않았으면 localStorage 복원 시도
            const restored = restoreDraft();
            if (restored) {
                isInitialLoadRef.current = false;
                console.log("✅ property 로드 전, localStorage 복원 완료");
            } else {
                console.log("❌ property 로드 전, localStorage 복원 실패");
            }
            return;
        }
        
        // DB 데이터가 있는지 확인
        const hasData = property.data && Object.keys(property.data).length > 0 && 
                       (property.data.address || property.data.type || property.data.trade_types?.length > 0);
        
        console.log("📊 DB 데이터 확인:", {
            hasData,
            dataKeys: property.data ? Object.keys(property.data).length : 0,
            hasAddress: !!property.data?.address,
            hasType: !!property.data?.type,
            hasTradeTypes: !!property.data?.trade_types?.length,
        });
        
        if (hasData) {
            // DB 데이터가 있으면 먼저 localStorage 복원 시도 (사용자가 입력한 내용 우선)
            const dbUpdateAt = property.update_at ? new Date(property.update_at) : null;
            console.log("🔍 DB 데이터 있음, localStorage 복원 시도 (사용자 입력 내용 우선)");
            const restored = restoreDraft(dbUpdateAt || undefined);
            
            if (restored) {
                // localStorage 데이터 복원 성공
                console.log("✅ localStorage 데이터로 복원 완료 (사용자 입력 내용 우선)");
                isInitialLoadRef.current = false;
                return;
            } else {
                // localStorage에 데이터가 없거나 복원 실패 시 DB 데이터 사용
                console.log("📥 localStorage 복원 실패 또는 데이터 없음, DB 데이터 사용");
                const data = property.data;
                setState({
                    ...defaultState,
                    ...data,
                    images: (data.images || []).map((url: string) => ({
                        data_url: url,
                        file: undefined,
                    })),
                });
                isInitialLoadRef.current = false;
                return;
            }
        } else {
            // DB 데이터가 없으면 localStorage 복원 시도
            console.log("📭 DB 데이터 없음, localStorage 복원 시도");
            const restored = restoreDraft();
            isInitialLoadRef.current = false;
            if (!restored) {
                setState({ ...defaultState });
                console.log("❌ DB 데이터 없음, localStorage도 없음, 기본 상태로 초기화");
            } else {
                console.log("✅ DB 데이터 없음, localStorage 복원 완료");
            }
            return;
        }
    };

    const resetState = () => {
        setState({ ...defaultState });
        localStorage.removeItem(draftStorageKey);
    };

    // ✅ 경로 변경 시 초기화 (페이지 재방문 시 복원 가능하도록)
    useEffect(() => {
        // 경로가 변경되거나 컴포넌트가 마운트될 때마다 초기화
        isInitialLoadRef.current = true;
        hasRestoredDraftRef.current = false;
        console.log("경로/컴포넌트 초기화:", pathname, "매물 ID:", id);
    }, [pathname, id]); // 경로나 ID가 변경될 때마다 초기화

    // ✅ property 변경 시 상태 업데이트
    useEffect(() => {
        console.log("property 변경 감지:", {
            hasProperty: !!property,
            hasData: property?.data ? Object.keys(property.data).length > 0 : false,
            hasRestored: hasRestoredDraftRef.current,
            isInitialLoad: isInitialLoadRef.current,
        });
        updateState();
    }, [property]);

    // ✅ 최신 상태를 참조하기 위한 ref
    const stateRef = useRef(state);
    
    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    // ✅ 즉시 저장 함수 (페이지 이탈 시 사용)
    const saveImmediately = () => {
        if (isInitialLoadRef.current) return;
        
        try {
            // 이미지는 제외하고 저장 (File 객체는 직렬화 불가)
            const { images, images_watermark, ...stateToSave } = stateRef.current;
            
            // 타임스탬프와 함께 저장
            const draftData = {
                data: stateToSave,
                timestamp: new Date().toISOString(),
            };
            localStorage.setItem(draftStorageKey, JSON.stringify(draftData));
            console.log("🚀 즉시 저장 완료 (페이지 이탈):", new Date().toISOString());
        } catch (error) {
            console.error("❌ 즉시 저장 실패:", error);
        }
    };

    // ✅ 10초마다 주기적으로 자동 저장
    useEffect(() => {
        // 초기 로드 시에는 저장하지 않음
        if (isInitialLoadRef.current) {
            return;
        }
        
        const intervalId = setInterval(() => {
            try {
                // 이미지는 제외하고 저장 (File 객체는 직렬화 불가)
                const { images, images_watermark, ...stateToSave } = stateRef.current;
                
                // 타임스탬프와 함께 저장
                const draftData = {
                    data: stateToSave,
                    timestamp: new Date().toISOString(),
                };
                localStorage.setItem(draftStorageKey, JSON.stringify(draftData));
                
                console.log("⏰ 10초 주기 자동 저장 완료:", {
                    timestamp: new Date().toISOString(),
                    fieldCount: Object.keys(stateToSave).length,
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

    // ✅ 페이지 이탈 시 경고는 beforeunload에서 이미 처리됨

    // ✅ 다중 선택 토글
    const toggleSelection = (
        value: string,
        currentArray: string[],
        setArray: (newArray: string[]) => void
    ) => {
        const isSelected = currentArray.includes(value);
        const newArray = isSelected
            ? currentArray.filter((item) => item !== value)
            : [...currentArray, value];
        setArray(newArray);
        // setArray가 setField를 호출하므로 setField에서 저장됨
    };

    // ✅ 매물 등록/수정/임시저장 (백그라운드 이미지 처리)
    const handleSubmit = async (temporary: boolean) => {
        try {
            const propertyId = Number(id);
            if (!propertyId) {
                toast({
                    variant: "destructive",
                    title: "잘못된 매물 ID",
                    description: "매물 ID가 유효하지 않습니다.",
                });
                return;
            }

            // ✅ 1️⃣ 기존 DB 이미지 목록 (워터마크 기준)
            const prevUrls = property?.data?.images_watermark || property?.data?.images || [];

            // ✅ 2️⃣ 현재 상태 이미지 목록
            const currentUrls = state.images.map((img) => img.data_url || "");

            // ✅ 3️⃣ 즉시 DB 저장 (기존 이미지 URL 유지 또는 빈 배열)
            // 이미지 업로드는 백그라운드에서 처리
            const updatedData = {
                ...property?.data,
                ...state,
                // 기존 이미지 URL 유지 (새 이미지는 백그라운드에서 업로드 후 업데이트)
                images: prevUrls.length > 0 ? prevUrls : [],
                images_watermark: prevUrls.length > 0 ? prevUrls : [],
            };

            await updateProperty(
                propertyId,
                "is_register",
                "data",
                updatedData,
                "update_at",
                new Date(),
                temporary
            );

            // ✅ 4️⃣ 백그라운드에서 이미지 업로드 시작 (await 하지 않음)
            const uploadImagesInBackground = async () => {
                try {
                    // 새 이미지 업로드 (회사별 워터마크 포함)
                    const { originals, watermarks } = await useUploadImages(propertyId, state.images, company);
                    const finalOriginals = originals.filter((url) => !!url);
                    const finalWatermarks = watermarks.filter((url) => !!url);

                    // 삭제된 이미지 찾기
                    const deletedUrls = prevUrls.filter((prevUrl) => !currentUrls.includes(prevUrl));

                    if (deletedUrls.length > 0) {
                        const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
                        const deletePaths: string[] = [];

                        deletedUrls.forEach((url) => {
                            const relativePath = url.replace(
                                `${base}/storage/v1/object/public/uploads/`,
                                ""
                            );

                            // 워터마크 파일 삭제
                            deletePaths.push(relativePath);

                            // 원본 파일 경로 계산
                            if (relativePath.includes("/watermark/")) {
                                const originalPath = relativePath.replace("/watermark/", "/");
                                deletePaths.push(originalPath);
                            }
                        });

                        // Supabase Storage에서 실제 파일 삭제
                        const { error: deleteError } = await supabase.storage
                            .from("uploads")
                            .remove(deletePaths);

                        if (deleteError) {
                            console.error("🛑 이미지 삭제 실패:", deleteError.message);
                        } else {
                            console.log("🗑️ 삭제된 이미지:", deletePaths);
                        }
                    }

                    // 이미지 업로드 완료 후 DB 업데이트
                    const finalData = {
                        ...property?.data,
                        ...state,
                        images: finalOriginals,
                        images_watermark: finalWatermarks,
                    };

                    await updateProperty(
                        propertyId,
                        "is_register",
                        "data",
                        finalData,
                        "update_at",
                        new Date(),
                        temporary
                    );

                    console.log("✅ 백그라운드 이미지 업로드 완료");
                } catch (error) {
                    console.error("❌ 백그라운드 이미지 업로드 오류:", error);
                    // 백그라운드 오류는 조용히 처리 (사용자에게는 이미 성공 메시지 표시됨)
                } finally {
                    // 전역 업로드 카운트/매물번호 업데이트
                    setUploadInProgressCount((prev) => Math.max(0, prev - 1));
                    setUploadInProgressPropertyIds((prev) =>
                        prev.filter((pid) => pid !== propertyId)
                    );
                }
            };

            // 백그라운드 작업 시작 (await 하지 않음)
            setUploadInProgressCount((prev) => prev + 1);
            setUploadInProgressPropertyIds((prev) =>
                prev.includes(propertyId) ? prev : [...prev, propertyId]
            );
            uploadImagesInBackground();

            // ✅ 5️⃣ 저장 성공 시 localStorage에서 임시 저장 데이터 삭제
            if (!temporary) {
                localStorage.removeItem(draftStorageKey);
            }

            // ✅ 6️⃣ 즉시 성공 알림
            toast({
                title: temporary ? "임시 저장 완료" : "등록 완료",
                description: temporary
                    ? "임시 저장되었습니다. 이미지는 백그라운드에서 처리 중입니다."
                    : "매물 정보가 정상적으로 저장되었습니다. 이미지는 백그라운드에서 처리 중입니다.",
            });
        } catch (error) {
            console.error("❌ handleSubmit Error:", error);
            toast({
                variant: "destructive",
                title: "네트워크 오류",
                description: "서버와 연결할 수 없습니다. 다시 시도해주세요.",
            });
            throw error; // 상위에서 에러 처리할 수 있도록 throw
        }
    };

    return {
        state,
        setField,
        toggleSelection,
        handleSubmit,
        resetState,
    };
}

export { useRegisterProperty };
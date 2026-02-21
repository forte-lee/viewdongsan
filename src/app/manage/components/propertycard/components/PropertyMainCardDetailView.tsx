"use client";

import { Property } from "@/types";
import { PropertyRadar } from "@/components/ui";
import { ShowData } from "@/app/manage/components/propertycard/Data";
import { Label } from "@radix-ui/react-label";
import { useEffect, useMemo, useState } from "react";
import { useAtom } from "jotai";
import { propertysAtom } from "@/store/atoms";
import MapContainer from "@/components/kakaomap/MapContainer";
import { supabase } from "@/utils/supabase/client";
import { convertUnitFromMan } from "@/utils/convertUnitFromMan";
// import html2canvas from "html2canvas"; // TODO: 화면 캡처 기능 구현 시 사용
import { calculatePriceScore } from "@/utils/calculatePriceScore";
import { calculateSizeScore } from "@/utils/calculateSizeScore";
import { calculateConditionScore } from "@/utils/calculateConditionScore";
import { calculateFreshnessScore } from "@/utils/calculateFreshnessScore";
import { calculateOtherScore } from "@/utils/calculateOtherScore";
import { calculateAveragePriceScore } from "@/utils/calculateAveragePriceScore";
import { calculateAverageSizeScore } from "@/utils/calculateAverageSizeScore";
import { calculateAverageConditionScore } from "@/utils/calculateAverageConditionScore";
import { calculateAverageFreshnessScore } from "@/utils/calculateAverageFreshnessScore";
import { calculateAverageOtherScore } from "@/utils/calculateAverageOtherScore";
import { 
    normalizePriceScore, 
    normalizeSizeScore, 
    normalizeConditionScore, 
    normalizeFreshnessScore, 
    normalizeOtherScore,
    normalizeAveragePriceScore,
    normalizeAverageSizeScore,
    normalizeAverageConditionScore,
    normalizeAverageFreshnessScore,
    normalizeAverageOtherScore
} from "@/utils/normalizeScores";
import {
    getPriceScoreRangeAndCount,
    getSizeScoreRangeAndCount,
    getConditionScoreRangeAndCount,
    getFreshnessScoreRangeAndCount,
    getOtherScoreRangeAndCount
} from "@/utils/getScoreRangeAndCount";
// import { extractDistrict } from "@/utils/extractDistrict"; // TODO: 사용 예정

interface PropertyMainCardDetailViewProps {
    property_Data: Property;
    data: ShowData;
    images: string[];
    initialIndex?: number; // ← (선택) 쿼리에서 index를 받을 때 사용
    propertysAll?: Property[]; // ← (선택) 팝업 창에서 사용할 전체 매물 목록
}

function getAddressWithoutJibun(address: string) {
    if (!address) return "";
    // 숫자가 처음 등장하기 전까지만 (지번, 동/층/호 제거)
    const match = address.match(/^[^\d]+/);
    return match ? match[0].trim() : address;
}

// 아파트/오피스텔용 주소 포맷팅 함수
function formatAddressForAptOfficetel(
    address: string,
    complexName: string | null | undefined,
    addressDong: string | undefined,
    propertyType: string
): string {
    // 기본 주소 (동까지만, 번지수 제거)
    const baseAddress = getAddressWithoutJibun(address || "");
    
    // 아파트 또는 오피스텔인 경우
    if (propertyType === "아파트" || propertyType === "오피스텔") {
        const parts: string[] = [];
        
        // 주소 추가
        if (baseAddress) {
            parts.push(baseAddress);
        }
        
        // 단지명 추가
        if (complexName && complexName.trim()) {
            parts.push(complexName.trim());
        }
        
        // 동번호 추가
        if (addressDong && addressDong.trim()) {
            parts.push(`${addressDong.trim()}동`);
        }
        
        return parts.join(" ");
    }
    
    // 그 외의 경우 기본 주소만 반환
    return baseAddress;
}

function PropertyMainCardDetailView({
    property_Data,
    data,
    images,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    initialIndex: _ = 0, // TODO: 이미지 표시 기능 구현 시 사용
    propertysAll: propertysAllProp,
}: PropertyMainCardDetailViewProps) {
    // 거래 유형 선택 상태
    const availableTradeTypes = useMemo(() => {
        const types = property_Data?.data?.trade_types || [];
        return (["매매", "전세", "월세"] as const).filter(t => types.includes(t));
    }, [property_Data?.data?.trade_types]);

    const [selectedTradeType, setSelectedTradeType] = useState<"매매" | "전세" | "월세" | null>(
        availableTradeTypes[0] ?? null
    );

    // 사용 가능한 거래 유형이 변경되면 선택된 거래 유형도 업데이트
    useEffect(() => {
        if (availableTradeTypes.length > 0 && (!selectedTradeType || !availableTradeTypes.includes(selectedTradeType))) {
            setSelectedTradeType(availableTradeTypes[0]);
        } else if (availableTradeTypes.length === 0) {
            setSelectedTradeType(null);
        }
    }, [availableTradeTypes, selectedTradeType]);
    // const safeInitial = useMemo(() => { // TODO: 이미지 표시 기능 구현 시 사용
    //     if (!Array.isArray(images) || images.length === 0) return 0;
    //     const idx = Number.isFinite(initialIndex) ? initialIndex : 0;
    //     return Math.min(Math.max(idx, 0), images.length - 1);
    // }, [images, initialIndex]);

    // const [isSendMode, setIsSendMode] = useState(true);        // TODO: 캡쳐모드 (상시 활성화)
    // const [isPreviewMode, setIsPreviewMode] = useState(true);  // TODO: 미리보기 (상시 활성화)

    // 전체 매물 목록 가져오기 (평균 계산용)
    // props로 받은 값이 있으면 사용하고, 없으면 jotai에서 가져오기 (기존 동작 유지)
    const [propertysAllFromAtom] = useAtom(propertysAtom);
    const propertysAll = propertysAllProp ?? propertysAllFromAtom;

    // 등록 부동산 정보 가져오기 (매물을 등록한 직원의 회사 정보)
    const [companyName, setCompanyName] = useState<string | null>(null);
    const [companyPhone, setCompanyPhone] = useState<string | null>(null);

    useEffect(() => {
        const fetchRegisteredCompanyInfo = async () => {
            const employeeId = property_Data?.employee_id;
            if (!employeeId) return;

            // 1. 직원의 company_id 조회
            const { data: employeeData, error: employeeError } = await supabase
                .from("employee")
                .select("company_id")
                .eq("id", employeeId)
                .maybeSingle();

            if (employeeError || !employeeData?.company_id) {
                if (employeeError) console.error("❌ 직원 정보 조회 실패:", employeeError);
                return;
            }

            // 2. 회사 정보 조회
            const { data: companyData, error: companyError } = await supabase
                .from("company")
                .select("company_name, company_phone")
                .eq("id", employeeData.company_id)
                .maybeSingle();

            if (companyError || !companyData) {
                console.error("❌ 회사 정보를 가져오는 데 실패했습니다:", companyError);
                return;
            }

            setCompanyName(companyData.company_name);
            setCompanyPhone(companyData.company_phone);
        };

        fetchRegisteredCompanyInfo();
    }, [property_Data?.employee_id]);

    // 금액 항목 선택 상태 - TODO: UI에서 사용 예정
    const [showTradePrice] = useState(true);
    const [showTradeDeposit] = useState(true);
    const [showTradeRent] = useState(true);
    const [showTradeRentSub] = useState(true);
    const [showAdminCost] = useState(true);

    // 이미지
    const [selectedImages, setSelectedImages] = useState<string[]>([]);

    // 매물정보 항목 선택 상태 - TODO: UI에서 사용 예정
    const [selectedFields] = useState<Record<string, boolean>>({});

    // 한줄평 - TODO: UI에서 사용 예정
    const [showReview] = useState(true);


    // const [currentIndex, setCurrentIndex] = useState(safeInitial); // TODO: 이미지 표시 기능 구현 시 사용
    // const [showContacts, setShowContacts] = useState(false); // TODO: 연락처 표시 기능 구현 시 사용

    // const [isCapturingMap, setIsCapturingMap] = useState(false); // TODO: 지도 캡처 기능 구현 시 사용
    // const [staticMapUrl, setStaticMapUrl] = useState<string | null>(null); // TODO: 정적 지도 URL 기능 구현 시 사용

    const hasImages = Array.isArray(images) && images.length > 0;
    // const currentImg = hasImages ? images[currentIndex] : undefined; // TODO: 이미지 표시 기능 구현 시 사용

    // const nextImage = () =>
    //     setCurrentIndex((prev) => (prev + 1) % (hasImages ? images.length : 1));
    // const prevImage = () =>
    //     setCurrentIndex((prev) =>
    //         (prev - 1 + (hasImages ? images.length : 1)) % (hasImages ? images.length : 1)
    //     );

    // 숫자인 경우에만 좌표 전달 (TODO: 지도 표시 기능 구현 시 사용)
    // const latRaw = data?.sd_latitude;
    // const lngRaw = data?.sd_longitude;
    // const lat = typeof latRaw === "number" ? latRaw : Number(latRaw);
    // const lng = typeof lngRaw === "number" ? lngRaw : Number(lngRaw);
    // const latitude = Number.isFinite(lat) ? lat : undefined;
    // const longitude = Number.isFinite(lng) ? lng : undefined;
    
    // 원본 점수 계산 (선택된 거래 유형에 따라)
    const rawPriceScore = useMemo(() => {
        // TODO: ShowData에 거래 유형별 점수를 저장하는 경우를 고려할 수 있음
        // 현재는 선택된 거래 유형에 따라 실시간으로 계산
        if (!selectedTradeType) {
            return 0;
        }
        return calculatePriceScore(property_Data?.data, selectedTradeType) ?? 0;
    }, [property_Data?.data, selectedTradeType]);

    const rawSizeScore = useMemo(() => {
        if (data?.score_size !== undefined && data?.score_size !== null) {
            return data.score_size;
        }
        return calculateSizeScore(property_Data?.data) ?? 0;
    }, [data?.score_size, property_Data?.data]);

    const rawConditionScore = useMemo(() => {
        if (data?.score_condition !== undefined && data?.score_condition !== null) {
            return data.score_condition;
        }
        return calculateConditionScore(property_Data?.data) ?? 0;
    }, [data?.score_condition, property_Data?.data]);

    const rawFreshnessScore = useMemo(() => {
        if (data?.score_freshness !== undefined && data?.score_freshness !== null) {
            return data.score_freshness;
        }
        return calculateFreshnessScore(property_Data) ?? 0;
    }, [data?.score_freshness, property_Data]);

    const rawOtherScore = useMemo(() => {
        if (data?.score_other !== undefined && data?.score_other !== null) {
            return data.score_other;
        }
        return calculateOtherScore(property_Data?.data) ?? 0;
    }, [data?.score_other, property_Data?.data]);

    // 정규화된 점수 (0~10 범위)
    const priceScore = useMemo(() => {
        if (!selectedTradeType || !propertysAll || propertysAll.length === 0 || !property_Data || rawPriceScore === 0) {
            return rawPriceScore;
        }
        return normalizePriceScore(property_Data, propertysAll, rawPriceScore, selectedTradeType);
    }, [rawPriceScore, property_Data, propertysAll, selectedTradeType]);

    const sizeScore = useMemo(() => {
        if (!propertysAll || propertysAll.length === 0 || !property_Data || rawSizeScore === 0) {
            return rawSizeScore;
        }
        return normalizeSizeScore(property_Data, propertysAll, rawSizeScore);
    }, [rawSizeScore, property_Data, propertysAll]);

    const conditionScore = useMemo(() => {
        // 컨디션 점수는 별점 1~5를 0~10으로 변환하므로 항상 정규화 실행
        if (rawConditionScore === 0 || rawConditionScore === undefined) {
            return rawConditionScore;
        }
        return normalizeConditionScore(property_Data, propertysAll, rawConditionScore);
    }, [rawConditionScore, property_Data, propertysAll]);

                const freshnessScore = useMemo(() => {
                    if (!propertysAll || propertysAll.length === 0 || !property_Data || rawFreshnessScore === 0) {
                        return rawFreshnessScore;
                    }
                    return normalizeFreshnessScore(property_Data, propertysAll, rawFreshnessScore);
                }, [rawFreshnessScore, property_Data, propertysAll]);

    const otherScore = useMemo(() => {
        if (!propertysAll || propertysAll.length === 0 || !property_Data || rawOtherScore === 0) {
            return rawOtherScore;
        }
        return normalizeOtherScore(property_Data, propertysAll, rawOtherScore);
    }, [rawOtherScore, property_Data, propertysAll]);

    // 평균 점수 계산 (원본 값, 선택된 거래 유형에 따라)
    const rawAvgPriceScore = useMemo(() => {
        // TODO: ShowData에 거래 유형별 평균 점수를 저장하는 경우를 고려할 수 있음
        if (!selectedTradeType || !propertysAll || propertysAll.length === 0 || !property_Data) {
            return 0;
        }
        return calculateAveragePriceScore(property_Data, propertysAll, selectedTradeType) ?? 0;
    }, [data?.avg_price, property_Data, propertysAll, selectedTradeType]);

    const rawAvgSizeScore = useMemo(() => {
        if (data?.avg_size !== undefined && data?.avg_size !== null) {
            return data.avg_size;
        }
        if (!propertysAll || propertysAll.length === 0 || !property_Data) {
            return 0;
        }
        return calculateAverageSizeScore(property_Data, propertysAll) ?? 0;
    }, [data?.avg_size, property_Data, propertysAll]);

    const rawAvgConditionScore = useMemo(() => {
        if (data?.avg_condition !== undefined && data?.avg_condition !== null) {
            return data.avg_condition;
        }
        if (!propertysAll || propertysAll.length === 0 || !property_Data) {
            return 0;
        }
        return calculateAverageConditionScore(property_Data, propertysAll) ?? 0;
    }, [data?.avg_condition, property_Data, propertysAll]);

                const rawAvgFreshnessScore = useMemo(() => {
                    if (data?.avg_freshness !== undefined && data?.avg_freshness !== null) {
                        return data.avg_freshness;
                    }
                    if (!propertysAll || propertysAll.length === 0 || !property_Data) {
                        return 0;
                    }
                    return calculateAverageFreshnessScore(property_Data, propertysAll) ?? 0;
                }, [data?.avg_freshness, property_Data, propertysAll]);

    const rawAvgOtherScore = useMemo(() => {
        if (data?.avg_other !== undefined && data?.avg_other !== null) {
            return data.avg_other;
        }
        if (!propertysAll || propertysAll.length === 0 || !property_Data) {
            return 0;
        }
        return calculateAverageOtherScore(property_Data, propertysAll) ?? 0;
    }, [data?.avg_other, property_Data, propertysAll]);

    // 정규화된 평균 점수 (0~10 범위)
    const avgPriceScore = useMemo(() => {
        if (!selectedTradeType || !propertysAll || propertysAll.length === 0 || !property_Data || rawAvgPriceScore === 0) {
            return rawAvgPriceScore;
        }
        return normalizeAveragePriceScore(property_Data, propertysAll, rawAvgPriceScore, selectedTradeType);
    }, [rawAvgPriceScore, property_Data, propertysAll, selectedTradeType]);

    const avgSizeScore = useMemo(() => {
        if (!propertysAll || propertysAll.length === 0 || !property_Data || rawAvgSizeScore === 0) {
            return rawAvgSizeScore;
        }
        return normalizeAverageSizeScore(property_Data, propertysAll, rawAvgSizeScore);
    }, [rawAvgSizeScore, property_Data, propertysAll]);

    const avgConditionScore = useMemo(() => {
        // 컨디션 점수는 별점 1~5를 0~10으로 변환하므로 항상 정규화 실행
        if (rawAvgConditionScore === 0 || rawAvgConditionScore === undefined) {
            return rawAvgConditionScore;
        }
        return normalizeAverageConditionScore(property_Data, propertysAll, rawAvgConditionScore);
    }, [rawAvgConditionScore, property_Data, propertysAll]);

                const avgFreshnessScore = useMemo(() => {
                    if (!propertysAll || propertysAll.length === 0 || !property_Data || rawAvgFreshnessScore === 0) {
                        return rawAvgFreshnessScore;
                    }
                    return normalizeAverageFreshnessScore(property_Data, propertysAll, rawAvgFreshnessScore);
                }, [rawAvgFreshnessScore, property_Data, propertysAll]);

    const avgOtherScore = useMemo(() => {
        if (!propertysAll || propertysAll.length === 0 || !property_Data || rawAvgOtherScore === 0) {
            return rawAvgOtherScore;
        }
        return normalizeAverageOtherScore(property_Data, propertysAll, rawAvgOtherScore);
    }, [rawAvgOtherScore, property_Data, propertysAll]);

    // 각 항목별 범위와 개수 계산 (선택된 거래 유형에 따라)
    const priceRange = useMemo(() => {
        if (!selectedTradeType || !propertysAll || propertysAll.length === 0 || !property_Data) {
            return undefined;
        }
        return getPriceScoreRangeAndCount(property_Data, propertysAll, selectedTradeType);
    }, [property_Data, propertysAll, selectedTradeType]);

    const sizeRange = useMemo(() => {
        if (!propertysAll || propertysAll.length === 0 || !property_Data) {
            return undefined;
        }
        return getSizeScoreRangeAndCount(property_Data, propertysAll);
    }, [property_Data, propertysAll]);

    const conditionRange = useMemo(() => {
        if (!propertysAll || propertysAll.length === 0 || !property_Data) {
            return undefined;
        }
        return getConditionScoreRangeAndCount(property_Data, propertysAll);
    }, [property_Data, propertysAll]);

                const freshnessRange = useMemo(() => {
                    if (!propertysAll || propertysAll.length === 0 || !property_Data) {
                        return undefined;
                    }
                    return getFreshnessScoreRangeAndCount(property_Data, propertysAll);
                }, [property_Data, propertysAll]);

    const otherRange = useMemo(() => {
        if (!propertysAll || propertysAll.length === 0 || !property_Data) {
            return undefined;
        }
        return getOtherScoreRangeAndCount(property_Data, propertysAll);
    }, [property_Data, propertysAll]);





    
    // 화면 캡쳐 함수 (TODO: 사용 예정)
    // const handleCapture = async () => {
    //     const target = document.getElementById("property-detail-view");
    //     if (!target) return;
    //
    //     // Static Map 로드 대기 함수
    //     const waitForStaticMapLoad = () =>
    //         new Promise((resolve) => {
    //             const img = document.getElementById("static-map-img") as HTMLImageElement;
    //             if (!img) return resolve(null);
    //             if (img.complete) return resolve(null);
    //
    //             img.onload = () => resolve(null);
    //             img.onerror = () => resolve(null);
    //         });
    //
    //     // 1) 지도 StaticMap 모드 ON (카카오맵 → 정적 지도 이미지로 교체)
    //     setIsCapturingMap(true);
    //
    //     // 2) StaticMap 이미지 로드될 때까지 기다림
    //     await waitForStaticMapLoad();
    //
    //     // 2-1) 안정화를 위해 살짝 딜레이
    //     await new Promise((res) => setTimeout(res, 1000));
    //
    //     // 3) 캡쳐 시 필요한 UI 숨기기
    //     document.body.classList.add("capturing");
    //
    //     try {
    //         const canvas = await html2canvas(target, {
    //             scale: 2,
    //             useCORS: true,
    //             allowTaint: true,
    //             logging: false,
    //         });
    //
    //         // 파일 이름
    //         const trade =
    //             data.sd_trade_price ||
    //             data.sd_trade_deposit ||
    //             data.sd_trade_rent ||
    //             data.sd_trade_rent_sub ||
    //             "가격미정";

            // const now = new Date(); // TODO: 파일명 생성 시 사용
            // const YYYY = now.getFullYear();
            // const MM = String(now.getMonth() + 1).padStart(2, "0");
            // const DD = String(now.getDate()).padStart(2, "0");
            // const HH = String(now.getHours()).padStart(2, "0");
            // const mm = String(now.getMinutes()).padStart(2, "0");
            // const SS = String(now.getSeconds()).padStart(2, "0");
            // const timestamp = `${YYYY}${MM}${DD}${HH}${mm}${SS}`; // TODO: 파일명 생성 시 사용
    //         const fileName = `${property_Data.property_type}_${trade}_${timestamp}.png`;
    //         const link = document.createElement("a");
    //         link.download = fileName;
    //         link.href = canvas.toDataURL("image/png");
    //         link.click();
    //     } finally {
    //         document.body.classList.remove("capturing");
    //         setIsCapturingMap(false); // 원래 카카오맵으로 복귀
    //     }
    // };



    // 정보 테이블에 표시할 항목을 조건에 따라 선택
    const getTableItems = () => {
        const { property_type } = property_Data;

        switch (property_type) {
            case "아파트":
                return [
                    { label: "단지명", value: data.sd_complex },
                    { label: "매물종류/용도", value: `${data.sd_type} / ${data.sd_estate_use}` },
                    { label: "입주가능일", value: data.sd_enter_date },
                    { label: "준공년도", value: data.sd_construct_date },
                    { label: "룸/욕실", value: data.sd_room_infor },
                    { label: "면적", value: data.sd_area },
                    { label: "해당층/총층", value: `${data.sd_floor_level && data.sd_floor_level !== "" ? data.sd_floor_level : data.sd_floor_applicable?.replace('층', '')} / ${data.sd_floor_top?.replace('층', '')}` },
                    { label: "주차/총주차", value: `${data.sd_parking_infor} / ${property_Data.data.parking_total}대`},
                    { label: "반려동물", value: data.sd_pet },
                    { label: "방향", value: property_Data.data.direction_side},
                    { label: "건축물일자", value: data.sd_construct_date},
                    { label: "위반사항", value: data.sd_violation},
                    { label: "옵션", value: data.sd_options },
                    { label: "기타사항", value: data.sd_other_options },
                    { label: "특이사항", value: data.sd_otherinfor },
                ];

            case "오피스텔":
                return [
                    { label: "단지명", value: data.sd_complex },
                    { label: "매물종류/용도", value: `${data.sd_type} / ${data.sd_estate_use}` },
                    { label: "입주가능일", value: data.sd_enter_date },
                    { label: "룸/욕실", value: data.sd_room_infor },
                    { label: "면적", value: data.sd_area },
                    { label: "해당층/총층", value: `${data.sd_floor_level && data.sd_floor_level !== "" ? data.sd_floor_level : data.sd_floor_applicable?.replace('층', '')} / ${data.sd_floor_top?.replace('층', '')}` },
                    { label: "주차/총주차", value: `${data.sd_parking_infor} / ${property_Data.data.parking_total}대`},
                    { label: "반려동물", value: data.sd_pet },
                    { label: "방향", value: property_Data.data.direction_side},
                    { label: "건축물일자", value: data.sd_construct_date},
                    { label: "위반사항", value: data.sd_violation},
                    { label: "옵션", value: data.sd_options },
                    { label: "기타사항", value: data.sd_other_options },
                    { label: "특이사항", value: data.sd_otherinfor },
                ];

            case "공동주택(아파트 외)":
                return [
                    { label: "매물종류/용도", value: `${data.sd_type} / ${data.sd_estate_use}` },
                    { label: "입주가능일", value: data.sd_enter_date },
                    { label: "룸/욕실", value: data.sd_room_infor },
                    { label: "면적", value: data.sd_area },
                    { label: "해당층/총층", value: `${data.sd_floor_level && data.sd_floor_level !== "" ? data.sd_floor_level : data.sd_floor_applicable?.replace('층', '')} / ${data.sd_floor_top?.replace('층', '')}` },
                    { label: "주차/총주차", value: `${data.sd_parking_infor} / ${property_Data.data.parking_total}대`},
                    { label: "반려동물", value: data.sd_pet },
                    { label: "방향", value: property_Data.data.direction_side},
                    { label: "건축물일자", value: data.sd_construct_date},
                    { label: "위반사항", value: data.sd_violation},
                    { label: "옵션", value: data.sd_options },
                    { label: "기타사항", value: data.sd_other_options },
                    { label: "특이사항", value: data.sd_otherinfor },
                ];

            case "단독주택(임대)":
                return [
                    { label: "매물종류/용도", value: `${data.sd_type} / ${data.sd_estate_use}` },
                    { label: "입주가능일", value: data.sd_enter_date },
                    { label: "룸/욕실", value: data.sd_room_infor },
                    { label: "면적", value: data.sd_area },
                    { label: "해당층/총층", value: `${data.sd_floor_level && data.sd_floor_level !== "" ? data.sd_floor_level : data.sd_floor_applicable?.replace('층', '')} / ${data.sd_floor_top?.replace('층', '')}` },
                    { label: "주차/총주차", value: `${data.sd_parking_infor} / ${property_Data.data.parking_total}대`},
                    { label: "반려동물", value: data.sd_pet },
                    { label: "방향", value: property_Data.data.direction_side},
                    { label: "건축물일자", value: data.sd_construct_date},
                    { label: "위반사항", value: data.sd_violation},
                    { label: "옵션", value: data.sd_options },
                    { label: "기타사항", value: data.sd_other_options },
                    { label: "특이사항", value: data.sd_otherinfor },
                ];

            case "상업/업무/공업용":
                return [
                    { label: "매물종류/용도", value: `${data.sd_type} / ${data.sd_estate_use}` },
                    { label: "입주가능일", value: data.sd_enter_date },
                    { label: "위반사항", value: property_Data.data.violation },
                    { label: "권리금", value: `${property_Data.data.already_premium}` },
                    { label: "현재업종", value: property_Data.data.already_jobtype },
                    { label: "비선호업종", value: property_Data.data.already_jobwant },
                    { label: "면적", value: data.sd_area },
                    { label: "해당층/총층", value: `${data.sd_floor_level && data.sd_floor_level !== "" ? data.sd_floor_level : data.sd_floor_applicable?.replace('층', '')} / ${data.sd_floor_top?.replace('층', '')}` },
                    { label: "주차/총주차", value: `${data.sd_parking_infor} / ${property_Data.data.parking_total}대`},
                    { label: "방향", value: property_Data.data.direction_side},
                    { label: "건축물일자", value: data.sd_construct_date},
                    { label: "위반사항", value: data.sd_violation},
                    { label: "옵션", value: data.sd_options },
                    { label: "기타사항", value: data.sd_other_options },
                    { label: "특이사항", value: data.sd_otherinfor },
                ];

            case "건물":
                return [
                    { label: "매물종류/용도", value: `${data.sd_type} / ${data.sd_estate_use}` },
                    { label: "입주가능일", value: data.sd_enter_date },
                    { label: "준공년도", value: data.sd_construct_date },
                    { label: "기보증금/월세", value: `${convertUnitFromMan(property_Data.data.building_total_deposit)} / ${convertUnitFromMan(property_Data.data.building_total_rent)}` },
                    { label: "면적", value: data.sd_area },
                    { label: "층(지상/지하)", value: `${data.sd_floor_top} / ${data.sd_floor_underground}` },
                    { label: "주차/총주차", value: `${data.sd_parking_infor} / ${property_Data.data.parking_total}대`},
                    { label: "위반사항", value: property_Data.data.violation },
                    { label: "옵션", value: data.sd_options },
                    { label: "기타사항", value: data.sd_other_options },
                    { label: "특이사항", value: data.sd_otherinfor },
                ];

            case "토지":
                return [
                    { label: "매물종류", value: data.sd_type },
                    { label: "용도", value: data.sd_estate_use },
                    { label: "거래가능일", value: data.sd_enter_date },
                    { label: "면적", value: data.sd_area },
                    { label: "진입도로", value: property_Data.data.enterload },
                    { label: "기타사항", value: data.sd_other_options },
                    { label: "특이사항", value: data.sd_otherinfor },
                ];

            default:
                return [
                    { label: "매물종류", value: data.sd_type },
                    { label: "용도", value: data.sd_estate_use },
                    { label: "면적", value: data.sd_area },
                ];
        }
    };

    useEffect(() => {
        // 상시 캡쳐모드: 이미지 자동 초기 선택 (앞에서 6장)
        if (Array.isArray(images) && images.length > 0) {
            setSelectedImages(images.slice(0, 6));
        }
    }, [images]);


    return (
        <div
            id="property-detail-view"
            className="bg-white w-full rounded-md shadow-lg relative flex flex-col overflow-y-auto"
        >

            {/* 상단 요약 정보 */}
            <div className="flex flex-row w-full items-center h-[100px] min-h-[100px] py-3 border-b bg-gray-100 px-6">
                <div className="flex flex-col item-start w-[550px]">
                    <div>
                        <div className="text-sm text-gray-600 mb-1">매물번호 {property_Data.id}</div>
                        <Label className="text-lg font-bold">
                            {formatAddressForAptOfficetel(
                                data.sd_address ?? "",
                                data.sd_complex,
                                property_Data.data?.address_dong,
                                property_Data.property_type
                            )}
                        </Label>
                    </div>
                </div>

                {/* 매매-전세-월세 */}
                <div className="flex flex-col items-start w-[180px]">
                    {/* 상시 캡쳐모드: 체크박스 없이 선택된 항목만 표시 */}
                    {showTradePrice && data.sd_trade_price && (
                        <Label className="text-blue-600 font-bold text-base trade-price">
                            {data.sd_trade_price}
                        </Label>
                    )}
                    {showTradeDeposit && data.sd_trade_deposit && (
                        <Label className="text-blue-600 font-bold text-base trade-deposit">
                            {data.sd_trade_deposit}
                        </Label>
                    )}
                    {showTradeRent && data.sd_trade_rent && (
                        <Label className="text-blue-600 font-bold text-base trade-rent">
                            {data.sd_trade_rent}
                        </Label>
                    )}
                    {showTradeRentSub && data.sd_trade_rent_sub && (
                        <Label className="text-blue-600 font-bold text-base trade-rent-sub">
                            {data.sd_trade_rent_sub}
                        </Label>
                    )}
                </div>

                {/* 관리비 */}
                <div className="flex flex-col items-center w-[150px]">
                    {showAdminCost &&
                        data.sd_admin_cost && (
                            <Label className="text-gray-600 font-bold text-sm admin-cost">
                                {data.sd_admin_cost}
                            </Label>
                        )}
                </div>

                {/* 등록 부동산 정보 - 오른쪽 끝 */}
                {companyName && (
                    <div className="flex flex-col items-end ml-auto">
                        <div className="bg-blue-600 rounded-md p-2 w-[200px]">
                            <div className="text-yellow-400 font-bold text-xs mb-1">등록부동산정보</div>
                            <div className="text-white text-xs space-y-0.5">
                                <div>{companyName}</div>
                                {companyPhone && <div>{companyPhone}</div>}
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {/* 본문: 이미지 + 정보 */}
            <div className="flex flex-row w-full">
                {/* 좌측 이미지 섹션 */}
                <div className="flex flex-col w-[900px] items-center justify-start p-2 pt-3">
                    {/* ✅ 이미지 표시 섹션 - 상시 2x3 그리드 */}
                    {hasImages && selectedImages.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 w-full max-w-[870px] mt-1 pb-2">
                            {selectedImages.slice(0, 6).map((img, i) => (
                                <div
                                    key={i}
                                    className="w-full h-[300px] bg-gray-100 rounded-md overflow-hidden flex items-center justify-center"
                                >
                                    <img
                                        src={img}
                                        alt={`대표 이미지 ${i + 1}`}
                                        className="w-full h-full object-cover"
                                        onContextMenu={(e) => e.preventDefault()}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                </div>

                {/* 우측 지도 + 상세 정보 */}
                <div className="flex flex-col w-[400px] p-4 space-y-4 overflow-y-auto border-l">
                    {/* 지도 영역 */}
                    <div className="w-full rounded-md mb-2 overflow-hidden transition-all duration-300 h-[200px]">
                        <MapContainer
                            latitude={Number(data.sd_latitude)}
                            longitude={Number(data.sd_longitude)}
                            disableInteraction={true}
                            isPreviewMode={true}
                        />
                        {/* {!isCapturingMap ? (
                            <MapContainer
                                latitude={typeof data.sd_latitude === "number" ? data.sd_latitude : Number(data.sd_latitude)}
                                longitude={typeof data.sd_longitude === "number" ? data.sd_longitude : Number(data.sd_longitude)}
                                disableInteraction={isPreviewMode}
                                isPreviewMode={isPreviewMode}
                            />
                        ) : (
                            <img
                                id="static-map-img"
                                src={`/api/staticmap?lat=${latitude}&lng=${longitude}&w=400&h=250&level=5`}
                                className="w-full h-full object-cover"
                            />
                        )} */}
                    </div>


                    {/* 정보 테이블 */}
                    <div className="flex flex-col space-y-1 text-sm text-gray-800">
                        {getTableItems().map(({ label, value }, index) => {
                            const isChecked = selectedFields[label] ?? true;
                            if (!isChecked) return null;

                            return (
                                <div
                                    key={`${label}-${index}`}
                                    className="flex justify-start rounded px-3 py-1 bg-gray-50 text-[13px] transition-all duration-200"
                                >
                                    <span className="font-semibold text-gray-600 w-24">
                                        {label}
                                    </span>
                                    <span className="text-left flex-1">{value || "-"}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* 거래 유형 선택 버튼 및 레이더 차트 */}
                    <div className="mt-6 w-full flex flex-row items-start gap-4">
                        {/* 거래 유형 선택 버튼 - 좌측 */}
                        {availableTradeTypes.length > 0 && (
                            <div className="flex flex-col gap-2">
                                {(["매매", "전세", "월세"] as const).map((tradeType) => {
                                    const isAvailable = availableTradeTypes.includes(tradeType);
                                    const isSelected = selectedTradeType === tradeType;
                                    return (
                                        <button
                                            key={tradeType}
                                            onClick={() => isAvailable && setSelectedTradeType(tradeType)}
                                            disabled={!isAvailable}
                                            className={`
                                                px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap
                                                ${isSelected
                                                    ? "bg-blue-600 text-white"
                                                    : isAvailable
                                                    ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                }
                                            `}
                                        >
                                            {tradeType}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                        {/* 레이더 차트 - 우측 */}
                        <div className="flex-1 flex justify-center">
                            <PropertyRadar
                            scores={{
                                price: priceScore,
                                size: sizeScore,
                                freshness: freshnessScore,
                                condition: conditionScore,
                                other: otherScore,
                            }}
                            averages={{
                                price: avgPriceScore,
                                size: avgSizeScore,
                                freshness: avgFreshnessScore,
                                condition: avgConditionScore,
                                other: avgOtherScore,
                            }}
                            rawScores={{
                                price: rawPriceScore,
                                size: rawSizeScore,
                                freshness: rawFreshnessScore,
                                condition: rawConditionScore,
                                other: rawOtherScore,
                            }}
                            rawAverages={{
                                price: rawAvgPriceScore,
                                size: rawAvgSizeScore,
                                freshness: rawAvgFreshnessScore,
                                condition: rawAvgConditionScore,
                                other: rawAvgOtherScore,
                            }}
                            ranges={{
                                price: priceRange,
                                size: sizeRange,
                                freshness: freshnessRange,
                                condition: conditionRange,
                                other: otherRange,
                            }}
                            selectedTradeType={selectedTradeType}
                        />
                        </div>
                    </div>

                    {/* 한줄평 */}
                    {showReview && (
                        <div className="flex flex-row mt-4 p-3 bg-gray-100 rounded text-sm text-gray-800 justify-center">
                            <Label>
                                한줄평 : {data.sd_evaluation} ({data.sd_evaluation_star})
                            </Label>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export { PropertyMainCardDetailView };


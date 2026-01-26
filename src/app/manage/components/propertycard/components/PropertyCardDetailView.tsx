"use client";

import { Property } from "@/types";
import { Button, PropertyRadar } from "@/components/ui";
import { Label } from "@radix-ui/react-label";
import { useEffect, useMemo, useState } from "react";
import { useAtom } from "jotai";
import { propertysAtom } from "@/store/atoms";
import MapContainer from "@/components/kakaomap/MapContainer";
import { convertUnitFromMan } from "@/utils/convertUnitFromMan";
import html2canvas from "html2canvas";
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

interface PropertyCardDetailViewProps {
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

function PropertyCardDetailView({
    property_Data,
    data,
    images,
    initialIndex = 0,
    propertysAll: propertysAllProp,
}: PropertyCardDetailViewProps) {
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
    const safeInitial = useMemo(() => {
        if (!Array.isArray(images) || images.length === 0) return 0;
        const idx = Number.isFinite(initialIndex) ? initialIndex : 0;
        return Math.min(Math.max(idx, 0), images.length - 1);
    }, [images, initialIndex]);

    const [isSendMode, setIsSendMode] = useState(false);        //캡쳐모드
    const [isPreviewMode, setIsPreviewMode] = useState(false);  //미리보기

    // 전체 매물 목록 가져오기 (평균 계산용)
    // props로 받은 값이 있으면 사용하고, 없으면 jotai에서 가져오기 (기존 동작 유지)
    const [propertysAllFromAtom] = useAtom(propertysAtom);
    const propertysAll = propertysAllProp ?? propertysAllFromAtom;

    // 금액 항목 선택 상태
    const [showTradePrice, setShowTradePrice] = useState(true);
    const [showTradeDeposit, setShowTradeDeposit] = useState(true);
    const [showTradeRent, setShowTradeRent] = useState(true);
    const [showTradeRentSub, setShowTradeRentSub] = useState(true);
    const [showAdminCost, setShowAdminCost] = useState(true);

    // 이미지
    const [selectedImages, setSelectedImages] = useState<string[]>([]);

    // 매물정보 항목 선택 상태
    const [selectedFields, setSelectedFields] = useState<Record<string, boolean>>({});

    // 한줄평
    const [showReview, setShowReview] = useState(true);

    // 오각형 평가지표
    const [showRadar, setShowRadar] = useState(true);


    const [currentIndex, setCurrentIndex] = useState(safeInitial);
    const [showContacts, setShowContacts] = useState(false);


    const [isCapturingMap, setIsCapturingMap] = useState(false); // 지도 캡처 기능용
    // const [staticMapUrl, setStaticMapUrl] = useState<string | null>(null); // TODO: 정적 지도 URL 기능 구현 시 사용

    const hasImages = Array.isArray(images) && images.length > 0;
    const currentImg = hasImages ? images[currentIndex] : undefined;

    const nextImage = () =>
        setCurrentIndex((prev) => (prev + 1) % (hasImages ? images.length : 1));
    const prevImage = () =>
        setCurrentIndex((prev) =>
            (prev - 1 + (hasImages ? images.length : 1)) % (hasImages ? images.length : 1)
        );

    // 숫자인 경우에만 좌표 전달
    const latRaw = data?.sd_latitude;
    const lngRaw = data?.sd_longitude;
    const lat = typeof latRaw === "number" ? latRaw : Number(latRaw);
    const lng = typeof lngRaw === "number" ? lngRaw : Number(lngRaw);
    const latitude = Number.isFinite(lat) ? lat : undefined;
    const longitude = Number.isFinite(lng) ? lng : undefined;
    
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








    
    // 인쇄 함수
    const handlePrint = () => {
        // 실제 화면에 보이는 컨텐츠 영역의 크기 측정
        const propertyView = document.getElementById('property-detail-view');
        if (!propertyView) {
            window.print();
            return;
        }
        
        // 컨텐츠의 실제 크기 측정
        const contentWidth = propertyView.scrollWidth || propertyView.offsetWidth;
        const contentHeight = propertyView.scrollHeight || propertyView.offsetHeight;
        
        // A4 용지 크기 (mm)
        const pageWidthMM = 210;
        const pageHeightMM = 297;
        const margin = 3; // 여백을 더 줄여서 공간 최대 활용
        
        // 인쇄 가능한 영역 (mm)
        const printableWidthMM = pageWidthMM - (margin * 2); // 204mm
        const printableHeightMM = pageHeightMM - (margin * 2); // 291mm
        
        // mm를 픽셀로 변환 (96 DPI)
        const mmToPx = 96 / 25.4;
        const printableWidthPX = printableWidthMM * mmToPx;
        const printableHeightPX = printableHeightMM * mmToPx;
        
        // zoom 비율 계산 (더 작은 값 사용)
        const zoomWidth = printableWidthPX / contentWidth;
        const zoomHeight = printableHeightPX / contentHeight;
        
        // A4 용지에 정확히 맞추기 - 한 장에 들어가도록 보장하면서 최대한 크게
        let zoom = Math.min(zoomWidth, zoomHeight);
        
        // zoom이 1보다 크면 축소 필요, 작으면 확대 가능하지만 안전하게 0.98로 제한
        if (zoom > 1) {
            zoom = 0.98; // 너무 크면 축소
        } else {
            zoom = zoom * 0.98; // 약간의 여유를 두되 최대한 크게
        }
        
        // 인쇄용 스타일 동적 추가
        const styleId = 'print-scale-style';
        let styleElement = document.getElementById(styleId) as HTMLStyleElement;
        
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = styleId;
            document.head.appendChild(styleElement);
        }
        
        styleElement.textContent = `
            @media print {
                * {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                html {
                    margin: 0 !important;
                    padding: 0 !important;
                    height: auto !important;
                    overflow: visible !important;
                }
                body {
                    margin: 0 !important;
                    padding: 0 !important;
                    height: auto !important;
                    overflow: visible !important;
                }
                /* 스크롤바 숨기기 */
                ::-webkit-scrollbar {
                    display: none !important;
                }
                * {
                    scrollbar-width: none !important;
                    -ms-overflow-style: none !important;
                }
                #property-detail-view {
                    zoom: ${zoom} !important;
                    -webkit-zoom: ${zoom} !important;
                    width: ${contentWidth}px !important;
                    height: ${contentHeight}px !important;
                    page-break-inside: avoid !important;
                    break-inside: avoid !important;
                    page-break-after: avoid !important;
                    break-after: avoid !important;
                    page-break-before: avoid !important;
                    break-before: avoid !important;
                    overflow: visible !important;
                }
                /* 모든 자식 요소에도 페이지 나누기 방지 */
                #property-detail-view > * {
                    page-break-inside: avoid !important;
                    break-inside: avoid !important;
                }
                /* 빈 페이지 제거 */
                @page {
                    size: A4;
                    margin: ${margin}mm;
                }
                @page :blank {
                    @top-center { content: none; }
                    @bottom-center { content: none; }
                }
            }
        `;
        
        // 약간의 딜레이 후 인쇄
        setTimeout(() => {
            window.print();
        }, 150);
    };

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
    //
    //         const now = new Date();
    //         const YYYY = now.getFullYear();
    //         const MM = String(now.getMonth() + 1).padStart(2, "0");
    //         const DD = String(now.getDate()).padStart(2, "0");
    //         const HH = String(now.getHours()).padStart(2, "0");
    //         const mm = String(now.getMinutes()).padStart(2, "0");
    //         const SS = String(now.getSeconds()).padStart(2, "0");
    //
    //         const timestamp = `${YYYY}${MM}${DD}${HH}${mm}${SS}`;
    //
    //         const fileName = `${property_Data.property_type}_${trade}_${timestamp}.png`;
    //
    //         const link = document.createElement("a");
    //         link.download = fileName;
    //         link.href = canvas.toDataURL("image/png");
    //         link.click();
    //     } finally {
    //         document.body.classList.remove("capturing");
    //         // setIsCapturingMap(false); // TODO: 원래 카카오맵으로 복귀 - 지도 캡처 기능 구현 시 사용
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
                    { label: "해당층/총층", value: `${data.sd_floor_applicable} / ${data.sd_floor_top}` },
                    { label: "주차", value: data.sd_parking_infor },
                    { label: "반려동물", value: data.sd_pet },
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
                    { label: "해당층", value: `${data.sd_floor_applicable}` },
                    { label: "주차", value: data.sd_parking_infor },
                    { label: "반려동물", value: data.sd_pet },
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
                    { label: "해당층", value: `${data.sd_floor_applicable}` },
                    { label: "주차", value: data.sd_parking_infor },
                    { label: "반려동물", value: data.sd_pet },
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
                    { label: "해당층", value: `${data.sd_floor_applicable}` },
                    { label: "주차", value: data.sd_parking_infor },
                    { label: "반려동물", value: data.sd_pet },
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
                    { label: "해당층", value: `${data.sd_floor_applicable}` },
                    { label: "주차", value: data.sd_parking_infor },
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
                    { label: "주차", value: data.sd_parking_infor },
                    { label: "위반사항", value: property_Data.data.violation },
                    // 입주가능일이 위에 이미 있어서 중복 제거
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
        if (isSendMode) {
            // 캡쳐모드 → 이미지 자동 초기 선택 (앞에서 6장)
            if (Array.isArray(images) && images.length > 0) {
                setSelectedImages(images.slice(0, 6));
            }
        } else {
            // 캡쳐모드 종료 → 초기화
            setShowTradePrice(true);
            setShowTradeDeposit(true);
            setShowTradeRent(true);
            setShowTradeRentSub(true);
            setShowAdminCost(true);
            setSelectedImages([]);
            setSelectedFields({});
            setShowReview(true);
            setShowRadar(true);
            setCurrentIndex(0);
            setIsPreviewMode(false);
        }
    }, [isSendMode, images]);


    return (
        <div
            id="property-detail-view"
            className="bg-white w-full rounded-md shadow-lg relative flex flex-col overflow-y-auto"
        >

            {/* 상단 요약 정보 */}
            <div className="flex flex-row w-full justify-start items-center h-[100px] min-h-[100px] py-3 border-b bg-gray-100">
                <div className="flex flex-col item-start w-[550px] px-6">

                    {!isSendMode ? (
                        <div>
                            <div className="text-sm text-gray-600">매물번호 {property_Data.id}</div>
                            <Label className="text-lg font-bold">{data.sd_address}</Label>
                        </div>
                    ) : (
                        <div>
                            <Label
                                className="text-lg font-bold">
                                {getAddressWithoutJibun(data.sd_address ?? "")}

                            </Label>
                        </div>
                    )}
                </div>

                {/* 매매-전세-월세 */}
                <div className="flex flex-col items-start w-[180px]">
                    {isSendMode && !isPreviewMode ? (
                        <>
                            {data.sd_trade_price && (
                                <label className="flex items-center gap-1">
                                    <input
                                        type="checkbox"
                                        checked={showTradePrice}
                                        onChange={() => setShowTradePrice(!showTradePrice)}
                                    />
                                    <span className="text-blue-600 font-bold text-base">
                                        {data.sd_trade_price}
                                    </span>
                                </label>
                            )}

                            {data.sd_trade_deposit && (
                                <label className="flex items-center gap-1">
                                    <input
                                        type="checkbox"
                                        checked={showTradeDeposit}
                                        onChange={() => setShowTradeDeposit(!showTradeDeposit)}
                                    />
                                    <span className="text-blue-600 font-bold text-base">
                                        {data.sd_trade_deposit}
                                    </span>
                                </label>
                            )}

                            {data.sd_trade_rent && (
                                <label className="flex items-center gap-1">
                                    <input
                                        type="checkbox"
                                        checked={showTradeRent}
                                        onChange={() => setShowTradeRent(!showTradeRent)}
                                    />
                                    <span className="text-blue-600 font-bold text-base">
                                        {data.sd_trade_rent}
                                    </span>
                                </label>
                            )}

                            {data.sd_trade_rent_sub && (
                                <label className="flex items-center gap-1">
                                    <input
                                        type="checkbox"
                                        checked={showTradeRentSub}
                                        onChange={() => setShowTradeRentSub(!showTradeRentSub)}
                                    />
                                    <span className="text-blue-600 font-bold text-base">
                                        {data.sd_trade_rent_sub}
                                    </span>
                                </label>
                            )}
                        </>
                    ) : (
                        <>
                            {/* ✅ 미리보기 or 일반모드: 체크박스 없이 선택된 항목만 표시 */}
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
                        </>
                    )}
                </div>

                {/* 관리비 */}
                <div className="flex flex-col items-center w-[150px]">
                    {isSendMode && !isPreviewMode ? (
                        data.sd_admin_cost && (
                            <label className="flex items-center gap-1">
                                <input
                                    type="checkbox"
                                    checked={showAdminCost}
                                    onChange={() => setShowAdminCost(!showAdminCost)}
                                />
                                <span className="text-gray-600 font-bold text-sm">
                                    {data.sd_admin_cost}
                                </span>
                            </label>
                        )
                    ) : (
                        showAdminCost &&
                        data.sd_admin_cost && (
                            <Label className="text-gray-600 font-bold text-sm admin-cost">
                                {data.sd_admin_cost}
                            </Label>
                        )
                    )}
                </div>



                {/* 연락처 / 등록정보 영역 */}
                {!isSendMode && (
                    <div className="flex items-center justify-center w-[200px]">
                        {property_Data.data.manager === "개인매물" ? (
                            <div className="text-sm font-semibold text-gray-500">
                                개인매물-{property_Data.name}
                            </div>
                        ) : showContacts ? (
                            <div className="flex flex-col text-sm font-semibold text-black">
                                {(property_Data.data.phones || []).map((phone, idx) => {
                                    const owner = property_Data.data.phone_owners?.[idx] ?? "";
                                    return (
                                        <div key={`${phone}-${idx}`}>
                                            <span className="font-semibold text-sm">☎</span> {phone}
                                            {owner && ` (${owner})`}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <Button
                                className="bg-blue-600 text-white hover:bg-blue-700"
                                onClick={() => setShowContacts(true)}
                            >
                                연락처보기
                            </Button>
                        )}
                    </div>
                )}

                {/* 등록정보 (등록일, 수정일, 온보드일) */}
                {!isSendMode && (
                    <div className="flex flex-col w-[190px] items-end justify-center">
                        <Label className="text-gray-600 text-[11px] text-right px-2">
                            {data.sd_create_at}
                        </Label>
                        <Label className="text-gray-600 text-[11px] text-right px-2">
                            {data.sd_update_at}
                        </Label>
                        <Label className="text-gray-600 text-[11px] text-right px-2">
                            {data.sd_on_board_at}
                        </Label>
                    </div>
                )}

            </div>

            {/* 본문: 이미지 + 정보 */}
            <div className="flex flex-row w-full">
                {/* 좌측 이미지 섹션 */}
                <div className="flex flex-col w-[900px] items-center justify-start p-2 pt-3">
                    {/* 상단 버튼을 이미지 위로 올리기 위한 wrapper */}
                    <div className="relative w-full">

                        {/* 버튼 영역 - 이미지 위에 떠 있는 레이어 */}
                        <div className="absolute top-2 left-2 z-20 flex flex-row space-x-2 capture-hide">
                            {!isSendMode ? (
                                <Button
                                    className="flex flex-row p-2 gap-1 bg-gray-600 text-white hover:bg-gray-700"
                                    onClick={() => setIsSendMode(true)}
                                >
                                    캡쳐모드
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        className="flex flex-row p-2 gap-1 bg-gray-600 text-white hover:bg-gray-700"
                                        onClick={() => {
                                            setIsPreviewMode(false);
                                            setIsSendMode(false);
                                        }}
                                    >
                                        캡쳐종료
                                    </Button>

                                    {!isPreviewMode ? (
                                        <Button
                                            className="flex flex-row p-2 gap-1 bg-blue-600 text-white hover:bg-blue-700"
                                            onClick={() => setIsPreviewMode(true)}
                                        >
                                            미리보기
                                        </Button>
                                    ) : (
                                        <>
                                            <Button
                                                className="flex flex-row p-2 gap-1 bg-gray-600 text-white hover:bg-gray-700"
                                                onClick={() => setIsPreviewMode(false)}
                                            >
                                                돌아가기
                                            </Button>

                                            <Button
                                                className="flex flex-row p-2 gap-1 bg-blue-600 text-white hover:bg-blue-700"
                                                onClick={() => handlePrint()}
                                            >
                                                인쇄하기
                                            </Button>
                                        </>
                                    )}
                                </>
                            )}
                        </div>

                        {/* 기존 이미지 영역 */}
                        {!isPreviewMode && (
                            <div className="flex items-center justify-center w-full h-[600px] transition-all duration-300">
                                <Button variant="ghost" className="text-2xl" onClick={prevImage}>
                                    ◀
                                </Button>

                                <div className="flex items-center justify-center w-full h-full max-h-[600px] overflow-hidden">
                                    {currentImg ? (
                                        <img
                                            src={currentImg}
                                            alt={`Main ${currentIndex}`}
                                            className="max-w-full max-h-full object-contain rounded"
                                            onContextMenu={(e) => e.preventDefault()}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">
                                            이미지가 없습니다.
                                        </div>
                                    )}
                                </div>

                                <Button variant="ghost" className="text-2xl" onClick={nextImage}>
                                    ▶
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* ✅ 이미지 표시 섹션 */}
                    {hasImages && (
                        <>
                            {/* ✅ 전송모드 or 일반모드 → 썸네일 리스트 */}
                            {!isPreviewMode ? (
                                <div className="flex overflow-x-auto py-5 space-x-2">
                                    {images.map((img, i) => {
                                        const isSelected = selectedImages.includes(img);

                                        const toggleSelect = () => {
                                            if (isSelected) {
                                                setSelectedImages((prev) => prev.filter((x) => x !== img));
                                            } else if (selectedImages.length < 6) {
                                                setSelectedImages((prev) => [...prev, img]);
                                            }
                                        };

                                        return (
                                            <div key={i} className="relative">
                                                <img
                                                    src={img}
                                                    alt={`Thumbnail ${i}`}
                                                    className={`w-[80px] h-[60px] object-cover rounded cursor-pointer 
                                                            ${currentIndex === i ? "border-2 border-blue-500" : ""}
                                                            ${isSendMode && isSelected ? "ring-2 ring-blue-600" : ""}`}
                                                    onClick={() => (isSendMode ? toggleSelect() : setCurrentIndex(i))}
                                                    onContextMenu={(e) => e.preventDefault()}
                                                />

                                                {/* ✅ 전송모드일 때만 체크박스 표시 */}
                                                {isSendMode && (
                                                    <div className="absolute top-1 right-1 bg-white/90 rounded-sm p-[2px]">
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={toggleSelect}
                                                            className="accent-blue-600 w-3 h-3"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                /* ✅ 미리보기 모드 → 선택된 6장만 2x3 대표 이미지로 표시 */
                                selectedImages.length > 0 && (
                                    <div className="grid grid-cols-2 gap-2 w-full max-w-[870px] mt-1 pb-2">
                                        {selectedImages.slice(0, 6).map((img, i) => (
                                            <div
                                                key={i}
                                                className="w-full h-[400px] bg-gray-100 rounded-md overflow-hidden flex items-center justify-center"
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
                                )
                            )}
                        </>
                    )}



                    {/* 왼쪽 한줄평 (미리보기 아닐 때만) */}
                    {!isPreviewMode && (
                        <div className="flex flex-col py-5">
                            {isSendMode ? (
                                <div className="flex flex-col space-y-1 text-sm text-gray-800 review-box">
                                    <div className="flex justify-center bg-gray-100 rounded px-3 py-2">
                                        <input
                                            type="checkbox"
                                            checked={showReview}
                                            onChange={() => setShowReview(!showReview)}
                                            className="mr-2 accent-blue-600"
                                        />
                                        <Label>
                                            한줄평 : {data.sd_evaluation} ({data.sd_evaluation_star})
                                        </Label>
                                    </div>
                                </div>
                            ) : (
                                showReview && (
                                    <div className="flex flex-col space-y-1 text-sm text-gray-800 review-box">
                                        <div className="flex justify-center bg-gray-100 rounded px-3 py-2">
                                            <Label>
                                                한줄평 : {data.sd_evaluation} ({data.sd_evaluation_star})
                                            </Label>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    )}

                </div>

                {/* 우측 지도 + 상세 정보 */}
                <div className="flex flex-col w-[400px] p-4 space-y-4 overflow-y-auto border-l">
                    {/* 지도 영역 */}
                    <div
                        className={`w-full rounded-md mb-2 overflow-hidden transition-all duration-300
                                    ${isPreviewMode ? "h-[300px]" : "h-[300px]"}`}
                    >
                        {!isCapturingMap ? (
                            <MapContainer
                                latitude={Number(data.sd_latitude)}
                                longitude={Number(data.sd_longitude)}
                                disableInteraction={isPreviewMode}
                                isPreviewMode={isPreviewMode}
                            />
                        ) : (
                            <img
                                id="static-map-img"
                                src={`/api/staticmap?lat=${latitude}&lng=${longitude}&w=400&h=250&level=5`}
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>


                    {/* 정보 테이블 */}
                    <div className="flex flex-col space-y-1 text-sm text-gray-800">
                        {getTableItems().map(({ label, value }, index) => {
                            const isChecked = selectedFields[label] ?? true;

                            const toggleField = () => {
                                setSelectedFields((prev) => ({
                                    ...prev,
                                    [label]: !isChecked,
                                }));
                            };

                            if (!isSendMode && !isChecked) return null;

                            return (
                                <div
                                    key={`${label}-${index}`}
                                    className={`flex justify-start rounded px-3 
                                        ${isPreviewMode ? "py-2 bg-gray-50 text-[14px]" : "py-2 bg-gray-100 text-[14px]"} 
                                        transition-all duration-200`}
                                >
                                    {isSendMode && !isPreviewMode && (
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={toggleField}
                                            className="mr-2 accent-blue-600"
                                        />
                                    )}
                                    <span
                                        className={`font-semibold text-gray-600 ${isPreviewMode ? "w-24" : "w-24"
                                            }`}
                                    >
                                        {label}
                                    </span>
                                    <span className="text-left flex-1">{value || "-"}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* 오각형 평가지표 체크박스 (캡쳐 모드일 때만) */}
                    {isSendMode && !isPreviewMode && (
                        <div className="flex flex-col rounded px-3 py-3 bg-gray-100 text-sm text-gray-800 gap-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={showRadar}
                                    onChange={() => setShowRadar(!showRadar)}
                                    className="accent-blue-600"
                                />
                                <span className="font-semibold">오각형 평가지표</span>
                            </label>
                            {/* 거래 유형 선택 버튼 및 오각형 평가지표 */}
                            {showRadar && (
                                <div className="flex flex-col items-center gap-3">
                                    {/* 거래 유형 선택 버튼 */}
                                    {availableTradeTypes.length > 0 && (
                                        <div className="flex gap-2">
                                            {(["매매", "전세", "월세"] as const).map((tradeType) => {
                                                const isAvailable = availableTradeTypes.includes(tradeType);
                                                const isSelected = selectedTradeType === tradeType;
                                                return (
                                                    <button
                                                        key={tradeType}
                                                        onClick={() => isAvailable && setSelectedTradeType(tradeType)}
                                                        disabled={!isAvailable}
                                                        className={`
                                                            trade-type-button px-4 py-2 rounded-md text-sm font-medium transition-colors
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
                                    {/* 오각형 평가지표 */}
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
                                        className="mx-auto aspect-square h-[200px]"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {isPreviewMode && showRadar && (
                        <div className="mt-6 w-full flex flex-col items-center gap-4">
                            {/* 거래 유형 선택 버튼 */}
                            {availableTradeTypes.length > 0 && (
                                <div className="flex gap-2 mb-2">
                                    {(["매매", "전세", "월세"] as const).map((tradeType) => {
                                        const isAvailable = availableTradeTypes.includes(tradeType);
                                        const isSelected = selectedTradeType === tradeType;
                                        return (
                                            <button
                                                key={tradeType}
                                                onClick={() => isAvailable && setSelectedTradeType(tradeType)}
                                                disabled={!isAvailable}
                                                className={`
                                                    trade-type-button px-4 py-2 rounded-md text-sm font-medium transition-colors
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
                    )}


                    {/* 오른쪽 패널 하단 한줄평 (미리보기 모드에서만 보임) */}
                    {isPreviewMode && showReview && (
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

export { PropertyCardDetailView };

import { PropertyData } from "@/types";
import { removeComma } from "./removeComma";

/**
 * 금액 점수 계산 (공동주택, 단독주택, 아파트, 오피스텔, 상가, 건물, 토지, 사무실인 경우)
 * 주의: 평균 계산 시에는 타입별로 별도로 필터링됨
 * 
 * - 매매: 매매가 / 참고면적(평수)
 * - 전세: [(전세보증금 × 3%) / 12 + 관리비] / 참고면적(평수)
 * - 월세: [(보증금 × 3%) / 12 + (월세 + 관리비)] / 참고면적(평수)
 * 
 * @param propertyData PropertyData 객체
 * @param tradeType 거래 유형 ("매매" | "전세" | "월세")
 * @returns 계산된 금액 점수 (계산 불가능한 경우 undefined)
 */
export function calculatePriceScore(
    propertyData: PropertyData,
    tradeType: "매매" | "전세" | "월세"
): number | undefined {
    const propertyType = propertyData?.type;
    const isApplicableType = propertyType === "공동주택" || propertyType === "단독주택" || propertyType === "아파트" || propertyType === "오피스텔" || propertyType === "상가" || propertyType === "건물" || propertyType === "토지" || propertyType === "사무실";
    
    if (!isApplicableType) {
        return undefined;
    }

    // 선택된 거래 유형이 실제 거래 유형에 포함되어 있는지 확인
    const tradeTypes = propertyData?.trade_types || [];
    if (!tradeTypes.includes(tradeType)) {
        return undefined;
    }

    // 문자열에서 숫자 추출 함수
    const parseNumber = (value: string | null | undefined): number => {
        if (!value || value.trim() === "") return 0;
        const cleaned = removeComma(value.toString().trim());
        const num = parseFloat(cleaned);
        return isNaN(num) ? 0 : num;
    };

    const areaInPyeong = parseNumber(propertyData?.area_reference); // 참고면적 (평 단위)

    // 참고면적이 0이면 계산 불가
    if (areaInPyeong === 0) {
        return undefined;
    }

    // 거래 유형별 계산
    if (tradeType === "매매") {
        // 매매: 매매가 / 참고면적(평수)
        const tradePriceInMan = parseNumber(propertyData?.trade_price); // 매매가 (만원 단위)
        if (tradePriceInMan === 0) {
            return undefined;
        }
        const tradePriceInWon = tradePriceInMan * 10000; // 만원 → 원
        const score = tradePriceInWon / areaInPyeong; // 원/평
        return Math.round(score);
    }

    if (tradeType === "전세") {
        // 전세: [(전세보증금 × 3%) / 12 + 관리비] / 참고면적(평수)
        const depositInMan = parseNumber(propertyData?.trade_deposit); // 전세보증금 (만원 단위)
        const adminCostInWon = parseNumber(propertyData?.admin_cost); // 관리비 (원 단위)

        // 전세보증금이 있어야 계산 가능
        if (depositInMan === 0) {
            return undefined;
        }

        // 모든 값을 원 단위로 통일하여 계산
        const depositInWon = depositInMan * 10000; // 만원 → 원
        
        const depositMonthlyEquivalent = (depositInWon * 0.03) / 12; // 전세보증금(원) × 3% ÷ 12
        const monthlyTotal = adminCostInWon; // 관리비(원) (전세는 월세가 없으므로 관리비만)
        const numerator = depositMonthlyEquivalent + monthlyTotal; // 분자
        const score = numerator / areaInPyeong; // 최종 점수 (원/평)

        return Math.round(score); // 정수로 반올림
    }

    if (tradeType === "월세") {
        // 월세: [(보증금 × 3%) / 12 + (월세 + 관리비)] / 참고면적(평수)
        const depositInMan = parseNumber(propertyData?.trade_rent_deposit); // 월세보증금 (만원 단위)
        const monthlyRentInMan = parseNumber(propertyData?.trade_rent); // 월세 (만원 단위)
        const adminCostInWon = parseNumber(propertyData?.admin_cost); // 관리비 (원 단위)

        // 월세보증금이나 월세가 하나라도 있어야 계산 가능
        if (depositInMan === 0 && monthlyRentInMan === 0) {
            return undefined;
        }

        // 모든 값을 원 단위로 통일하여 계산
        const depositInWon = depositInMan * 10000; // 만원 → 원
        const monthlyRentInWon = monthlyRentInMan * 10000; // 만원 → 원
        
        const depositMonthlyEquivalent = (depositInWon * 0.03) / 12; // 보증금(원) × 3% ÷ 12
        const monthlyTotal = monthlyRentInWon + adminCostInWon; // 월세(원) + 관리비(원)
        const numerator = depositMonthlyEquivalent + monthlyTotal; // 분자
        const score = numerator / areaInPyeong; // 최종 점수 (원/평)

        return Math.round(score); // 정수로 반올림
    }

    return undefined;
}


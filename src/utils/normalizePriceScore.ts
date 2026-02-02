import { Property } from "@/types";
import { getPriceScoreRange } from "./calculateAveragePriceScore";

/**
 * 금액 점수의 최소/최대 범위 구하기 (정규화 없이 실제 값 사용)
 * 평균 계산에 사용된 매물들의 최대/최소값 반환
 * 
 * @param currentProperty 현재 매물
 * @param allProperties 전체 매물 목록
 * @returns { min: 최소값, max: 최대값, current: 현재 값 }, 계산 불가능한 경우 undefined
 */
export function getPriceScoreRangeForChart(
    currentProperty: Property,
    allProperties: Property[],
    rawScore: number
): { min: number; max: number; current: number } | undefined {
    // trade_types에서 첫 번째 거래 종류 추출 (매매, 전세, 월세 중 하나)
    const tradeTypes = currentProperty.data?.trade_types || [];
    const tradeType = (tradeTypes.find(type => type === "매매" || type === "전세" || type === "월세") || tradeTypes[0] || "매매") as "매매" | "전세" | "월세";
    
    // 최대/최소값 구하기 (평균 계산과 동일한 조건)
    const range = getPriceScoreRange(currentProperty, allProperties, tradeType);

    if (!range) {
        return undefined;
    }

    const { min: minScore, max: maxScore } = range;

    // 역방향이므로 최소값이 max 위치에, 최대값이 min 위치에 표시되어야 함
    // 하지만 실제 값은 그대로 반환 (레이더 차트에서 domain 설정 시 역방향 처리)
    return {
        min: minScore,  // 가장 저렴한 값
        max: maxScore,  // 가장 비싼 값
        current: rawScore,  // 현재 매물의 실제 점수
    };
}


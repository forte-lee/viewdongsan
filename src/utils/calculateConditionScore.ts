import { PropertyData } from "@/types";

/**
 * 컨디션 점수 계산
 * 별점(1~5점)을 그대로 반환
 * 
 * @param propertyData 현재 매물의 PropertyData
 * @returns 별점 값 (1~5점), 계산 불가능한 경우 undefined
 */
export function calculateConditionScore(
    propertyData: PropertyData
): number | undefined {
    const star = propertyData?.evaluation_star;
    
    if (!star || star.trim() === "") {
        return undefined; // 별점이 없으면 계산 불가
    }

    // 별점 문자열을 숫자로 변환 (예: "5", "4", "3", "2", "1")
    const starNumber = parseFloat(star.trim());
    
    if (isNaN(starNumber) || starNumber < 1 || starNumber > 5) {
        return undefined; // 유효하지 않은 별점
    }

    return starNumber; // 별점을 그대로 반환
}



















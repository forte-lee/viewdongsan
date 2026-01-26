import { PropertyData } from "@/types";
import { removeComma } from "./removeComma";

/**
 * 사이즈 점수 계산
 * 참고면적(평)을 그대로 반환
 * 
 * @param propertyData 현재 매물의 PropertyData
 * @returns 참고면적(평) 값, 계산 불가능한 경우 undefined
 */
export function calculateSizeScore(
    propertyData: PropertyData
): number | undefined {
    // 참고면적 추출
    const parseNumber = (value: string | null | undefined): number => {
        if (!value || value.trim() === "") return 0;
        const cleaned = removeComma(value.toString().trim());
        const num = parseFloat(cleaned);
        return isNaN(num) ? 0 : num;
    };

    const area = parseNumber(propertyData?.area_reference);
    if (area === 0) {
        return undefined; // 참고면적이 없으면 계산 불가
    }

    return area; // 참고면적(평)을 그대로 반환
}


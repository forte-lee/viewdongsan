import { Property } from "@/types";
import { extractDistrict } from "./extractDistrict";
import { calculateConditionScore } from "./calculateConditionScore";

/**
 * 타입 비교 헬퍼 함수
 * - 공동주택과 단독주택은 함께 묶어서 비교
 * - 나머지 타입들(아파트, 오피스텔 등)은 정확히 같은 타입끼리만 비교
 */
function isSameTypeGroup(currentType: string, propertyType: string): boolean {
    // 공동주택과 단독주택은 함께 묶어서 비교
    if ((currentType === "공동주택" || currentType === "단독주택") &&
        (propertyType === "공동주택" || propertyType === "단독주택")) {
        return true;
    }
    
    // 나머지 타입들은 정확히 같은 타입끼리만 비교
    return currentType === propertyType;
}

/**
 * 평균 컨디션 점수 계산
 * 조건: 같은 구(區) + ON+OFF 모두 포함 + 아파트 또는 오피스텔 타입
 * 
 * @param currentProperty 현재 매물
 * @param allProperties 전체 매물 목록
 * @returns 평균 컨디션 점수, 계산 불가능한 경우 undefined
 */
export function calculateAverageConditionScore(
    currentProperty: Property,
    allProperties: Property[]
): number | undefined {
    // 현재 매물의 타입 확인 (공동주택, 단독주택, 아파트, 오피스텔, 상가, 건물, 토지, 사무실만 허용)
    const currentType = currentProperty?.data?.type;
    const isApplicableType = currentType === "공동주택" || currentType === "단독주택" || currentType === "아파트" || currentType === "오피스텔" || currentType === "상가" || currentType === "건물" || currentType === "토지" || currentType === "사무실";
    if (!isApplicableType) {
        return undefined;
    }

    // 현재 매물의 구(區) 추출
    const currentDistrict = extractDistrict(currentProperty?.data?.address);
    if (!currentDistrict) {
        return undefined; // 구 정보가 없으면 계산 불가
    }

    // 조건에 맞는 매물들 필터링
    const filteredProperties = allProperties.filter((property) => {
        // 1. ON+OFF 모두 포함 (필터링 없음)

        // 2. 같은 구(區)
        const district = extractDistrict(property.data?.address);
        if (!district || district !== currentDistrict) {
            return false;
        }

        // 3. 타입 비교 (공동주택/단독주택은 함께, 나머지는 각각)
        const type = property.data?.type;
        if (!isSameTypeGroup(currentType, type)) {
            return false;
        }

        // 4. 컨디션 점수 계산 가능한 매물 (calculateConditionScore가 undefined가 아니고 0이 아닌 것)
        const score = calculateConditionScore(property.data);
        return score !== undefined && score !== 0;
    });

    // 필터링된 매물이 없으면 undefined 반환
    if (filteredProperties.length === 0) {
        return undefined;
    }

    // 각 매물의 컨디션 점수 계산하여 평균 구하기
    const scores = filteredProperties
        .map((property) => calculateConditionScore(property.data))
        .filter((score): score is number => score !== undefined && score !== 0);

    if (scores.length === 0) {
        return undefined;
    }

    const sum = scores.reduce((acc, score) => acc + score, 0);
    const average = sum / scores.length;

    // 컨디션은 별점(1~5점)이므로 소수점 첫째 자리까지 반환
    return Math.round(average * 10) / 10;
}


import { Property } from "@/types";
import { extractDistrict } from "./extractDistrict";
import { calculateFreshnessScore } from "./calculateFreshnessScore";

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
 * 평균 신선도 점수 계산
 * 조건: ON 매물만 + 공동주택/단독주택(함께) 또는 아파트, 오피스텔 등(각각)
 * 
 * @param currentProperty 현재 매물
 * @param allProperties 전체 매물 목록
 * @returns 평균 신선도 점수, 계산 불가능한 경우 undefined
 */
export function calculateAverageFreshnessScore(
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

    // 조건에 맞는 매물들 필터링 (현재는 사용하지 않지만 향후 확장을 위해 유지)
    allProperties.filter((property) => {
        // 1. ON 매물만
        if (!property.on_board_state?.on_board_state) {
            return false;
        }

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

        // 4. 신선도 점수 계산 가능한 매물 (calculateFreshnessScore가 undefined가 아니고 0이 아닌 것)
        const score = calculateFreshnessScore(property);
        return score !== undefined && score !== 0;
    });

    // 신선도 평균값은 5로 고정
    return 5;
}


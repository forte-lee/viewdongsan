import { Property } from "@/types";
import { extractDistrict } from "./extractDistrict";
import { calculatePriceScore } from "./calculatePriceScore";
import { calculateSizeScore } from "./calculateSizeScore";
import { calculateConditionScore } from "./calculateConditionScore";
import { calculateFreshnessScore } from "./calculateFreshnessScore";
import { calculateOtherScore } from "./calculateOtherScore";
import { removeComma } from "./removeComma";
import { isUnderground } from "./calculateAveragePriceScore";

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
 * 방 개수(룸 개수) 추출
 */
function getRoomCount(property: Property): number | undefined {
    const roomStr = property.data?.structure_room;
    if (!roomStr || roomStr.trim() === "") {
        return undefined;
    }
    const cleaned = removeComma(roomStr.toString().trim());
    const roomNum = parseInt(cleaned, 10);
    if (isNaN(roomNum) || roomNum < 1) {
        return undefined;
    }
    return roomNum;
}

/**
 * 금액 점수의 범위와 개수 구하기
 * @param currentProperty 현재 매물
 * @param allProperties 전체 매물 목록
 * @param tradeType 거래 유형 ("매매" | "전세" | "월세")
 */
export function getPriceScoreRangeAndCount(
    currentProperty: Property,
    allProperties: Property[],
    tradeType: "매매" | "전세" | "월세"
): { min: number; max: number; count: number } | undefined {
    // 현재 매물의 타입 확인 (공동주택, 단독주택, 아파트, 오피스텔, 상가, 건물, 토지, 사무실만 허용)
    const currentType = currentProperty?.data?.type;
    const isApplicableType = currentType === "공동주택" || currentType === "단독주택" || currentType === "아파트" || currentType === "오피스텔" || currentType === "상가" || currentType === "건물" || currentType === "토지" || currentType === "사무실";
    if (!isApplicableType) {
        return undefined;
    }

    const currentDistrict = extractDistrict(currentProperty?.data?.address);
    if (!currentDistrict) {
        return undefined;
    }

    // 상가, 토지, 건물, 사무실은 지상/지하 구분을 하지 않음
    const needsUndergroundCheck = currentType !== "상가" && currentType !== "토지" && currentType !== "건물" && currentType !== "사무실";
    const currentIsUnderground = needsUndergroundCheck ? isUnderground(currentProperty) : undefined;

    const filteredProperties = allProperties.filter((property) => {
        if (!property.on_board_state?.on_board_state) {
            return false;
        }

        const district = extractDistrict(property.data?.address);
        if (!district || district !== currentDistrict) {
            return false;
        }

        // 상가, 토지, 건물, 사무실은 지상/지하 구분 없이 비교
        if (needsUndergroundCheck) {
            const isUndergroundProperty = isUnderground(property);
            if (isUndergroundProperty !== currentIsUnderground) {
                return false;
            }
        }

        const type = property.data?.type;
        if (!isSameTypeGroup(currentType, type)) {
            return false;
        }

        const score = calculatePriceScore(property.data, tradeType);
        return score !== undefined && score !== 0;
    });

    if (filteredProperties.length === 0) {
        return undefined;
    }

    const scores = filteredProperties
        .map((property) => calculatePriceScore(property.data, tradeType))
        .filter((score): score is number => score !== undefined && score !== 0);

    if (scores.length === 0) {
        return undefined;
    }

    return {
        min: Math.min(...scores),
        max: Math.max(...scores),
        count: scores.length,
    };
}

/**
 * 사이즈 점수의 범위와 개수 구하기
 */
export function getSizeScoreRangeAndCount(
    currentProperty: Property,
    allProperties: Property[]
): { min: number; max: number; count: number } | undefined {
    const currentDistrict = extractDistrict(currentProperty?.data?.address);
    if (!currentDistrict) {
        return undefined;
    }

    // 현재 매물의 타입 확인 (공동주택, 단독주택, 아파트, 오피스텔, 상가, 건물, 토지, 사무실만 허용)
    const currentType = currentProperty?.data?.type;
    const isApplicableType = currentType === "공동주택" || currentType === "단독주택" || currentType === "아파트" || currentType === "오피스텔" || currentType === "상가" || currentType === "건물" || currentType === "토지" || currentType === "사무실";
    if (!isApplicableType) {
        return undefined;
    }

    // 상가, 토지, 건물, 사무실은 방 개수 구분을 하지 않음
    const needsRoomCountCheck = currentType !== "상가" && currentType !== "토지" && currentType !== "건물" && currentType !== "사무실";
    const currentRoomCount = needsRoomCountCheck ? getRoomCount(currentProperty) : undefined;
    
    if (needsRoomCountCheck && !currentRoomCount) {
        return undefined;
    }

    const filteredProperties = allProperties.filter((property) => {
        const district = extractDistrict(property.data?.address);
        if (!district || district !== currentDistrict) {
            return false;
        }

        // 타입 비교 (공동주택/단독주택은 함께, 나머지는 각각)
        const type = property.data?.type;
        if (!isSameTypeGroup(currentType, type)) {
            return false;
        }

        // 상가, 토지, 건물, 사무실은 방 개수 구분 없이 비교
        if (needsRoomCountCheck) {
            const roomCount = getRoomCount(property);
            if (!roomCount || roomCount !== currentRoomCount) {
                return false;
            }
        }

        const score = calculateSizeScore(property.data);
        return score !== undefined && score !== 0;
    });

    if (filteredProperties.length === 0) {
        return undefined;
    }

    const scores = filteredProperties
        .map((property) => calculateSizeScore(property.data))
        .filter((score): score is number => score !== undefined && score !== 0);

    if (scores.length === 0) {
        return undefined;
    }

    return {
        min: Math.min(...scores),
        max: Math.max(...scores),
        count: scores.length,
    };
}

/**
 * 컨디션 점수의 범위와 개수 구하기
 */
export function getConditionScoreRangeAndCount(
    currentProperty: Property,
    allProperties: Property[]
): { min: number; max: number; count: number } | undefined {
    const currentDistrict = extractDistrict(currentProperty?.data?.address);
    if (!currentDistrict) {
        return undefined;
    }

    // 현재 매물의 타입 확인 (공동주택, 단독주택, 아파트, 오피스텔, 상가, 건물, 토지, 사무실만 허용)
    const currentType = currentProperty?.data?.type;
    const isApplicableType = currentType === "공동주택" || currentType === "단독주택" || currentType === "아파트" || currentType === "오피스텔" || currentType === "상가" || currentType === "건물" || currentType === "토지" || currentType === "사무실";
    if (!isApplicableType) {
        return undefined;
    }

    const filteredProperties = allProperties.filter((property) => {
        const district = extractDistrict(property.data?.address);
        if (!district || district !== currentDistrict) {
            return false;
        }

        // 타입 비교 (공동주택/단독주택은 함께, 나머지는 각각)
        const type = property.data?.type;
        if (!isSameTypeGroup(currentType, type)) {
            return false;
        }

        const score = calculateConditionScore(property.data);
        return score !== undefined && score !== 0;
    });

    if (filteredProperties.length === 0) {
        return undefined;
    }

    const scores = filteredProperties
        .map((property) => calculateConditionScore(property.data))
        .filter((score): score is number => score !== undefined && score !== 0);

    if (scores.length === 0) {
        return undefined;
    }

    return {
        min: Math.min(...scores),
        max: Math.max(...scores),
        count: scores.length,
    };
}

/**
 * 신선도 점수의 범위와 개수 구하기
 */
export function getFreshnessScoreRangeAndCount(
    currentProperty: Property,
    allProperties: Property[]
): { min: number; max: number; count: number } | undefined {
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

    const filteredProperties = allProperties.filter((property) => {
        if (!property.on_board_state?.on_board_state) {
            return false;
        }

        // 같은 구(區)
        const district = extractDistrict(property.data?.address);
        if (!district || district !== currentDistrict) {
            return false;
        }

        // 타입 비교 (공동주택/단독주택은 함께, 나머지는 각각)
        const type = property.data?.type;
        if (!isSameTypeGroup(currentType, type)) {
            return false;
        }

        const score = calculateFreshnessScore(property);
        return score !== undefined && score !== 0;
    });

    if (filteredProperties.length === 0) {
        return undefined;
    }

    const scores = filteredProperties
        .map((property) => calculateFreshnessScore(property))
        .filter((score): score is number => score !== undefined && score !== 0);

    if (scores.length === 0) {
        return undefined;
    }

    return {
        min: Math.min(...scores),
        max: Math.max(...scores),
        count: scores.length,
    };
}

/**
 * 기타점수의 범위와 개수 구하기
 */
export function getOtherScoreRangeAndCount(
    currentProperty: Property,
    allProperties: Property[]
): { min: number; max: number; count: number } | undefined {
    const currentDistrict = extractDistrict(currentProperty?.data?.address);
    if (!currentDistrict) {
        return undefined;
    }

    // 현재 매물의 타입 확인 (공동주택, 단독주택, 아파트, 오피스텔, 상가, 건물, 토지, 사무실만 허용)
    const currentType = currentProperty?.data?.type;
    const isApplicableType = currentType === "공동주택" || currentType === "단독주택" || currentType === "아파트" || currentType === "오피스텔" || currentType === "상가" || currentType === "건물" || currentType === "토지" || currentType === "사무실";
    if (!isApplicableType) {
        return undefined;
    }

    const filteredProperties = allProperties.filter((property) => {
        const district = extractDistrict(property.data?.address);
        if (!district || district !== currentDistrict) {
            return false;
        }

        // 타입 비교 (공동주택/단독주택은 함께, 나머지는 각각)
        const type = property.data?.type;
        if (!isSameTypeGroup(currentType, type)) {
            return false;
        }

        const score = calculateOtherScore(property.data);
        return score !== undefined && score !== 0;
    });

    if (filteredProperties.length === 0) {
        return undefined;
    }

    const scores = filteredProperties
        .map((property) => calculateOtherScore(property.data))
        .filter((score): score is number => score !== undefined);

    if (scores.length === 0) {
        return undefined;
    }

    return {
        min: Math.min(...scores),
        max: Math.max(...scores),
        count: scores.length,
    };
}


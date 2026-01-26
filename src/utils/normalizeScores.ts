import { Property } from "@/types";
import { extractDistrict } from "./extractDistrict";
import { calculateSizeScore } from "./calculateSizeScore";
import { calculateConditionScore } from "./calculateConditionScore";
import { calculateFreshnessScore } from "./calculateFreshnessScore";
import { calculateOtherScore } from "./calculateOtherScore";
import { removeComma } from "./removeComma";
import { getPriceScoreRangeAndCount } from "./getScoreRangeAndCount";

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
 * 사이즈 점수 범위 구하기 (평균 계산과 동일한 조건)
 */
function getSizeScoreRange(
    currentProperty: Property,
    allProperties: Property[]
): { min: number; max: number } | undefined {
    const currentDistrict = extractDistrict(currentProperty?.data?.address);
    if (!currentDistrict) {
        return undefined;
    }

    // 현재 매물의 타입 확인
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
    };
}

/**
 * 컨디션 점수 범위 구하기 (평균 계산과 동일한 조건)
 * TODO: 사용 예정
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getConditionScoreRange(
    currentProperty: Property,
    allProperties: Property[]
): { min: number; max: number } | undefined {
    const currentDistrict = extractDistrict(currentProperty?.data?.address);
    if (!currentDistrict) {
        return undefined;
    }

    // 현재 매물의 타입 확인 (공동주택, 단독주택, 아파트, 오피스텔만 허용)
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
    };
}

/**
 * 신선도 점수 범위 구하기 (평균 계산과 동일한 조건)
 * TODO: 사용 예정
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getFreshnessScoreRange(
    currentProperty: Property,
    allProperties: Property[]
): { min: number; max: number } | undefined {
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
        return score !== undefined;
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
    };
}

/**
 * 기타점수 범위 구하기 (평균 계산과 동일한 조건)
 * TODO: 사용 예정
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getOtherScoreRange(
    currentProperty: Property,
    allProperties: Property[]
): { min: number; max: number } | undefined {
    // 현재 매물의 타입 확인 (공동주택, 단독주택, 아파트, 오피스텔만 허용)
    const currentType = currentProperty?.data?.type;
    const isApplicableType = currentType === "공동주택" || currentType === "단독주택" || currentType === "아파트" || currentType === "오피스텔" || currentType === "상가" || currentType === "건물" || currentType === "토지" || currentType === "사무실";
    if (!isApplicableType) {
        return undefined;
    }

    const currentDistrict = extractDistrict(currentProperty?.data?.address);
    if (!currentDistrict) {
        return undefined;
    }

    const filteredProperties = allProperties.filter((property) => {
        const district = extractDistrict(property.data?.address);
        if (!district || district !== currentDistrict) {
            return false;
        }

        const type = property.data?.type;
        const isApplicableType = type === "공동주택" || type === "단독주택" || type === "아파트" || type === "오피스텔" || type === "상가" || type === "건물" || type === "토지" || type === "사무실";
        if (!isApplicableType) {
            return false;
        }

        const score = calculateOtherScore(property.data);
        return score !== undefined;
    });

    if (filteredProperties.length === 0) {
        return undefined;
    }

    const scores = filteredProperties
        .map((property) => calculateOtherScore(property.data))
        .filter((score): score is number => score !== undefined && score !== 0);

    if (scores.length === 0) {
        return undefined;
    }

    return {
        min: Math.min(...scores),
        max: Math.max(...scores),
    };
}

/**
 * 금액 점수를 0~10으로 정규화 (역방향: 낮은 금액일수록 높은 점수)
 */
export function normalizePriceScore(
    currentProperty: Property,
    allProperties: Property[],
    rawScore: number,
    tradeType: "매매" | "전세" | "월세"
): number {
    // getPriceScoreRangeAndCount에서 범위 정보 가져오기
    const rangeAndCount = getPriceScoreRangeAndCount(currentProperty, allProperties, tradeType);
    
    if (!rangeAndCount) {
        return rawScore;
    }

    const { min, max } = rangeAndCount;
    if (max === min) {
        return 5; // 중간값
    }

    // 역방향 정규화: (max - current) / (max - min) * 10
    const normalized = ((max - rawScore) / (max - min)) * 10;
    return Math.max(0, Math.min(10, Math.round(normalized * 10) / 10));
}

/**
 * 사이즈 점수를 0~10으로 정규화 (0 ~ 매물 최대크기 범위로 정규화)
 */
export function normalizeSizeScore(
    currentProperty: Property,
    allProperties: Property[],
    rawScore: number
): number {
    const range = getSizeScoreRange(currentProperty, allProperties);
    if (!range) {
        // 범위를 구할 수 없으면 rawScore를 그대로 반환 (또는 기본값)
        return rawScore;
    }

    const { max } = range;
    if (max === 0) {
        return 0;
    }

    // 정방향 정규화: (rawScore / max) * 10 (0 ~ 최대크기 기준)
    const normalized = (rawScore / max) * 10;
    return Math.max(0, Math.min(10, Math.round(normalized * 10) / 10));
}

/**
 * 컨디션 점수를 0~10으로 정규화
 * 별점은 1~5 범위이므로, 2를 곱하여 2~10 범위로 변환
 * 별점 1 → 2점, 별점 2 → 4점, 별점 3 → 6점, 별점 4 → 8점, 별점 5 → 10점
 */
export function normalizeConditionScore(
    currentProperty: Property,
    allProperties: Property[],
    rawScore: number
): number {
    // 별점 * 2로 변환: 별점 1 = 2점, 별점 5 = 10점
    const normalized = rawScore * 2;
    return Math.max(0, Math.min(10, Math.round(normalized * 10) / 10));
}

/**
 * 신선도 점수를 0~10으로 정규화
 * - 실제값 0~10: 똑같이 반영 (0은 0, 10은 10)
 * - 실제값 10 이상: 10으로 제한
 */
export function normalizeFreshnessScore(
    currentProperty: Property,
    allProperties: Property[],
    rawScore: number
): number {
    // 실제값이 0~10 범위면 그대로 반영, 10 초과면 10으로 제한
    if (rawScore <= 10) {
        return Math.max(0, Math.min(10, Math.round(rawScore * 10) / 10));
    } else {
        return 10;
    }
}

/**
 * 기타점수를 0~10으로 정규화 (정방향: 높은 기타점수일수록 높은 점수)
 * 기타점수는 이미 3~10 범위이므로, 최소값을 0으로 고정하여 정규화
 */
export function normalizeOtherScore(
    currentProperty: Property,
    allProperties: Property[],
    rawScore: number
): number {
    // 기타점수는 이미 0~10 범위 내의 값이므로 그대로 반환
    // (기본 점수 3점이 최소값이지만, 정규화는 0~10 기준으로)
    return Math.max(0, Math.min(10, Math.round(rawScore * 10) / 10));
}

/**
 * 평균 점수도 동일한 방식으로 정규화
 */
export function normalizeAveragePriceScore(
    currentProperty: Property,
    allProperties: Property[],
    rawAvgScore: number,
    tradeType: "매매" | "전세" | "월세"
): number {
    const rangeAndCount = getPriceScoreRangeAndCount(currentProperty, allProperties, tradeType);
    
    if (!rangeAndCount) {
        return rawAvgScore;
    }

    const { min, max } = rangeAndCount;
    if (max === min) {
        return 5;
    }

    // 역방향 정규화
    const normalized = ((max - rawAvgScore) / (max - min)) * 10;
    return Math.max(0, Math.min(10, Math.round(normalized * 10) / 10));
}

export function normalizeAverageSizeScore(
    currentProperty: Property,
    allProperties: Property[],
    rawAvgScore: number
): number {
    const range = getSizeScoreRange(currentProperty, allProperties);
    if (!range) {
        return rawAvgScore;
    }

    const { max } = range;
    if (max === 0) {
        return 0;
    }

    // 정방향 정규화: (rawAvgScore / max) * 10 (0 ~ 최대크기 기준)
    const normalized = (rawAvgScore / max) * 10;
    return Math.max(0, Math.min(10, Math.round(normalized * 10) / 10));
}

export function normalizeAverageConditionScore(
    currentProperty: Property,
    allProperties: Property[],
    rawAvgScore: number
): number {
    // 별점 * 2로 변환: 별점 1 = 2점, 별점 5 = 10점
    const normalized = rawAvgScore * 2;
    return Math.max(0, Math.min(10, Math.round(normalized * 10) / 10));
}

export function normalizeAverageFreshnessScore(
    currentProperty: Property,
    allProperties: Property[],
    rawAvgScore: number
): number {
    // 실제값이 0~10 범위면 그대로 반영, 10 초과면 10으로 제한
    if (rawAvgScore <= 10) {
        return Math.max(0, Math.min(10, Math.round(rawAvgScore * 10) / 10));
    } else {
        return 10;
    }
}

export function normalizeAverageOtherScore(
    currentProperty: Property,
    allProperties: Property[],
    rawAvgScore: number
): number {
    // 기타점수는 이미 0~10 범위 내의 값이므로 그대로 반환
    // (기본 점수 3점이 최소값이지만, 정규화는 0~10 기준으로)
    return Math.max(0, Math.min(10, Math.round(rawAvgScore * 10) / 10));
}



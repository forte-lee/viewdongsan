import { Property } from "@/types";
import { extractDistrict } from "./extractDistrict";
import { calculatePriceScore } from "./calculatePriceScore";

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
 * 매물이 지상인지 지하인지 판단
 * @param property Property 객체
 * @returns true면 지하, false면 지상
 */
export function isUnderground(property: Property): boolean {
    const data = property.data;
    const floorApplicable = data?.floor_applicable?.toString().trim() ?? "";
    const isSemi = data?.floor_semibasement === true;
    const isRooftop = data?.floor_rooftop === true;

    // 옥탑이면 지상
    if (isRooftop) {
        return false;
    }

    // 반지하는 지하로 간주
    if (isSemi) {
        return true;
    }

    // floor_applicable을 숫자로 파싱
    let floorNum = Number(floorApplicable);
    if (isNaN(floorNum)) {
        // "B1", "지하1" 등 텍스트 패턴 확인
        if (/B\d|지하/i.test(floorApplicable)) {
            return true;
        }
        // 숫자로 파싱 안 되고 반지하도 아니면 기본값 = 지상
        return false;
    }

    // 0 이하는 지하, 1 이상은 지상
    return floorNum < 1;
}

/**
 * 평균 금액 점수 계산
 * 조건: ON 매물만 + 같은 구(區) + 같은 지상/지하 구분 + 아파트 또는 오피스텔
 * 
 * @param currentProperty 현재 매물
 * @param allProperties 전체 매물 목록
 * @param tradeType 거래 유형 ("매매" | "전세" | "월세")
 * @returns 평균 금액 점수, 계산 불가능한 경우 undefined
 */
export function calculateAveragePriceScore(
    currentProperty: Property,
    allProperties: Property[],
    tradeType: "매매" | "전세" | "월세"
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

    // 상가, 토지, 건물, 사무실은 지상/지하 구분을 하지 않음
    const needsUndergroundCheck = currentType !== "상가" && currentType !== "토지" && currentType !== "건물" && currentType !== "사무실";
    const currentIsUnderground = needsUndergroundCheck ? isUnderground(currentProperty) : undefined;

    // 조건에 맞는 매물들 필터링
    const filteredProperties = allProperties.filter((property) => {
        // 1. ON 매물만
        if (!property.on_board_state?.on_board_state) {
            return false;
        }

        // 2. 같은 구(區)
        const district = extractDistrict(property.data?.address);
        if (!district || district !== currentDistrict) {
            return false;
        }

        // 3. 같은 지상/지하 구분 (상가, 토지, 건물, 사무실은 제외)
        if (needsUndergroundCheck) {
            const isUndergroundProperty = isUnderground(property);
            if (isUndergroundProperty !== currentIsUnderground) {
                return false;
            }
        }

        // 4. 타입 비교 (공동주택/단독주택은 함께, 나머지는 각각)
        const type = property.data?.type;
        if (!isSameTypeGroup(currentType, type)) {
            return false;
        }

        // 5. 금액 점수 계산 가능한 매물 (선택된 거래 유형에 대해 calculatePriceScore가 undefined가 아닌 것)
        const score = calculatePriceScore(property.data, tradeType);
        return score !== undefined && score !== 0;
    });

    // 필터링된 매물이 없으면 undefined 반환
    if (filteredProperties.length === 0) {
        return undefined;
    }

    // 각 매물의 금액 점수 계산하여 평균 구하기
    const scores = filteredProperties
        .map((property) => calculatePriceScore(property.data, tradeType))
        .filter((score): score is number => score !== undefined && score !== 0);

    if (scores.length === 0) {
        return undefined;
    }

    const sum = scores.reduce((acc, score) => acc + score, 0);
    const average = sum / scores.length;

    // 디버깅용 로그 (개발 후 제거 가능)
    console.log("평균 금액 점수 계산:", {
        currentDistrict,
        currentIsUnderground,
        filteredCount: filteredProperties.length,
        scoresCount: scores.length,
        scores,
        average,
        roundedAverage: Math.round(average)
    });

    return Math.round(average); // 정수로 반올림
}

/**
 * 평균 계산에 사용된 매물들의 최대/최소 금액 점수 구하기
 * @param currentProperty 현재 매물
 * @param allProperties 전체 매물 목록
 * @param tradeType 거래 유형 ("매매" | "전세" | "월세")
 * @returns { min: 최소값, max: 최대값 }, 계산 불가능한 경우 undefined
 */
export function getPriceScoreRange(
    currentProperty: Property,
    allProperties: Property[],
    tradeType: "매매" | "전세" | "월세"
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
        return undefined;
    }

    // 상가, 토지, 건물, 사무실은 지상/지하 구분을 하지 않음
    const needsUndergroundCheck = currentType !== "상가" && currentType !== "토지" && currentType !== "건물" && currentType !== "사무실";
    const currentIsUnderground = needsUndergroundCheck ? isUnderground(currentProperty) : undefined;

    // 조건에 맞는 매물들 필터링
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
    };
}


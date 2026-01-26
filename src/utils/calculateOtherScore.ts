import { PropertyData } from "@/types";

/**
 * 기타점수 계산
 * 기본 3점 + 방향(남/남동/남서) 1점 + 주차 1점 + 엘베 1점 + 동물 1점 + 보안(개당 0.2점) + 기타(개당 0.5점)
 * 최대 10점 만점
 * 
 * @param propertyData PropertyData 객체
 * @returns 계산된 기타점수 (0~10점), 계산 불가능한 경우 undefined
 */
export function calculateOtherScore(
    propertyData: PropertyData
): number | undefined {
    let score = 3; // 기본 점수 3점

    // 1. 방향: 남/남동/남서 일 때 1점
    const direction = propertyData?.direction_side?.trim();
    if (direction === "남" || direction === "남동" || direction === "남서") {
        score += 1;
    }

    // 2. 주차: 가능하면 1점 (parking_available이 비어있지 않으면)
    if (propertyData?.parking_available && propertyData.parking_available.trim() !== "") {
        score += 1;
    }

    // 3. 엘리베이터: house_other 배열에 "엘리베이터"가 포함되어 있으면 1점
    if (propertyData?.house_other && propertyData.house_other.includes("엘리베이터")) {
        score += 1;
    }

    // 4. 동물: 가능하면 1점 (pet_allowed가 비어있지 않으면)
    if (propertyData?.pet_allowed && propertyData.pet_allowed.trim() !== "") {
        score += 1;
    }

    // 5. 보안: 하나당 0.2점
    if (propertyData?.house_security && Array.isArray(propertyData.house_security)) {
        score += propertyData.house_security.length * 0.2;
    }

    // 6. 기타: 하나당 0.5점 (엘베 포함해서 모두 계산)
    if (propertyData?.house_other && Array.isArray(propertyData.house_other)) {
        score += propertyData.house_other.length * 0.5;
    }

    // 최대 10점으로 제한 (사용자 요청: 10점 만점)
    return Math.min(10, Math.round(score * 10) / 10); // 소수점 첫째 자리까지
}



















import { Property } from "@/types";

/**
 * 신선도 점수 계산
 * ON 매물만 계산, 수정일 기준으로 10점 만점에서 하루에 0.2점씩 감소
 * 
 * @param property Property 객체
 * @returns 계산된 신선도 점수 (0~10점), ON 매물이 아니거나 계산 불가능한 경우 undefined
 */
export function calculateFreshnessScore(
    property: Property
): number | undefined {
    // ON 매물만 계산
    if (!property.on_board_state?.on_board_state) {
        return undefined; // OFF 매물은 계산하지 않음
    }

    // 수정일 (update_at 사용)
    const updateDate = property.update_at;
    if (!updateDate) {
        return undefined; // 수정일이 없으면 계산 불가
    }

    // 날짜 파싱
    const update = new Date(updateDate);
    const now = new Date();
    
    // 날짜 차이 계산 (일 단위)
    const diffTime = now.getTime() - update.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); // 일 단위로 변환

    // 10점 만점에서 하루에 0.2점씩 감소
    const score = 10 - (diffDays * 0.2);

    // 최소값은 0점
    return Math.max(0, Math.round(score * 10) / 10); // 소수점 첫째 자리까지
}



















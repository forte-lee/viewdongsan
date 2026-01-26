/**
 * 원 단위를 기준으로 '만', '억', '조' 등으로 자동 변환
 * @param value 문자열 또는 숫자 형태의 금액 (예: 100000000 → "1억")
 * @returns 예: "1억", "1.53조", "120만", "500원"
 */
export function convertUnitFromWon(value: string | number): string {
    const num = typeof value === "string" ? parseInt(value.replace(/,/g, ""), 10) : value;

    if (isNaN(num) || num === 0) return "0원";

    const units = [
        { unit: "조", value: 1_0000_0000_0000 }, // 1조 = 1,0000 * 1억
        { unit: "억", value: 100_000_000 },      // 1억
        { unit: "만", value: 10_000 },           // 1만
    ];

    for (const { unit, value: divider } of units) {
        if (num >= divider) {
            const result = num / divider;

            return Number.isInteger(result)
                ? `${result}${unit}`
                : `${result.toFixed(2).replace(/\.?0+$/, "")}${unit}`; // 소수점 제거
        }
    }

    // ✅ 1만 미만 → 천 단위 콤마 + '원' 붙이기
    return `${num.toLocaleString("ko-KR")}`;
}

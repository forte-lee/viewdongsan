/**
 * "만" 단위를 기준으로 자동으로 '억', '조' 등으로 단위 변환
 * @param value 문자열 또는 숫자 형태의 금액 ("10000" = 1억)
 * @returns 예: "1억", "1.53조", "1,200만"
 */
export function convertUnitFromMan(value: string | number): string {
  const num = typeof value === "string" ? parseInt(value.replace(/,/g, ""), 10) : value;

  if (isNaN(num) || num === 0) return "0";

  const units = [
    { unit: "조", value: 100000000 },
    { unit: "억", value: 10000 },
    { unit: "만", value: 1 }
  ];

  for (const { unit, value: divider } of units) {
    if (num >= divider) {
      const result = num / divider;

      if (Number.isInteger(result)) {
        // ✅ 정수 결과에도 콤마 적용
        return `${result.toLocaleString("ko-KR")}${unit}`;
      }

      // ✅ 실수 결과는 그대로 출력 (소수점 유지)
      return `${result.toString()}${unit}`;
    }
  }

  // 만 미만인 경우는 콤마 붙이지 않음 (예: 999 → "999만")
  return `${num}만`;
}

// utils/formatNumber.ts
export function formatNumberInput(input: string): string {
    // 숫자 이외의 문자는 제거
    const numeric = input.replace(/[^0-9]/g, "");

    // 숫자가 아닌 경우 빈 문자열 반환
    if (!numeric) return "";

    // 숫자를 정수로 변환 후 로케일 문자열로 포맷
    return parseInt(numeric, 10).toLocaleString("ko-KR");
}

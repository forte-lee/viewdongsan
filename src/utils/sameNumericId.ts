/**
 * PostgREST/JSON에서 int/bigint가 문자열로 올 때 strict === 로는 매칭이 실패할 수 있어
 * 숫자로 통일해 비교합니다.
 */
export function isSameNumericId(a: unknown, b: unknown): boolean {
    if (a == null || b == null) return false;
    const na = Number(a);
    const nb = Number(b);
    return Number.isFinite(na) && Number.isFinite(nb) && na === nb;
}

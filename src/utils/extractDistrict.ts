/**
 * 주소에서 구(區) 정보 추출
 * @param address 주소 문자열 (예: "서울특별시 강남구 역삼동 123" 또는 "강남구 역삼동")
 * @returns 구 이름 (예: "강남구") 또는 null
 */
export function extractDistrict(address: string | null | undefined): string | null {
    if (!address || address.trim() === "") return null;
    
    // "구"로 끝나는 패턴 찾기 (예: "강남구", "서초구")
    // 서울특별시 강남구, 경기도 수원시 영통구 등 다양한 형식 지원
    const match = address.match(/([가-힣]+구)/);
    
    if (match && match[1]) {
        return match[1];
    }
    
    return null;
}



















// 시/도 이름 정규화 (서울특별시 → 서울)
export const normalizeSido = (sido: string) => {
    return sido
      .replace("서울특별시", "서울")
      .replace("부산광역시", "부산")
      .replace("대구광역시", "대구")
      .replace("인천광역시", "인천")
      .replace("광주광역시", "광주")
      .replace("대전광역시", "대전")
      .replace("울산광역시", "울산")
      .replace("세종특별자치시", "세종");
  };
  
  // 동 이름 정규화 (삼성1동 → 삼성동)
  export const normalizeDong = (dong: string) => {
    return dong.replace(/[0-9]+동$/, "동");
  };
  
  // 전체 주소 리스트 정규화
  // 시군구만 선택된 경우도 처리 (동이 없는 경우)
  export const normalizeAddressList = (list: string[]) => {
    return list.map((addr) => {
      const parts = addr.split(" ");
      if (parts.length === 2) {
        // 시군구만 선택된 경우 (예: "서울특별시 송파구")
        const [sido, sigugun] = parts;
        const normalizedSido = normalizeSido(sido);
        return `${normalizedSido} ${sigugun}`;
      } else if (parts.length >= 3) {
        // 시군구 + 동이 선택된 경우
        const [sido, sigugun, dong] = parts;
        const normalizedSido = normalizeSido(sido);
        const normalizedDong = normalizeDong(dong);
        return `${normalizedSido} ${sigugun} ${normalizedDong}`;
      }
      return addr;
    });
  };
  
  // 검색 키워드에 대해서도 동일한 동 정규화 적용
  export const normalizeAddressKeyword = (keyword: string) => {
    return normalizeDong(keyword.trim());
  };

  // 단일 주소 정규화 (매물 주소 비교용)
  // "서울특별시 송파구 신천동 17-6..." → "서울 송파구 신천동"
  export const normalizeSingleAddress = (address: string): string => {
    if (!address) return "";
    
    // 주소를 공백으로 분리
    const parts = address.trim().split(/\s+/);
    if (parts.length < 3) return address; // 시도, 시군구, 동이 없으면 원본 반환
    
    const sido = parts[0];
    const sigugun = parts[1];
    const dong = parts[2];
    
    const normalizedSido = normalizeSido(sido);
    const normalizedDong = normalizeDong(dong);
    
    return `${normalizedSido} ${sigugun} ${normalizedDong}`;
  };
  
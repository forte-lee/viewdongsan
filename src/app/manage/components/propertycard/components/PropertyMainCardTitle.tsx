import { Label } from "@/components/ui";

interface PropertyMainCardTitleProps {
    data: ShowData;
    propertyId: number;
    propertyType: string;
    addressDong?: string;
}

function PropertyMainCardTitle({ data, propertyId, propertyType, addressDong }: PropertyMainCardTitleProps) {
    // 주소에서 동까지만 추출하는 함수 (번지수 제거)
    const extractDongAddress = (address: string): string => {
        if (!address) return "";
        
        // 번지수 패턴 제거 (예: "100-11", "100", "100-1" 등)
        // 패턴: 공백 + 숫자(-숫자)? + (공백 또는 끝 또는 추가 정보)
        // 번지수와 그 이후의 모든 내용 제거
        let cleaned = address.replace(/\s+\d+(-\d+)?(\s.*)?$/, '').trim();
        
        return cleaned;
    };

    // 단지명이 있으면 단지명 사용, 없으면 주소 사용
    let baseTitle = data.sd_complex || extractDongAddress(data.sd_address_simple || data.sd_address || "");
    
    // 아파트 또는 오피스텔이고 동 번호가 있으면 추가
    let displayTitle = baseTitle;
    if ((propertyType === "아파트" || propertyType === "오피스텔") && addressDong && addressDong.trim()) {
        displayTitle = `${baseTitle} ${addressDong}동`.trim();
    }
    
    return (
        <div className="flex flex-row w-full justify-between items-center gap-2">
            {displayTitle && (
                <div className="flex flex-row flex-1 items-center gap-2 min-w-0">
                    <Label className="text-xs text-gray-500 whitespace-nowrap">#{propertyId}</Label>
                    <Label className="text-sm font-bold truncate">{displayTitle}</Label>
                </div>
            )}
        </div>
    );
}

export { PropertyMainCardTitle };


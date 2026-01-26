import { Label } from "@/components/ui";

interface PropertyMainCardDetailProps {
    data: ShowData;
}

// 주소에서 지번까지만 추출하는 함수
function extractJibunAddress(address: string, complexName?: string): string {
    if (!address) return "";
    
    // 기본 주소에서 지번 패턴 찾기 (예: "1643-12", "956-9", "17-6")
    // 지번은 보통 "동 이름 + 숫자-숫자" 또는 "숫자-숫자" 형태
    const jibunPattern = /(\d+-\d+)/;
    const match = address.match(jibunPattern);
    
    let baseAddress = address;
    
    // 단지명이 있으면 포함
    if (complexName && complexName.trim()) {
        // 기본 주소에서 지번까지만 추출
        if (match) {
            const jibunIndex = address.indexOf(match[1]);
            const jibunEndIndex = jibunIndex + match[1].length;
            baseAddress = address.substring(0, jibunEndIndex).trim();
        }
        return `${baseAddress} ${complexName}`.trim();
    }
    
    // 단지명이 없으면 지번까지만
    if (match) {
        const jibunIndex = address.indexOf(match[1]);
        const jibunEndIndex = jibunIndex + match[1].length;
        let result = address.substring(0, jibunEndIndex).trim();
        
        // 지번 뒤에 공백이나 다른 문자가 있으면 제거
        result = result.replace(/\s+.*$/, '');
        return result;
    }
    
    // 지번 패턴이 없으면 동/호/층 정보 제거
    return address
        .replace(/\s*\d+동.*$/, '') // "101동" 이후 제거
        .replace(/\s*-\d+층.*$/, '') // "-1층" 이후 제거
        .replace(/\s*\d+층.*$/, '') // "1층" 이후 제거
        .replace(/\s*[a-zA-Z]\d+호.*$/, '') // "b01호" 이후 제거
        .replace(/\s*\d+호.*$/, '') // "101호" 이후 제거
        .trim();
}

function PropertyMainCardDetail({ data }: PropertyMainCardDetailProps) {
    // sd_information에서 입주가능일 관련 텍스트 분리
    const infoItems =
        data.sd_information && data.sd_information.trim()
            ? data.sd_information
                  .split(/\s+/)
                  .filter((item) => item && item.trim())
            : [];

    // 입주가능일 항목 찾기 및 뒤에 오는 관련 항목들 함께 묶기
    let enterDateText = "";
    const otherItems: string[] = [];
    let isEnterDateSection = false;

    for (let i = 0; i < infoItems.length; i++) {
        const item = infoItems[i];
        
        if (item.includes("입주가능일") || item.includes("입주가능")) {
            // 입주가능일 섹션 시작
            isEnterDateSection = true;
            enterDateText = item;
        } else if (isEnterDateSection) {
            // 입주가능일 뒤에 오는 항목들 (날짜, 협의, 하시 등)
            if (item.match(/^\d{4}-\d{2}-\d{2}$/) || item === "협의" || item === "하시" || item === "즉시") {
                enterDateText += " " + item;
            } else {
                // 입주가능일 섹션 종료
                isEnterDateSection = false;
                otherItems.push(item);
            }
        } else {
            otherItems.push(item);
        }
    }

    return (
        <div className="flex flex-col w-full justify-start items-start gap-1">
            {/* 1줄: 타입/용도 */}
            <div className="flex flex-row w-full justify-start gap-2 flex-wrap">
                {data.sd_type && data.sd_estate_use && (
                    <Label className="flex text-xs text-gray-600 whitespace-nowrap">
                        {data.sd_type}-{data.sd_estate_use}
                    </Label>
                )}
            </div>

            {/* 2줄: 면적, 층 */}
            <div className="flex flex-row w-full justify-start gap-2 flex-wrap">
                {data.sd_area && data.sd_area.trim() && (
                    <Label className="flex text-xs text-gray-600 whitespace-nowrap">
                        {data.sd_area}
                    </Label>
                )}
                {(() => {
                    // floor_level이 있으면 해당층 숫자 대신 floor_level 사용 (외부 페이지용)
                    if (data.sd_floor_level && data.sd_floor_level !== "") {
                        const floorTop = data.sd_floor_top?.replace('층', '') || '';
                        const floorDisplay = `층:${data.sd_floor_level}${floorTop ? '/' + floorTop : ''}`;
                        return (
                            <Label className="flex text-xs text-gray-600 whitespace-nowrap">
                                {floorDisplay}
                            </Label>
                        );
                    }
                    // floor_level이 없으면 기존처럼 해당층 표시
                    return data.sd_floor && data.sd_floor.trim() ? (
                        <Label className="flex text-xs text-gray-600 whitespace-nowrap">
                            {data.sd_floor}
                        </Label>
                    ) : null;
                })()}
            </div>
            
            {/* 옵션들 (방/욕실/입주 등) - 너무 붙지 않도록 단위별로 줄바꿈 */}
            {otherItems.length > 0 && (
                <div className="flex flex-row w-full justify-start flex-wrap gap-x-2 gap-y-0.5">
                    {otherItems.map((item, idx) => (
                            <Label
                                key={idx}
                                className="text-xs text-gray-600 whitespace-nowrap"
                            >
                                {item}
                            </Label>
                        ))}
                </div>
            )}

            {/* 입주가능일은 별도 한 줄에 표시 */}
            {enterDateText && (
                <div className="flex flex-row w-full justify-start mt-0.5">
                    <Label className="text-xs text-gray-600 whitespace-nowrap">
                        {enterDateText}
                    </Label>
                </div>
            )}
        </div>
    );
}

export { PropertyMainCardDetail };


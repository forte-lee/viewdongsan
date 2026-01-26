import { Label } from "@/components/ui";

interface PropertyMainCardDetailProps {
    data: ShowData;
}

// 주소에서 지번까지만 추출하는 함수 - TODO: 사용 예정
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function extractJibunAddress(_address: string, _complexName?: string): string {
    return ""; // TODO: 구현 예정
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


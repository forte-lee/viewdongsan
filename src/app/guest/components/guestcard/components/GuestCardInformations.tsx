import { Label, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui";
import TooltipWrapper from "@/components/ui/tooltip/ToolTipWrapper";
import { GuestProperty } from "@/types";

interface Props {
    guestProperty: GuestProperty;
    maxLength?: number;
}

function GuestCardInformations({ guestProperty, maxLength = 20 }: Props) {
    const data = guestProperty.data || {}; // 기본값 설정

    // 표시할 정보 목록 (한 줄로 합치기)
    const informationList = [
        data.person ? `●사용인원: ${data.person}명` : "",
        data.propertys?.length ? `●매물종류: ${data.propertys.join(", ")}` : "",
        data.land_use?.length ? `●사용용도: ${data.land_use.join(", ")}` : "",
        data.estate_use?.length ? `●용도지역: ${data.estate_use.join(", ")}` : "",
        data.property_allow ? `●허가: ${data.property_allow}` : "",
        data.company_name ? `●상호명: ${data.company_name}` : "",
        data.trade_possible_cash ? `●가용현금: ${data.trade_possible_cash}만원` : "",
        data.trade_premium ? `●권리금: ${data.trade_premium}` : "",
        data.area_reference ? `●참고면적: ${data.area_reference}평` : "",
        data.area_ground ? `●대지면적: ${data.area_ground}평` : "",
        data.area_grossfloor ? `●연면적: ${data.area_grossfloor}평` : "",
        data.room_number ? `●방구조: 방${data.room_number}, 욕실${data.room_bathroom_number}` : "",
        data.parking_is_car ? `●주차: ${data.parking_is_car}` : "",
        data.pet_is_pet ? `●애완: ${data.pet_is_pet}` : "",
        data.floor_types?.length ? `●층: ${data.floor_types.join(", ")}` : "",
        data.elevator_is ? `●E/V: ${data.elevator_is}` : "",
        data.sublease ? `●전대차: ${data.sublease}` : "",
        data.sublease_memo ? `●전대수: ${data.sublease_memo}` : "",
        data.interior ? `●인테리어: ${data.interior}` : "",
        data.enter_load ? `●진입도로: ${data.enter_load}` : "",
    ].filter(Boolean); // 빈 값 제거

    // 한 줄로 합치기
    const fullText = informationList.join("\n");
    const displayText = fullText.length > maxLength ? `${fullText.substring(0, maxLength)}...` : fullText;

    return (
        <div>
            <TooltipWrapper text={displayText} />            
        </div>
        
    );
}

export { GuestCardInformations };

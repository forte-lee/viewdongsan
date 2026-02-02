import { Label } from "@/components/ui";
import { ShowData } from "@/app/manage/components/propertycard/Data";

interface PropertyCardDetailProps {
    data: ShowData;
}

function PropertyCardDetail({ data}: PropertyCardDetailProps) {

    return (
        <div className="flex flex-col w-full justify-start items-start">
            {/* 주소 */}
            <Label className="flex text-sm">{data.sd_address}</Label>
            {/* 면적정보 */}
            <div className="flex flex-row w-full justify-start pt-1">
                <Label className="flex text-xs text-gray-600">{data.sd_type}-{data.sd_estate_use}</Label>
                <Label className="flex text-xs text-gray-600 pl-3">{data.sd_area}</Label>
                <Label className="flex text-xs text-gray-600 pl-3">{data.sd_floor}</Label>                
            </div>
            
            {/* 옵션들 */}
            <div className="flex flex-row w-full justify-start">
                <Label className="flex text-xs text-gray-600">{data.sd_information}</Label>
            </div>

            {/* 광고등록일/최근수정일 */}
            <div className="flex flex-row w-full justify-start pt-1">
                <Label className="flex text-xs text-gray-600">{data.sd_create_at}</Label>
                <Label className="flex text-xs text-gray-600 pl-3">{data.sd_update_at}</Label>
            </div>

            {/* 최근수정일 */}
            <div className="flex flex-row w-full justify-start">
                <Label className="flex text-xs text-gray-600">{data.sd_on_board_at}</Label>
            </div>

        </div>
    );
}

export {PropertyCardDetail};

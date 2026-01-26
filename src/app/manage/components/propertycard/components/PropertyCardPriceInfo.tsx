import { Label } from "@/components/ui";

interface PropertyCardPriceInfoProps {
    data: ShowData;
}

function PropertyCardPriceInfo({ data }: PropertyCardPriceInfoProps) {

    return (
        <div className="flex flex-col w-full h-full pl-8 justify-center items-start">
            {/* 매매 */}
            <div className="flex flex-row items-center" >
                <Label className="flex text-sm font-bold">{data.sd_trade_price}</Label>
            </div>

            {/* 전세 */}
            <div className="flex flex-row items-center" >
                <Label className="flex text-sm font-bold">{data.sd_trade_deposit}</Label>
            </div>

            {/* 월세*/}
            <div className="flex flex-row items-center" >
                <Label className="flex text-sm font-bold">{data.sd_trade_rent}</Label>
            </div>

            {/* 월세 */}
            <div className="flex flex-row items-center" >
                <Label className="flex text-sm font-bold">{data.sd_trade_rent_sub}</Label>
            </div>

            {/* 관리비 */}
            <div className="flex flex-row items-center pt-1" >
                <Label className="flex text-xs text-gray-700">{data.sd_admin_cost}</Label>
            </div>
        </div>
    );
}

export {PropertyCardPriceInfo};

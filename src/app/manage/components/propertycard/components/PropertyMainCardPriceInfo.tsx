import { Label } from "@/components/ui";

interface PropertyMainCardPriceInfoProps {
    data: ShowData;
}

function PropertyMainCardPriceInfo({ data }: PropertyMainCardPriceInfoProps) {
    // 금액 포맷팅
    const tradePrice = data.sd_trade_price && data.sd_trade_price.trim();
    const jeonse = data.sd_trade_deposit && data.sd_trade_deposit.trim();
    const wolseMain = data.sd_trade_rent && data.sd_trade_rent.trim();
    const wolseSub = data.sd_trade_rent_sub && data.sd_trade_rent_sub.trim();

    return (
        <div className="flex flex-col w-full justify-center items-start gap-0.5 text-left">
            {tradePrice && (
                <Label className="flex text-xs font-bold text-gray-900">
                    {tradePrice}
                </Label>
            )}
            {jeonse && (
                <Label className="flex text-xs font-bold text-gray-900">
                    {jeonse}
                </Label>
            )}
            {wolseMain && (
                <Label className="flex text-xs font-bold text-gray-900">
                    {wolseMain}
                </Label>
            )}
            {wolseSub && (
                <Label className="flex text-xs font-bold text-gray-900">
                    {wolseSub}
                </Label>
            )}
            {data.sd_admin_cost && (
                <Label className="flex text-[11px] text-gray-700 mt-1">
                    {data.sd_admin_cost}
                </Label>
            )}
        </div>
    );
}

export { PropertyMainCardPriceInfo };


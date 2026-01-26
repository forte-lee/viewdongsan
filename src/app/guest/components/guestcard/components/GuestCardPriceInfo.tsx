import { Label } from "@/components/ui";
import { GuestProperty } from "@/types";
import { convertUnitFromMan } from "@/utils/convertUnitFromMan";

interface GuestCardPriceInfoProps {
    guestProperty: GuestProperty;
}

function GuestCardPriceInfo({ guestProperty }: GuestCardPriceInfoProps) {
    let trade_price = "";
    let trade_deposit = "";
    let trade_rent_deposit = "";
    let trade_rent = "";

    if (guestProperty.type !== undefined) {
        const d = guestProperty.data;

        /** ------------------------
         * 매매
         * ------------------------ */
        if (d.trade_types?.includes("매매")) {
            const min = d.trade_price_min;
            const max = d.trade_price_max;

            if (min || max) {
                trade_price = "매매 ";
                if (min && max) {
                    trade_price += `${convertUnitFromMan(min)} ~ ${convertUnitFromMan(max)}`;
                } else if (min) {
                    trade_price += `${convertUnitFromMan(min)}~`;
                } else if (max) {
                    trade_price += `~${convertUnitFromMan(max)}`;
                }
            }
        }

        /** ------------------------
         * 전세
         * ------------------------ */
        if (d.trade_types?.includes("전세")) {
            const min = d.trade_deposit_min;
            const max = d.trade_deposit_max;

            if (min || max) {
                trade_deposit = "전세 ";
                if (min && max) {
                    trade_deposit += `${convertUnitFromMan(min)} ~ ${convertUnitFromMan(max)}`;
                } else if (min) {
                    trade_deposit += `${convertUnitFromMan(min)}~`;
                } else if (max) {
                    trade_deposit += `~${convertUnitFromMan(max)}`;
                }
            }
        }

        /** ------------------------
         * 월세
         * ------------------------ */
        if (d.trade_types?.includes("월세")) {
            const depositMin = d.trade_rent_deposit_min;
            const depositMax = d.trade_rent_deposit_max;
            const rentMin = d.trade_rent_min;
            const rentMax = d.trade_rent_max;

            // 보증금
            if (depositMin || depositMax) {
                trade_rent_deposit = "월세 ";
                if (depositMin && depositMax) {
                    trade_rent_deposit += `~${convertUnitFromMan(depositMax)}`;     //~최대값만 표시
                } else if (depositMin) {
                    trade_rent_deposit += `${convertUnitFromMan(depositMin)}~`;
                } else if (depositMax) {
                    trade_rent_deposit += `~${convertUnitFromMan(depositMax)}`;
                }
            }

            // 월세 금액
            if (rentMin || rentMax) {
                if (rentMin && rentMax) {
                    trade_rent = `~${convertUnitFromMan(rentMax)}`;             //~최대값만 표시
                } else if (rentMin) {
                    trade_rent = `${convertUnitFromMan(rentMin)}~`;
                } else if (rentMax) {
                    trade_rent = `~${convertUnitFromMan(rentMax)}`;
                }
            }
        }
    }

    return (
        <div className="flex flex-col w-full h-full justify-center items-center">
            {guestProperty.data.trade_types?.includes("매매") && trade_price && (
                <div className="flex flex-row items-center">
                    <Label className="flex text-sm font-bold">{trade_price}</Label>
                </div>
            )}
            {guestProperty.data.trade_types?.includes("전세") && trade_deposit && (
                <div className="flex flex-row items-center">
                    <Label className="flex text-sm font-bold">{trade_deposit}</Label>
                </div>
            )}
            {guestProperty.data.trade_types?.includes("월세") && (trade_rent_deposit || trade_rent) && (
                <div className="flex flex-row items-center">
                    <Label className="flex text-sm font-bold">
                        {trade_rent_deposit}
                        {trade_rent && "/" + trade_rent}
                    </Label>
                </div>
            )}
        </div>
    );
}

export { GuestCardPriceInfo };

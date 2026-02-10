"use client";

import { Property } from "@/types";
import { Label } from "@radix-ui/react-label";
import { CopyableField } from "@/components/common/etc/CopyableField";
import { ShowData } from "@/app/manage/components/propertycard/Data";

interface PropertyCardAdDetailViewProps {
    property_Data: Property;
    data: ShowData;
}

function PropertyCardAdDetailView({ property_Data, data }: PropertyCardAdDetailViewProps) {
    
    // 광고창 테이블 항목 (사진 순서대로)
    const getTableItems = () => {
        const type = (property_Data.property_type || "").trim();

        // 총 주차 표시 문자열 생성:
        // - parking_total이 있으면: "기존 주차정보 / 총 {parking_total}대"
        // - 없으면: 기존 주차정보만 표시
        const getTotalParkingText = () => {
            const total = property_Data.data?.parking_total;
            const base = data.sd_parking_infor ?? "";

            if (total && total.trim() !== "") {
                const totalText = `총 ${total}대`;
                return base ? `${base} / ${totalText}` : totalText;
            }

            return base;
        };

        switch (type) {
            /** ========================
             * 아파트 / 오피스텔
             * ======================== */
            case "아파트":
            case "오피스텔":
                return [
                    { label: "매물종류", value: data.sd_type},
                    { label: "용도", value: data.sd_estate_use },
                    { label: "소재지", value: data.sd_address },
                    { label: "단지명", value: data.sd_complex },
                    { label: "면적", value: data.sd_area }, // 공급/전용/타입만 표시
                    { label: "층", value: data.sd_floor_applicable },
                    { label: "방향", value: data.sd_side },
                    { label: "건축물일자", value: `${data.sd_construction_standard} - ${data.sd_construct_date}` },
                    { label: "방/욕실", value: data.sd_room_infor },
                    { label: "총 주차", value: getTotalParkingText() },
                    { label: "금액", value: [data.sd_trade_price, data.sd_trade_deposit, data.sd_trade_rent, data.sd_trade_rent_sub, data.sd_admin_cost].filter(Boolean).join(" / ") },
                    { label: "옵션", value: data.sd_options },
                    { label: "입주가능일", value: data.sd_enter_date },
                ];

            /** ========================
             * 공동주택 (아파트 외)
             * ======================== */
            case "공동주택(아파트 외)":
                return [
                    { label: "매물종류", value: data.sd_type},
                    { label: "용도", value: data.sd_estate_use },
                    { label: "소재지", value: data.sd_address },
                    { label: "금액", value: [data.sd_trade_price, data.sd_trade_deposit, data.sd_trade_rent, data.sd_trade_rent_sub, data.sd_admin_cost].filter(Boolean).join(" / ") },
                    { label: "면적", value: data.sd_area },
                    { label: "층", value: `${data.sd_floor_applicable} / ${data.sd_floor_top}` },
                    { label: "방향", value: data.sd_side },
                    { label: "건축물일자", value: `${data.sd_construction_standard} - ${data.sd_construct_date}` },
                    { label: "방/욕실", value: data.sd_room_infor },
                    { label: "총 주차", value: getTotalParkingText() },
                    { label: "위반건축물 여부", value: data.sd_violation },
                    { label: "옵션", value: data.sd_options },
                    { label: "입주가능일", value: data.sd_enter_date },
                ];

            /** ========================
             * 단독주택 (임대)
             * ======================== */
            case "단독주택(임대)":
                return [
                    { label: "매물종류", value: data.sd_type},
                    { label: "용도", value: data.sd_estate_use },
                    { label: "소재지", value: data.sd_address },
                    { label: "금액", value: [data.sd_trade_price, data.sd_trade_deposit, data.sd_trade_rent, data.sd_trade_rent_sub, data.sd_admin_cost].filter(Boolean).join(" / ") },
                    { label: "면적", value: data.sd_area }, // 참고면적
                    { label: "층", value: `${data.sd_floor_applicable} / ${data.sd_floor_top}` },
                    { label: "방향", value: data.sd_side },
                    { label: "건축물일자", value: `${data.sd_construction_standard} - ${data.sd_construct_date}` },
                    { label: "방/욕실", value: data.sd_room_infor },
                    { label: "총 주차", value: getTotalParkingText() },
                    { label: "위반건축물 여부", value: data.sd_violation },
                    { label: "옵션", value: data.sd_options },
                    { label: "입주가능일", value: data.sd_enter_date },
                ];

            /** ========================
             * 건물 (통임대, 통매매)
             * ======================== */
            case "건물":
                return [
                    { label: "매물종류", value: data.sd_type},
                    { label: "용도", value: data.sd_estate_use },
                    { label: "소재지", value: data.sd_address },
                    { label: "금액", value: data.sd_trade_price },
                    { label: "면적", value: data.sd_area }, // 대지/연면적만
                    { label: "층", value: `${data.sd_floor_top} / ${data.sd_floor_underground}` },
                    { label: "방향", value: data.sd_side },
                    { label: "건축물일자", value: `${data.sd_construction_standard} - ${data.sd_construct_date}` },
                    { label: "방/욕실", value: data.sd_room_infor },
                    { label: "총 주차", value: getTotalParkingText() },
                    { label: "위반건축물 여부", value: data.sd_violation },
                    { label: "옵션", value: data.sd_options },
                    { label: "입주가능일", value: data.sd_enter_date },
                ];

            /** ========================
             * 상가 / 사무실 / 산업용
             * ======================== */
            case "상업/업무/공업용":
                return [
                    { label: "매물종류", value: data.sd_type},
                    { label: "용도", value: data.sd_estate_use },
                    { label: "소재지", value: data.sd_address },
                    { label: "금액", value: [data.sd_trade_price, data.sd_trade_deposit, data.sd_trade_rent, data.sd_trade_rent_sub, data.sd_admin_cost].filter(Boolean).join(" / ") },
                    { label: "면적", value: data.sd_area },
                    { label: "층", value: `${data.sd_floor_applicable} / ${data.sd_floor_top}` },
                    { label: "방향", value: data.sd_side },
                    { label: "건축물일자", value: `${data.sd_construction_standard} - ${data.sd_construct_date}` },
                    { label: "방/욕실", value: data.sd_room_infor },
                    { label: "총 주차", value: getTotalParkingText() },
                    { label: "위반건축물 여부", value: data.sd_violation },
                    { label: "옵션", value: data.sd_options },
                    { label: "입주가능일", value: data.sd_enter_date },
                ];

            /** ========================
             * 토지
             * ======================== */
            case "토지":
                return [
                    { label: "매물종류", value: data.sd_type},
                    { label: "용도", value: data.sd_estate_use },
                    { label: "소재지", value: data.sd_address },
                    { label: "금액", value: data.sd_trade_price },
                    { label: "면적", value: data.sd_area }, // 대지만
                    { label: "용도지역", value: data.sd_land_use },
                    { label: "진입도로", value: `${data.sd_enter_load} (${data.sd_enter_load_memo})` },
                    { label: "특이사항", value: data.sd_otherinfor },
                ];

            /** ========================
             * 기본값 (fallback)
             * ======================== */
            default:
                return [
                    { label: "매물종류", value: data.sd_type },
                    { label: "용도", value: data.sd_estate_use },
                    { label: "면적", value: data.sd_area },
                ];
        }
    };

    return (
        <div className="bg-white w-full h-full rounded-md shadow-lg overflow-hidden relative flex flex-col">
            {/* 상단 요약 */}
            <div className="flex flex-row w-full justify-between items-center h-[100px] py-3 border-b bg-gray-100 px-6">
                <div className="flex flex-col">
                    <div className="text-sm text-gray-600">매물번호 {property_Data.id}</div>
                    <Label className="text-lg font-bold">{data.sd_address}</Label>
                </div>

                {/* 금액 (상단 요약에도 보여줌) */}
                <div className="flex flex-col items-start">
                    <Label className="text-blue-600 font-bold text-base">{data.sd_trade_price}</Label>
                    <Label className="text-blue-600 font-bold text-base">{data.sd_trade_deposit}</Label>
                    <Label className="text-blue-600 font-bold text-base">{data.sd_trade_rent}</Label>
                    <Label className="text-blue-600 font-bold text-base">{data.sd_trade_rent_sub}</Label>
                </div>

                {/* 연락처 */}
                <div className="flex flex-col text-sm font-semibold text-black">
                    {(property_Data.data?.phones || []).map((phone, idx) => {
                        const owner = property_Data.data?.phone_owners?.[idx] ?? "";
                        return (
                            <div key={`${phone}-${idx}`}>
                                ☎ {phone}
                                {owner && ` (${owner})`}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 본문: 정보 테이블 */}
            <div className="flex flex-col p-6 space-y-2 overflow-y-auto">
                {getTableItems().map(({ label, value }, index) => (
                    <CopyableField key={`${label}-${index}`} label={label} value={value} />
                ))}
            </div>
        </div>
    );
}

export { PropertyCardAdDetailView };

import { Card, Separator } from "@/components/ui";
import { Property } from "@/types";
import { useEffect, useState } from "react";
import { PropertyMainCardImage } from "./components/PropertyMainCardImage";
import { PropertyMainCardPriceInfo } from "./components/PropertyMainCardPriceInfo";
import { PropertyMainCardDetail } from "./components/PropertyMainCardDetail";
import { PropertyMainCardTitle } from "./components/PropertyMainCardTitle";
import { handleApt } from "./handle/handleApt";
import { handleOfficetel } from "./handle/handleOfficetel";
import { handleVillamulti } from "./handle/handleVillamulti";
import { handleVilla } from "./handle/handleVilla";
import { handleOffice } from "./handle/handleOffice";
import { handleBuilding } from "./handle/handleBuilding";
import { handleLand } from "./handle/handleLand";
import { useAtomValue } from "jotai";
import { employeesAtom } from "@/store/atoms";

interface PropertyMainCardProps {
    property: Property;
    selected: boolean;
}

function PropertyMainCard({ property, selected }: PropertyMainCardProps) {
    const [data, setData] = useState<ShowData>({});
    const employees = useAtomValue(employeesAtom);

    const data_init = () => {
        switch (property.property_type) {
            case "아파트":
                setData(handleApt(property, employees));
                break;
            case "오피스텔":
                setData(handleOfficetel(property, employees));
                break;
            case "공동주택(아파트 외)":
                setData(handleVillamulti(property, employees));
                break;
            case "단독주택(임대)":
                setData(handleVilla(property, employees));
                break;
            case "상업/업무/공업용":
                setData(handleOffice(property, employees));
                break;
            case "건물":
                setData(handleBuilding(property, employees));
                break;
            case "토지":
                setData(handleLand(property, employees));
                break;
        }
    };

    useEffect(() => {
        data_init();
    }, [property, employees]);

    return (
        <Card
            id={`property-${property.id}`}
            className={`flex flex-col w-full border transition-all duration-150 ${selected
                    ? "border-blue-500 ring-2 ring-blue-300"
                    : "border-gray-200"
                }`}
        >
            <div className="flex flex-row w-full p-3 gap-4">
                {/* 이미지 영역 */}
                <div className="flex flex-row flex-shrink-0">
                    <PropertyMainCardImage data={data} property_Data={property} />
                </div>

                {/* 가운데 정보 + 오른쪽 금액 영역 */}
                <div className="flex flex-col flex-1 min-w-0 gap-1">
                    <PropertyMainCardTitle 
                        data={data} 
                        propertyId={property.id}
                        propertyType={property.property_type}
                        addressDong={property.data?.address_dong}
                    />
                    <Separator className="my-1" />
                    <div className="flex w-full flex-row justify-start items-stretch gap-3">
                        {/* 가운데 정보 영역: 넓게 확보 */}
                        <div className="flex flex-col flex-1 min-w-0">
                            <PropertyMainCardDetail data={data} />
                        </div>
                        {/* 오른쪽 금액 영역: 금액 길이보다 살짝 넓게만 */}
                        <div className="flex flex-col flex-shrink-0 w-auto min-w-[120px] max-w-[180px] h-full justify-center items-start">
                            <PropertyMainCardPriceInfo data={data} />
                        </div>            
                    </div>
                </div>
            </div>
        </Card>
    );
}

export default PropertyMainCard;


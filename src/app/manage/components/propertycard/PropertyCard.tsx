import { Card, Separator } from "@/components/ui";
import { Property } from "@/types";
import { useRouter } from "next/navigation";
import { PropertyCardDetail, PropertyCardHeader, PropertyCardImage, PropertyCardPriceInfo, PropertyCardSecretMemo, PropertyCardTitle } from "./components";
import { useEffect, useState } from "react";
import { da } from "date-fns/locale";
import { handleApt } from "./handle/handleApt";
import { handleOfficetel } from "./handle/handleOfficetel";
import { handleVillamulti } from "./handle/handleVillamulti";
import { handleVilla } from "./handle/handleVilla";
import { handleOffice } from "./handle/handleOffice";
import { handleBuilding } from "./handle/handleBuilding";
import { handleLand } from "./handle/handleLand";
import { useAtomValue } from "jotai";
import { employeesAtom } from "@/store/atoms";


interface PropertyProps {
    property: Property;
    selected: boolean;
    onDelete: (propertyId: number) => void;
    onRefresh?: () => void;
}

function PropertyCard({ property, selected, onDelete, onRefresh }: PropertyProps) {
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
    }

    useEffect(() => {
        data_init();
    }, [property, employees]);

    return (
        <Card
            id={`property-${property.id}`}
            className={`flex flex-col w-full items-center border transition-all duration-150 ${selected
                    ? "border-blue-500 ring-2 ring-blue-300"
                    : "border-gray-200"
                }`}
        >
            <div className="flex flex-row w-[860px] p-1">
                <div className="flex flex-row w-[190px]">
                    <div className="flex flex-row w-[50px] justify-center">
                        <PropertyCardHeader propertyId={property.id} />
                    </div>
                    <div className="flex flex-row w-[140px]">
                        <PropertyCardImage data={data} property_Data={property}/>
                    </div>
                </div>
                
                <div className="flex flex-col w-[650px] ml-2">
                    <PropertyCardTitle propertyId={property.id} propertyType={property.property_type} data={data} onDelete={() => onDelete(property.id)} property={property} onRefresh={onRefresh} />
                    <Separator className="m-0.5" />
                    <div className="flex w-full flex-row justify-start items-center p-1">
                        <div className="flex flex-col w-[460px] justift-start items-start">
                            <PropertyCardDetail data={data} />
                            <PropertyCardSecretMemo property={property} />
                        </div>
                        <div className="flex flex-col w-[180px] h-full">
                            <PropertyCardPriceInfo data={data} />            
                        </div>            
                    </div>
                </div>
            </div>
        </Card>
    );
}

export default PropertyCard;

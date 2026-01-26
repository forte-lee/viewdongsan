import { Card, Separator, Button } from "@/components/ui";
import { Property } from "@/types";
import { useEffect, useState } from "react";
import {
    PropertyCardDetail,
    PropertyCardImage,
    PropertyCardPriceInfo,
} from "@/app/manage/components/propertycard/components";
import { handleApt } from "@/app/manage/components/propertycard/handle/handleApt";
import { handleOfficetel } from "@/app/manage/components/propertycard/handle/handleOfficetel";
import { handleVillamulti } from "@/app/manage/components/propertycard/handle/handleVillamulti";
import { handleVilla } from "@/app/manage/components/propertycard/handle/handleVilla";
import { handleOffice } from "@/app/manage/components/propertycard/handle/handleOffice";
import { handleBuilding } from "@/app/manage/components/propertycard/handle/handleBuilding";
import { handleLand } from "@/app/manage/components/propertycard/handle/handleLand";
import { Label } from "@radix-ui/react-label";
import { useDeletePropertyDelete } from "@/hooks/supabase/property/useDeletePropertyDelete";
import { useRestoreProperty } from "@/hooks/supabase/property/useRestoreProperty";
import { DeletePropertyDeletePopup } from "./DeletePropertyDeletePopup";
import { TransferPropertyDialog } from "./TransferPropertyDialog";
import { useAtomValue } from "jotai";
import { employeesAtom } from "@/store/atoms";

interface PropertyDeleteReadCardProps {
    property: Property;
    selected: boolean;
    onRefresh: () => void;
}

function PropertyDeleteReadCard({ property, selected, onRefresh }: PropertyDeleteReadCardProps) {
    const { deletePropertyDelete } = useDeletePropertyDelete();
    const { restoreProperty } = useRestoreProperty();
    const [data, setData] = useState<ShowData>({});
    const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
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
    }, [property]);

    const handleTransfer = () => {
        setIsTransferDialogOpen(true);
    };

    const handleDelete = async () => {
        const success = await deletePropertyDelete(property.id);
        if (success) {
            onRefresh();
        }
    };

    const handleRestore = async () => {
        const success = await restoreProperty(property);
        if (success) {
            onRefresh();
        }
    };

    return (
        <Card
            id={`property-delete-${property.id}`}
            className={`flex flex-col w-full items-center border transition-all duration-150 ${
                selected
                    ? "border-blue-500 ring-2 ring-blue-300"
                    : "border-gray-200"
            }`}
        >
            <div className="flex flex-row w-[860px] p-1">
                <div className="flex flex-row w-[190px]">
                    <div className="flex flex-col w-[50px] justify-center items-center p-2">
                        <Label className="flex p-2">{`${property.id}`}</Label>
                    </div>
                    <div className="flex flex-row w-[140px]">
                        <PropertyCardImage data={data} property_Data={property} />
                    </div>
                </div>
                
                <div className="flex flex-col w-[650px] ml-2">
                    <div className="flex flex-row w-full justify-between items-center p-1">
                        <div className="flex flex-col w-10/12 h-5">
                            <input
                                type="text"
                                className="w-full font-bold outline-none bg-transparent"
                                placeholder="등록된 주소가 없습니다."
                                value={data.sd_title || ""}
                                disabled={true}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-6 px-2 bg-blue-50 text-blue-700 hover:bg-blue-100"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleTransfer();
                                }}
                            >
                                이전
                            </Button>
                            <DeletePropertyDeletePopup propertyId={property.id} onDelete={handleDelete}>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs h-6 px-2 bg-red-50 text-red-700 hover:bg-red-100"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                    }}
                                >
                                    삭제
                                </Button>
                            </DeletePropertyDeletePopup>
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-6 px-2 bg-green-50 text-green-700 hover:bg-green-100"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRestore();
                                }}
                            >
                                복구
                            </Button>
                        </div>
                        <div className="flex w-2/12 items-center justify-center">
                            <Label className="text-sm font-bold text-gray-600">
                                {(() => {
                                    if (property.employee_id) {
                                        const employee = employees.find(emp => emp.id === property.employee_id);
                                        return employee ? (employee.kakao_name || employee.name || "미지정") : "미지정";
                                    }
                                    return "미지정";
                                })()}
                            </Label>
                        </div>
                    </div>
                    <Separator className="m-0.5" />
                    <div className="flex w-full flex-row justify-start items-center p-1">
                        <div className="flex flex-col w-[460px] justift-start items-start">
                            <PropertyCardDetail data={data} />
                        </div>
                        <div className="flex flex-col w-[180px] h-full">
                            <PropertyCardPriceInfo data={data} />
                        </div>            
                    </div>
                </div>
            </div>
            <TransferPropertyDialog
                open={isTransferDialogOpen}
                onOpenChange={setIsTransferDialogOpen}
                propertyId={property.id}
                currentEmployeeId={property.employee_id}
                onSuccess={onRefresh}
            />
        </Card>
    );
}

export default PropertyDeleteReadCard;


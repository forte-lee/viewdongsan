import { Card, Separator, Button, Checkbox } from "@/components/ui";
import { Property } from "@/types";
import { useEffect, useState, useRef } from "react";
import { ShowData } from "@/app/manage/components/propertycard/Data";
import {
    PropertyCardDetail,
    PropertyCardImage,
    PropertyCardPriceInfo,
} from "@/app/manage/components/propertycard/components";
import { AdminPropertyReadCardHeader } from "./AdminPropertyReadCardHeader";
import { handleApt } from "@/app/manage/components/propertycard/handle/handleApt";
import { handleOfficetel } from "@/app/manage/components/propertycard/handle/handleOfficetel";
import { handleVillamulti } from "@/app/manage/components/propertycard/handle/handleVillamulti";
import { handleVilla } from "@/app/manage/components/propertycard/handle/handleVilla";
import { handleOffice } from "@/app/manage/components/propertycard/handle/handleOffice";
import { handleBuilding } from "@/app/manage/components/propertycard/handle/handleBuilding";
import { handleLand } from "@/app/manage/components/propertycard/handle/handleLand";
import { Label } from "@radix-ui/react-label";
import { useMovePropertyToDelete } from "@/hooks/supabase/property/useMovePropertyToDelete";
import { useCopyProperty } from "@/hooks/supabase/property/useCopyProperty";
import { TransferPropertyDialog } from "@/app/admin/adminmanage/deleted/components/TransferPropertyDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui";
import { useRouter } from "next/navigation";
import { useAtomValue } from "jotai";
import { employeesAtom } from "@/store/atoms";

interface AdminPropertyReadCardProps {
    property: Property;
    selected: boolean;
    onRefresh: () => void;
    /** 일괄 삭제용 체크박스 표시 여부 */
    showBulkCheckbox?: boolean;
    /** 일괄 삭제용 선택 상태 */
    isBulkSelected?: boolean;
    /** 일괄 삭제용 선택 변경 콜백 */
    onBulkSelectChange?: (checked: boolean) => void;
}

function AdminPropertyReadCard({
    property,
    selected,
    onRefresh,
    showBulkCheckbox = false,
    isBulkSelected = false,
    onBulkSelectChange,
}: AdminPropertyReadCardProps) {
    const router = useRouter();
    const { movePropertyToDelete } = useMovePropertyToDelete();
    const copyProperty = useCopyProperty();
    const [data, setData] = useState<ShowData>({});
    const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
    const [isCopying, setIsCopying] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const isDeletingRef = useRef(false);
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [property]);

    const handleTransfer = () => {
        setIsTransferDialogOpen(true);
    };

    const handleCopy = async () => {
        if (isCopying) return;
        
        setIsCopying(true);
        try {
            if (!property) {
                alert("매물 정보를 불러올 수 없습니다.");
                return;
            }

            await copyProperty(property);
            onRefresh();
        } catch (error) {
            console.error("매물 복사 중 오류:", error);
        } finally {
            setIsCopying(false);
        }
    };

    const handleDelete = async () => {
        if (isDeletingRef.current) return;
        isDeletingRef.current = true;
        setIsDeleting(true);
        try {
            const success = await movePropertyToDelete(property.id);
            if (success) {
                setTimeout(() => {
                    onRefresh();
                }, 100);
            }
        } finally {
            isDeletingRef.current = false;
            setIsDeleting(false);
        }
    };

    const handleRegister = () => {
        switch (property.property_type) {
            case "아파트":
                router.push(`/manage/register/${property.id}/apt`);
                break;
            case "오피스텔":
                router.push(`/manage/register/${property.id}/officetel`);
                break;
            case "공동주택(아파트 외)":
                router.push(`/manage/register/${property.id}/villamulti`);
                break;
            case "단독주택(임대)":
                router.push(`/manage/register/${property.id}/villa`);
                break;
            case "상업/업무/공업용":
                router.push(`/manage/register/${property.id}/office`);
                break;
            case "건물":
                router.push(`/manage/register/${property.id}/building`);
                break;
            case "토지":
                router.push(`/manage/register/${property.id}/land`);
                break;
        }
    };

    return (
        <Card
            id={`property-${property.id}`}
            className={`flex flex-col w-full items-center border transition-all duration-150 ${
                selected
                    ? "border-blue-500 ring-2 ring-blue-300"
                    : "border-gray-200"
            }`}
        >
            <div className="flex flex-row w-[860px] p-1">
                <div className="flex flex-row w-[190px]">
                    <div className="flex flex-col w-[50px] justify-center shrink-0">
                        {showBulkCheckbox && (
                            <div
                                className="flex items-center justify-center pb-1"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Checkbox
                                    checked={isBulkSelected}
                                    onCheckedChange={(checked) => onBulkSelectChange?.(checked === true)}
                                />
                            </div>
                        )}
                        <AdminPropertyReadCardHeader propertyId={property.id} />
                    </div>
                    <div className="flex flex-row flex-1 min-w-[100px]">
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
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-6 px-2 bg-purple-50 text-purple-700 hover:bg-purple-100"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopy();
                                }}
                                disabled={isCopying}
                            >
                                {isCopying ? "복사중..." : "복사"}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-6 px-2 bg-green-50 text-green-700 hover:bg-green-100"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRegister();
                                }}
                            >
                                수정
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-xs h-6 px-2 bg-red-50 text-red-700 hover:bg-red-100"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                        }}
                                        disabled={isDeleting}
                                    >
                                        {isDeleting ? "삭제중..." : "삭제"}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>해당 매물을 정말로 삭제하시겠습니까?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            이 작업이 실행되면 매물이 삭제 매물로 이동됩니다. <br />
                                            삭제 매물 관리 페이지에서 복구할 수 있습니다.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>취소</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-500">
                                            삭제
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                        <div className="flex w-2/12 items-center justify-center">
                            <Label className="text-sm font-bold text-gray-600">{data.sd_name}</Label>
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
                currentEmployeeId={property.employee_id ?? null}
                onSuccess={onRefresh}
                isDeleteProperty={false}
            />
        </Card>
    );
}

export default AdminPropertyReadCard;


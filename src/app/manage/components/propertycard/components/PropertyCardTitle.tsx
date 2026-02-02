import { Button, Label, AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui";
import { Property } from "@/types";
import { useRouter } from "next/navigation";
import { useCopyProperty } from "@/hooks/supabase/property/useCopyProperty";
import { useGetPropertyById, useAuthCheck } from "@/hooks/apis";
import { useState } from "react";
import { useMovePropertyToDelete } from "@/hooks/supabase/property/useMovePropertyToDelete";
import { useAtomValue } from "jotai";
import { employeesAtom, userEmailAtom } from "@/store/atoms";
import { ShowData } from "@/app/manage/components/propertycard/Data";

interface PropertyCardTitleProps {
    propertyId: number;
    propertyType: string;
    data: ShowData;
    onDelete: (propertyId: number) => void;
    property?: Property; // 전체 매물 데이터 (복사 기능용)
    onRefresh?: () => void;
}

function PropertyCardTitle({
    propertyId,
    propertyType,
    data,
    onDelete,
    property,
    onRefresh,
}: PropertyCardTitleProps) {
    const router = useRouter();
    const copyProperty = useCopyProperty();
    const { property: propertyData } = useGetPropertyById(propertyId);
    const [isCopying, setIsCopying] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const { movePropertyToDelete } = useMovePropertyToDelete();
    const employees = useAtomValue(employeesAtom);
    const userEmail = useAtomValue(userEmailAtom);
    const { user } = useAuthCheck();
    const isRegisteredEmployee = user && (
        (user.id && employees.some((e) => e.supabase_user_id === user.id)) ||
        (userEmail && employees.some((e) => e.kakao_email === userEmail))
    );

    // property prop이 있으면 사용, 없으면 propertyData 사용
    const property_Data = property || propertyData;
    
    const images =
        property_Data?.data?.images_watermark && property_Data?.data?.images_watermark.length > 0
            ? property_Data.data.images_watermark
            : property_Data?.data?.images ?? [];

    const openDetailWindow = (index = 0) => {
        if (!property_Data) return;
        
        // 사이트에 등록되지 않은 회원이면 상세 창을 열지 않음
        if (!isRegisteredEmployee) {
            alert("사이트에 등록된 회원만 상세 정보를 볼 수 있습니다.");
            return;
        }
        // 모달에 넘기던 데이터 → 로컬스토리지에 저장
        // propertysAll은 너무 커서 localStorage 할당량을 초과할 수 있으므로 저장하지 않음
        // 팝업 창에서는 propertysAll을 prop으로 받지 않고, 필요시 빈 배열로 처리됨
        const payload = {
            property_Data,
            data,
            images,
            index, // 기존 currentIndex 역할
            // propertysAll 제외 - localStorage 할당량 초과 방지
        };
        
        try {
            localStorage.setItem(
                `propertyDetail:${property_Data.id}`,
                JSON.stringify(payload)
            );
        } catch (error) {
            // localStorage 할당량 초과 시 에러 처리
            console.error("localStorage 할당량 초과:", error);
            alert("데이터가 너무 커서 저장할 수 없습니다. 페이지를 새로고침해주세요.");
            return;
        }

        // modal 대신 page 라우트로 오픈 (경로는 실제 page.tsx 위치와 동일하게)
        const url = `/property-detail?id=${encodeURIComponent(
            String(property_Data.id)
        )}`;
        window.open(url, "_blank", "width=1300,height=1000,scrollbars=yes");
    };

    const handleRegister = () => {
        switch (propertyType) {
            case "아파트":
                router.push(`/manage/register/${propertyId}/apt`);
                break;
            case "오피스텔":
                router.push(`/manage/register/${propertyId}/officetel`);
                break;
            case "공동주택(아파트 외)":
                router.push(`/manage/register/${propertyId}/villamulti`);
                break;
            case "단독주택(임대)":
                router.push(`/manage/register/${propertyId}/villa`);
                break;
            case "상업/업무/공업용":
                router.push(`/manage/register/${propertyId}/office`);
                break;
            case "건물":
                router.push(`/manage/register/${propertyId}/building`);
                break;
            case "토지":
                router.push(`/manage/register/${propertyId}/land`);
                break;
        }
    };

    //광고용 페이지 열기
    const handleADInformation = () => {
        const payload = {
            propertyId,
            propertyType,
            property_Data: { 
                id: propertyId, 
                property_type: propertyType, 
                data 
            }, // ✅ property 전체 넣기
            data, // 필요하다면 유지
        };

        localStorage.setItem(`propertyAd:${propertyId}`, JSON.stringify(payload));

        const url = `/property-ad?id=${propertyId}`;
        window.open(url, "_blank", "width=1200,height=800,scrollbars=yes");
    };

    // 매물 복사
    const handleCopy = async () => {
        if (isCopying) return;
        
        setIsCopying(true);
        try {
            // property prop이 있으면 사용, 없으면 API로 가져오기
            const sourceProperty = property || propertyData;
            
            if (!sourceProperty) {
                alert("매물 정보를 불러올 수 없습니다.");
                return;
            }

            await copyProperty(sourceProperty);
            if (onRefresh) {
                onRefresh();
            }
        } catch (error) {
            console.error("매물 복사 중 오류:", error);
        } finally {
            setIsCopying(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const success = await movePropertyToDelete(propertyId);
            if (success) {
                // 다이얼로그 닫기
                setIsDeleteDialogOpen(false);
                // onDelete는 로컬 상태 업데이트용이므로 성공 후에만 호출
                try {
                    if (onDelete) {
                        onDelete(propertyId);
                    }
                } catch (deleteError) {
                    console.error("onDelete 콜백 실행 중 오류:", deleteError);
                    // onDelete 에러는 무시하고 계속 진행
                }
                // onRefresh는 전체 매물 리스트를 다시 가져오는 용도
                if (onRefresh) {
                    setTimeout(() => {
                        try {
                            onRefresh();
                        } catch (refreshError) {
                            console.error("onRefresh 콜백 실행 중 오류:", refreshError);
                        }
                    }, 100);
                }
            } else {
                // 실패 시에도 다이얼로그는 닫지 않고 유지 (사용자가 다시 시도할 수 있도록)
                // toast는 useMovePropertyToDelete에서 이미 표시됨
            }
        } catch (error) {
            console.error("매물 삭제 중 오류:", error);
            setIsDeleteDialogOpen(false);
        } finally {
            setIsDeleting(false);
        }
    };



    return (
        <div className="flex flex-row w-full justify-between items-center p-1">
            {/* 제목 */}
            <div 
                className="flex flex-col w-10/12 h-5 cursor-pointer hover:text-blue-600 transition-colors"
                onClick={(e) => {
                    e.stopPropagation();
                    openDetailWindow(0);
                }}
            >
                <input
                    type="text"
                    className="w-full font-bold outline-none bg-transparent pointer-events-none"
                    placeholder="등록된 주소가 없습니다."
                    value={data.sd_title || ""}
                    readOnly={true}
                />
            </div>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-6 px-2 bg-blue-50 text-blue-700 hover:bg-blue-100"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleADInformation();
                    }}
                >
                    광고
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
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
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
                            <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
                            <AlertDialogAction 
                                onClick={handleDelete} 
                                disabled={isDeleting}
                                className="bg-red-500 hover:bg-red-500"
                            >
                                {isDeleting ? "삭제중..." : "삭제"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
            <div className="flex w-2/12 items-center justify-center">
                <Label className="text-sm font-bold text-gray-600">{data.sd_name}</Label>
            </div>
        </div>
    );
}

export { PropertyCardTitle };

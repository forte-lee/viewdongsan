import { Label } from "@/components/ui";
import { Property } from "@/types";
import { useAtomValue } from "jotai";
import { employeesAtom, userEmailAtom } from "@/store/atoms";
import { useAuthCheck } from "@/hooks/apis";

interface PropertyReadCardTitleProps {
    propertyId: number;
    propertyType: string;
    data: ShowData;
    property_Data: Property;
}

function PropertyReadCardTitle({
    propertyId: _propertyId,
    propertyType: _propertyType,
    data,
    property_Data,
}: PropertyReadCardTitleProps) {
    const employees = useAtomValue(employeesAtom);
    const userEmail = useAtomValue(userEmailAtom);
    const { user } = useAuthCheck();
    const isRegisteredEmployee = user && (
        (user.id && employees.some((e) => e.supabase_user_id === user.id)) ||
        (userEmail && employees.some((e) => e.kakao_email === userEmail))
    );

    const images =
        property_Data.data?.images_watermark && property_Data.data?.images_watermark.length > 0
            ? property_Data.data.images_watermark
            : property_Data.data?.images ?? [];

    const openDetailWindow = (index = 0) => {
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
            <div className="flex w-2/12 items-center justify-center">
                <Label className="text-sm font-bold text-gray-600">{data.sd_name}</Label>

            </div>
        </div>
    );
}

export {PropertyReadCardTitle};

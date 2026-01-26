import { Button } from "@/components/ui";
import { Property } from "@/types";
import { useAtom, useAtomValue } from "jotai";
import { employeesAtom, propertysAtom, userEmailAtom } from "@/store/atoms";
import { useAuthCheck } from "@/hooks/apis";

interface PropertyCardImageProps {
  data: ShowData;
  property_Data: Property;
}

function PropertyCardImage({ data, property_Data }: PropertyCardImageProps) {
  const [propertysAll] = useAtom(propertysAtom); // 전체 매물 목록 가져오기 (평균 계산용)
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
    <div className="flex flex-col w-1/6 min-w-[140px] justify-center items-center p-1 relative group">
      {images.length > 0 ? (
        <img
          src={images[0]}
          alt="Property"
          className="w-[140px] h-[130px] object-cover rounded-md group-hover:scale-110 transition-transform duration-300 cursor-pointer"
          onClick={() => openDetailWindow(0)} // 기존 openModal(0)
          onContextMenu={(e) => e.preventDefault()} // ✅ 우클릭 방지
        />
      ) : (
        <Button
          variant="secondary"
          className="flex w-[130px] h-[130px] justify-center items-center text-gray-700"
          onClick={() => openDetailWindow(0)}
        >
          No Image
        </Button>
      )}
    </div>
  );
}

export { PropertyCardImage };

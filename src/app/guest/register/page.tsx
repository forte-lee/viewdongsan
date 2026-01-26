"use client";

import { Button, Label } from '@/components/ui';
import { useCreateGuestProperty } from '@/hooks/apis';
import { useSearchParams } from 'next/navigation';

function GuestRegisterPage() {
    const createGuestProperty = useCreateGuestProperty();  // ✅ 매물 등록 Hook
    const searchParams = useSearchParams();
    const guestId = searchParams.get("guestId");  // ✅ URL에서 guestId 가져오기

    // 🔹 매물 타입 선택 시, DB에 저장 후 팝업에서 상세 등록 페이지 열기
    const handleTypeClick = async (type: string) => {
        if (!guestId) {
            alert("손님 ID가 없습니다.");
            return;
        }

        try {
            await createGuestProperty(type, parseInt(guestId));  // ✅ 손님 ID 전달하여 매물 등록 실행
        } catch (error) {
            console.error("매물 등록 중 오류 발생:", error);
            alert("매물 등록 중 문제가 발생했습니다.");
        }
    };

    return (
        <div className="flex flex-col w-full h-full bg-white">
            <div className="flex flex-col w-full h-[32px] pt-14 justify-center items-center">
                <Label className="text-3xl font-bold text-center">매물 등록</Label> 
                <Label className="text-xl text-gray-700 text-center">(손님ID: {guestId})</Label> 
            </div>

            <div className="flex flex-col justify-center items-center pt-10">                
                {/* <Separator className="my-2 w-full max-w-md" /> */}
                <div className="grid grid-cols-2 gap-6 pt-6">
                    {["주거", "상가/사무실/산업", "건물", "토지"].map((type) => (
                        <Button
                            variant={"outline"}
                            key={type}
                            className="p-2 w-52 h-40 text-xl font-bold text-blue-700 border-blue-700 hover:bg-blue-100 hover:text-blue-700 cursor-pointer"
                            onClick={() => handleTypeClick(type)}
                        >
                            {type}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default GuestRegisterPage;

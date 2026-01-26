import { supabase } from "@/utils/supabase/client";
import { toast } from "../../use-toast";
import { useAtom } from "jotai";
import { propertysAtom } from "@/store/atoms";

function useDeleteProperty(propertyId: number) {
    const [, setPropertysAll] = useAtom(propertysAtom);

    const deleteProperty = async () => {
        try {
            // 🔹 1. 스토리지에서 파일 목록 가져오기
            const { data: listData, error: listError } = await supabase.storage
                .from("uploads")
                .list(`images/${propertyId}/`, { limit: 1000 });

            if (listError) {
                console.error("스토리지 파일 목록 가져오기 실패:", listError.message);
                toast({
                    variant: "destructive",
                    title: "파일 삭제 실패",
                    description: "스토리지 파일 목록을 가져오지 못했습니다.",
                });
                return false;
            }

            // 🔹 2. 스토리지에서 파일 삭제
            if (listData && listData.length > 0) {
                const filePaths = listData.map((file) => `images/${propertyId}/${file.name}`);

                const { error: removeError } = await supabase.storage
                    .from("uploads")
                    .remove(filePaths);

                if (removeError) {
                    console.error("스토리지 파일 삭제 실패:", removeError.message);
                    toast({
                        variant: "destructive",
                        title: "파일 삭제 실패",
                        description: "스토리지 파일을 삭제하지 못했습니다.",
                    });
                    return false;
                }
            }

            // 🔹 3. guest_new_properties에서 해당 property_id 참조 삭제 (외래 키 제약 조건 해결)
            const { error: guestNewError } = await supabase
                .from("guest_new_properties")
                .delete()
                .eq("property_id", propertyId);

            if (guestNewError) {
                console.error("guest_new_properties 삭제 실패:", guestNewError.message);
                toast({
                    variant: "destructive",
                    title: "매물 삭제 실패",
                    description: `관련 데이터 삭제 중 오류가 발생했습니다: ${guestNewError.message}`,
                });
                return false;
            }

            // 🔹 4. 데이터베이스에서 매물 삭제
            const { error: deleteError, count } = await supabase
                .from("property")
                .delete({ count: "exact" }) // 삭제된 행 개수 반환
                .eq("id", propertyId);

            if (deleteError) {
                toast({
                    variant: "destructive",
                    title: "매물 삭제 실패",
                    description: `Supabase 오류: ${deleteError.message || "알 수 없는 오류"}`,
                });
                return false;
            }

            if (count === 0) {
                toast({
                    variant: "destructive",
                    title: "매물 삭제 실패",
                    description: "해당 ID의 매물을 찾을 수 없습니다.",
                });
                return false;
            }

            // 🔹 5. Atom에서 삭제된 매물 제거
            setPropertysAll((prev = []) => prev.filter((item) => item.id !== propertyId));

            toast({
                title: "매물 삭제 완료",
                description: "선택한 매물이 삭제되었습니다.",
            });

            // router.push("/manage"); // 초기 페이지로 이동
            return true;
        } catch (error) {
            console.error("네트워크 오류:", error);
            toast({
                variant: "destructive",
                title: "네트워크 오류",
                description: "서버와 연결할 수 없습니다. 다시 시도해주세요!",
            });
            return false;
        }
    };

    return deleteProperty;
}

export { useDeleteProperty };

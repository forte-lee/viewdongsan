"use client";

import { supabase } from "@/utils/supabase/client";
import { toast } from "../../use-toast";
import { useRouter } from "next/navigation";
import { useAuthCheck } from "../../login/useAuthCheck";
import { Property } from "@/types";
import { useAtom } from "jotai";
import { propertysAtom } from "@/store/atoms"; // ✅ propertysAtom 가져오기

function useCreateProperty() {
    const router = useRouter();
    const { user } = useAuthCheck();
    const [propertys, setPropertys] = useAtom(propertysAtom); // ✅ propertysAtom 상태 가져오기

    const createProperty = async (property_Type: string) => {
        try {
            console.log(property_Type);

            let employeeId: number | null = null;

            // 1️⃣ 직원 ID 찾기 (UUID 우선, 이름 폴백)
            let employee = null;
            
            // UUID로 먼저 찾기
            if (user?.id) {
                const result = await supabase
                    .from("employee")
                    .select("id")
                    .eq("supabase_user_id", user.id)
                    .maybeSingle();
                
                if (!result.error && result.data) {
                    employee = result.data;
                }
            }
            
            // UUID로 못 찾은 경우 이름으로 찾기 (폴백)
            if (!employee && user?.user_metadata?.full_name) {
                const result = await supabase
                    .from("employee")
                    .select("id")
                    .eq("name", user.user_metadata.full_name)
                    .maybeSingle();
                
                if (!result.error && result.data) {
                    employee = result.data;
                }
            }
            
            if (employee) {
                employeeId = employee.id;
            } else {
                console.warn("⚠️ 직원 정보를 찾을 수 없음.");
            }

            // 3️⃣ `property` 테이블에 새 매물 추가
            const { data, error } = await supabase
                .from("property")
                .insert([
                    {
                        create_at: new Date(),
                        update_at: new Date(),
                        property_type: property_Type,
                        is_register: false,
                        data: [],
                        employee_id: employeeId,
                    },
                ])
                .select();

            // 4️⃣ 에러 처리
            if (error) {
                toast({
                    variant: "destructive",
                    title: "에러가 발생했습니다.",
                    description: `Supabase 오류: ${error.message || "알 수 없는 오류"}`,
                });
                return;
            }

            if (data && data.length > 0) {
                const newProperty: Property = data[0];

                // 4-1️⃣ `property_backup` 테이블에도 동일한 데이터 저장
                const { error: backupError } = await supabase
                    .from("property_backup")
                    .insert([
                        {
                            id: newProperty.id,
                            create_at: newProperty.create_at,
                            update_at: newProperty.update_at,
                            property_type: newProperty.property_type,
                            data: newProperty.data,
                            on_board_state: newProperty.on_board_state || null,
                            employee_id: newProperty.employee_id || null,
                            is_register: newProperty.is_register || false,
                        },
                    ]);

                if (backupError) {
                    console.error("⚠️ property_backup 저장 실패:", backupError.message);
                    // 백업 실패는 경고만 하고 계속 진행
                }

                // ✅ propertysAtom에 새 매물 추가하여 UI 즉시 반영
                setPropertys((prev) => [...prev, newProperty]);

                console.log("✅ 매물 등록 성공:", property_Type);

                // 5️⃣ 등록된 매물의 ID를 가져와서 적절한 페이지로 이동
                const propertyRoutes: Record<string, string> = {
                    "아파트": "apt",
                    "오피스텔": "officetel",
                    "공동주택(아파트 외)": "villamulti",
                    "단독주택(임대)": "villa",
                    "상업/업무/공업용": "office",
                    "건물": "building",
                    "토지": "land",
                };

                const route = propertyRoutes[property_Type];

                if (route) {
                    router.push(`/manage/register/${newProperty.id}/${route}`);
                }
            }
        } catch (error) {
            console.error("매물 등록 실패:", error);
            toast({
                variant: "destructive",
                title: "네트워크 오류",
                description: "서버와 연결할 수 없습니다. 다시 시도해주세요!",
            });
        }
    };

    return createProperty;
}

export { useCreateProperty };

"use client";

import { supabase } from "@/utils/supabase/client";
import { toast } from "../../use-toast";
import { useAuth } from "@/hooks/apis";
import { Property, PropertyData } from "@/types";
import { useAtom } from "jotai";
import { propertysAtom } from "@/store/atoms";
function useCopyProperty() {
    const { user } = useAuth();
    const [, setPropertys] = useAtom(propertysAtom);

    const copyProperty = async (sourceProperty: Property, options?: { silent?: boolean }): Promise<boolean> => {
        const silent = options?.silent ?? false;
        try {
            if (!sourceProperty || !sourceProperty.id) {
                if (!silent) {
                    toast({
                        variant: "destructive",
                        title: "오류",
                        description: "복사할 매물 정보가 없습니다.",
                    });
                }
                return false;
            }

            let employeeId: number | null = null;

            // 1️⃣ 직원 ID 찾기 (UUID 우선, 이메일 폴백, 이름 폴백)
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
            
            // UUID로 못 찾은 경우 이메일로 찾기 (폴백)
            if (!employee) {
                const email = user?.email || user?.user_metadata?.email;
                if (email) {
                    const result = await supabase
                        .from("employee")
                        .select("id")
                        .eq("kakao_email", email)
                        .maybeSingle();
                    
                    if (!result.error && result.data) {
                        employee = result.data;
                    }
                }
            }
            
            // UUID와 이메일로 못 찾은 경우 이름으로 찾기 (폴백)
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
                console.warn("⚠️ 직원 정보를 찾을 수 없음. user:", user);
                if (!silent) {
                    toast({
                        variant: "destructive",
                        title: "복사 실패",
                        description: "직원 정보를 찾을 수 없습니다. 관리자에게 문의해주세요.",
                    });
                }
                return false;
            }

            // 3️⃣ 원본 매물 데이터 복사 (깊은 복사)
            const copiedData: PropertyData = JSON.parse(JSON.stringify(sourceProperty.data || {}));

            // 4️⃣ 새 매물 생성 (최초 등록일을 현재 시점으로)
            const now = new Date();
            const { data: newPropertyData, error: createError } = await supabase
                .from("property")
                .insert([
                    {
                        create_at: now, // 복사한 시점으로 설정
                        update_at: now,
                        property_type: sourceProperty.property_type,
                        is_register: sourceProperty.is_register,
                        data: copiedData, // 복사된 데이터
                        employee_id: employeeId,
                    },
                ])
                .select();

            if (createError || !newPropertyData || newPropertyData.length === 0) {
                if (!silent) {
                    toast({
                        variant: "destructive",
                        title: "매물 복사 실패",
                        description: `매물 생성 중 오류가 발생했습니다: ${createError?.message || "알 수 없는 오류"}`,
                    });
                }
                return false;
            }

            const newProperty: Property = newPropertyData[0];
            const newPropertyId = newProperty.id;

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

            // 5️⃣ 이미지 복사
            const sourceImages = sourceProperty.data?.images || [];
            const sourceWatermarkImages = sourceProperty.data?.images_watermark || [];
            
            if (sourceImages.length > 0 || sourceWatermarkImages.length > 0) {
                const copiedImages: string[] = [];
                const copiedWatermarkImages: string[] = [];

                // 원본 이미지 복사
                for (let i = 0; i < sourceImages.length; i++) {
                    const sourceImageUrl = sourceImages[i];
                    if (!sourceImageUrl) continue;

                    try {
                        // 기존 이미지 경로 추출
                        const basePublicUrl = supabase.storage.from("uploads").getPublicUrl("").data?.publicUrl || "";
                        const sourcePath = sourceImageUrl.replace(basePublicUrl, "");

                        // 기존 파일 다운로드
                        const { data: fileData, error: downloadError } = await supabase.storage
                            .from("uploads")
                            .download(sourcePath);

                        if (downloadError || !fileData) {
                            console.error(`❌ 이미지 다운로드 실패 (${i + 1}):`, downloadError?.message);
                            continue;
                        }

                        // 새 경로로 업로드
                        const fileName = `${i + 1}_${Date.now()}.png`;
                        const newPath = `images/${newPropertyId}/${fileName}`;
                        const { data: uploadData, error: uploadError } = await supabase.storage
                            .from("uploads")
                            .upload(newPath, fileData, {
                                contentType: "image/png",
                            });

                        if (uploadError) {
                            console.error(`❌ 이미지 업로드 실패 (${i + 1}):`, uploadError.message);
                            continue;
                        }

                        const newImageUrl = supabase.storage.from("uploads").getPublicUrl(uploadData.path).data?.publicUrl || "";
                        copiedImages.push(newImageUrl);
                    } catch (err) {
                        console.error(`❌ 이미지 복사 중 오류 (${i + 1}):`, err);
                    }
                }

                // 워터마크 이미지 복사
                for (let i = 0; i < sourceWatermarkImages.length; i++) {
                    const sourceWatermarkUrl = sourceWatermarkImages[i];
                    if (!sourceWatermarkUrl) continue;

                    try {
                        const basePublicUrl = supabase.storage.from("uploads").getPublicUrl("").data?.publicUrl || "";
                        const sourcePath = sourceWatermarkUrl.replace(basePublicUrl, "");

                        const { data: fileData, error: downloadError } = await supabase.storage
                            .from("uploads")
                            .download(sourcePath);

                        if (downloadError || !fileData) {
                            console.error(`❌ 워터마크 이미지 다운로드 실패 (${i + 1}):`, downloadError?.message);
                            continue;
                        }

                        const fileName = `${i + 1}_${Date.now()}.png`;
                        const newPath = `images/${newPropertyId}/watermark/${fileName}`;
                        const { data: uploadData, error: uploadError } = await supabase.storage
                            .from("uploads")
                            .upload(newPath, fileData, {
                                contentType: "image/png",
                            });

                        if (uploadError) {
                            console.error(`❌ 워터마크 이미지 업로드 실패 (${i + 1}):`, uploadError.message);
                            continue;
                        }

                        const newWatermarkUrl = supabase.storage.from("uploads").getPublicUrl(uploadData.path).data?.publicUrl || "";
                        copiedWatermarkImages.push(newWatermarkUrl);
                    } catch (err) {
                        console.error(`❌ 워터마크 이미지 복사 중 오류 (${i + 1}):`, err);
                    }
                }

                // 6️⃣ 복사된 이미지 URL을 새 매물 데이터에 업데이트
                const updatedData = {
                    ...copiedData,
                    images: copiedImages.length > 0 ? copiedImages : copiedData.images || [],
                    images_watermark: copiedWatermarkImages.length > 0 ? copiedWatermarkImages : copiedData.images_watermark || [],
                };

                const { error: updateError } = await supabase
                    .from("property")
                    .update({ data: updatedData })
                    .eq("id", newPropertyId);

                if (updateError) {
                    console.error("❌ 이미지 URL 업데이트 실패:", updateError.message);
                    if (!silent) {
                        toast({
                            variant: "destructive",
                            title: "경고",
                            description: "매물은 복사되었지만 이미지 업데이트에 실패했습니다.",
                        });
                    }
                } else {
                    // 🔹 이미지 업데이트 후 property_backup에도 반영
                    const { error: backupUpdateError } = await supabase
                        .from("property_backup")
                        .update({ data: updatedData })
                        .eq("id", newPropertyId);

                    if (backupUpdateError) {
                        console.error("⚠️ property_backup 이미지 업데이트 실패:", backupUpdateError.message);
                    }
                }
            }

            // 7️⃣ propertysAtom에 새 매물 추가하여 UI 즉시 반영
            const { data: updatedProperty, error: fetchError } = await supabase
                .from("property")
                .select("*")
                .eq("id", newPropertyId)
                .single();

            if (!fetchError && updatedProperty) {
                setPropertys((prev) => [...prev, updatedProperty as Property]);
            } else {
                setPropertys((prev) => [...prev, newProperty]);
            }

            if (!silent) {
                toast({
                    variant: "default",
                    title: "매물 복사 완료",
                    description: `매물이 성공적으로 복사되었습니다. (새 매물번호: ${newPropertyId})`,
                });
            }

            console.log("✅ 매물 복사 성공:", newPropertyId);
            return true;
        } catch (error) {
            console.error("매물 복사 실패:", error);
            if (!silent) {
                toast({
                    variant: "destructive",
                    title: "네트워크 오류",
                    description: "서버와 연결할 수 없습니다. 다시 시도해주세요!",
                });
            }
            return false;
        }
    };

    const copyPropertiesBulk = async (sourceProperties: Property[]) => {
        if (sourceProperties.length === 0) return false;

        let successCount = 0;
        const failedIds: number[] = [];

        for (const sourceProperty of sourceProperties) {
            const success = await copyProperty(sourceProperty, { silent: true });
            if (success) {
                successCount++;
            } else {
                failedIds.push(sourceProperty.id);
            }
        }

        if (successCount > 0) {
            toast({
                variant: "default",
                title: "일괄 복사 완료",
                description: `${successCount}개 매물이 복사되었습니다.${failedIds.length > 0 ? ` (${failedIds.length}개 실패)` : ""}`,
            });
        }

        return successCount > 0;
    };

    return { copyProperty, copyPropertiesBulk };
}

export { useCopyProperty };












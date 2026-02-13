"use client";

import { supabase } from "@/utils/supabase/client";
import { toast } from "@/hooks/use-toast";

const BUCKET = "uploads";
const COMPANY_BASE = "company";

/**
 * 회사 증빙 자료 이미지 업로드 (사업자등록증, 중개업등록증, 외부사진)
 * - 리사이즈/워터마크 없이 원본 업로드
 * - 사업자등록증/중개업등록증: 기존 이미지가 있으면 교체 (기존 파일 삭제 후 새 파일 업로드)
 */
export async function uploadCompanyImage(
    companyId: number,
    file: File,
    type: "business_registration" | "broker_license" | "exterior",
    options?: { replaceExistingUrl?: string }
): Promise<string | null> {
    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const timestamp = Date.now();
    const fileName = type === "exterior" 
        ? `exterior_${timestamp}.${ext}` 
        : `${type}_${timestamp}.${ext}`;
    const path = type === "exterior"
        ? `${COMPANY_BASE}/${companyId}/exterior/${fileName}`
        : `${COMPANY_BASE}/${companyId}/${fileName}`;

    // 기존 이미지 교체 시: Storage에서 이전 파일 삭제
    if (options?.replaceExistingUrl) {
        await deleteCompanyImage(options.replaceExistingUrl);
    }

    const { data, error } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, {
            contentType: file.type || "image/png",
        });

    if (error) {
        console.error("❌ 이미지 업로드 실패:", error);
        toast({
            variant: "destructive",
            title: "업로드 실패",
            description: error.message || "이미지 업로드에 실패했습니다.",
        });
        return null;
    }

    const url = supabase.storage.from(BUCKET).getPublicUrl(data.path).data?.publicUrl || "";
    return url;
}

/**
 * 회사 이미지 삭제 (Storage에서)
 */
export async function deleteCompanyImage(url: string): Promise<boolean> {
    try {
        const basePublicUrl = supabase.storage.from(BUCKET).getPublicUrl("").data?.publicUrl || "";
        const path = url.replace(basePublicUrl, "").split("?")[0];
        const { error } = await supabase.storage.from(BUCKET).remove([path]);
        if (error) {
            console.error("❌ 이미지 삭제 실패:", error);
            return false;
        }
        return true;
    } catch {
        return false;
    }
}

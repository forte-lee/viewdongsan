import { supabase } from "@/utils/supabase/client";

/**
 * Supabase Storage의 불필요한 파일을 정리하는 함수
 * @param id 매물 ID
 * @param currentUrls 현재 DB나 상태에 남아 있는 이미지 URL 목록
 */
export const syncImagesWithSupabase = async (id: number, currentUrls: string[]) => {
    try {
        const basePath = `images/${id}`;
        const { data: files, error } = await supabase.storage
            .from("uploads")
            .list(basePath, { limit: 100, offset: 0, sortBy: { column: "name", order: "asc" } });

        const { data: wmFiles, error: wmError } = await supabase.storage
            .from("uploads")
            .list(`${basePath}/watermark`, { limit: 100, offset: 0, sortBy: { column: "name", order: "asc" } });

        if (error) throw error;
        if (wmError) throw wmError;

        const allFiles = [
            ...(files?.map(f => `${basePath}/${f.name}`) || []),
            ...(wmFiles?.map(f => `${basePath}/watermark/${f.name}`) || []),
        ];

        // 현재 Storage 경로 중에서 currentUrls에 포함되지 않은 것만 삭제 대상으로 추출
        const basePublicUrl = supabase.storage.from("uploads").getPublicUrl("").data?.publicUrl || "";
        const toDelete = allFiles.filter(path => !currentUrls.some(url => url.includes(path)));

        if (toDelete.length > 0) {
            console.log("🗑️ 삭제할 파일 목록:", toDelete);
            const { error: deleteError } = await supabase.storage.from("uploads").remove(toDelete);
            if (deleteError) throw deleteError;
        } else {
            console.log("✅ 삭제할 파일 없음");
        }
    } catch (err) {
        console.error("❌ Storage 정리 실패:", err);
    }
};

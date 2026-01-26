import { supabase } from "@/utils/supabase/client";
import { ImageListType } from "react-images-uploading";

/**
 * ✅ Supabase 이미지 업로드 (비율 유지 리사이즈 + 워터마크 + 자동 정리)
 */
export const useUploadImages = async (
    id: number,
    images: ImageListType,
    companyId: number | string | null
): Promise<{ originals: string[]; watermarks: string[] }> => {
    const originals: string[] = [];
    const watermarks: string[] = [];

    const TARGET_WIDTH = 1600;
    const TARGET_HEIGHT = 1200;

    try {
        // ✅ 회사명 불러오기
        let companyName = "Company";
        if (companyId) {
            const { data: companyData, error: companyError } = await supabase
                .from("company")
                .select("company_name")
                .eq("id", companyId)
                .single();

            if (!companyError && companyData?.company_name) {
                companyName = companyData.company_name;
            } else {
                console.warn("⚠️ company_name 불러오기 실패:", companyError?.message);
            }
        }

        // ✅ 이미지별 처리
        for (let i = 0; i < images.length; i++) {
            const item = images[i];
            const fileName = `${i + 1}_${Date.now()}.png`; // PNG (투명 지원)
            const basePath = `images/${id}`;
            const watermarkPath = `${basePath}/watermark/${fileName}`;

            // ----------------------------------------------------------
            // 🔹 1. 새 이미지 업로드
            // ----------------------------------------------------------
            if (item.file) {
                // ✅ 원본 리사이즈 (fit within box)
                const resizedOriginal = await resizeImageToFitBox(
                    item.file,
                    TARGET_WIDTH,
                    TARGET_HEIGHT
                );

                // ✅ 원본 업로드
                const { data: origData, error: origError } = await supabase.storage
                    .from("uploads")
                    .upload(`${basePath}/${fileName}`, resizedOriginal);

                if (origError) {
                    console.error("❌ 원본 업로드 실패:", origError.message);
                    originals.push("");
                    watermarks.push("");
                    continue;
                }

                const origUrl =
                    supabase.storage.from("uploads").getPublicUrl(origData.path).data
                        ?.publicUrl || "";
                originals.push(origUrl);

                // ✅ 워터마크 생성 + 업로드
                const watermarkFile = await addWatermarkToImage(
                    resizedOriginal,
                    companyName,
                    TARGET_WIDTH,
                    TARGET_HEIGHT
                );

                const { data: wmData, error: wmError } = await supabase.storage
                    .from("uploads")
                    .upload(watermarkPath, watermarkFile);

                if (wmError) {
                    console.error("❌ 워터마크 업로드 실패:", wmError.message);
                    watermarks.push("");
                    continue;
                }

                const wmUrl =
                    supabase.storage.from("uploads").getPublicUrl(wmData.path).data
                        ?.publicUrl || "";
                watermarks.push(wmUrl);
            }

            // ----------------------------------------------------------
            // 🔹 2. 기존 이미지 (.data_url) 재업로드 + 기존 삭제
            // ----------------------------------------------------------
            else if (item.data_url) {
                try {
                    const basePublicUrl =
                        supabase.storage.from("uploads").getPublicUrl("").data?.publicUrl ||
                        "";
                    const currentPath = item.data_url.replace(basePublicUrl, "");

                    // ✅ 기존 파일 다운로드
                    const { data: fileData, error: downloadError } = await supabase.storage
                        .from("uploads")
                        .download(currentPath);

                    if (downloadError || !fileData) {
                        console.error("❌ 기존 파일 다운로드 실패:", downloadError?.message);
                        originals.push("");
                        watermarks.push("");
                        continue;
                    }

                    // ✅ 리사이즈된 원본 생성
                    const resizedOriginal = await resizeImageToFitBox(
                        fileData as Blob,
                        TARGET_WIDTH,
                        TARGET_HEIGHT
                    );

                    // ✅ 새 이름으로 업로드
                    const newPath = `${basePath}/${fileName}`;
                    const { data: reuploadData, error: reuploadError } = await supabase
                        .storage
                        .from("uploads")
                        .upload(newPath, resizedOriginal);

                    if (reuploadError) {
                        console.error("❌ 새 이름으로 업로드 실패:", reuploadError.message);
                        originals.push("");
                        watermarks.push("");
                        continue;
                    }

                    // ✅ 기존 원본 + 워터마크 삭제
                    const deleteTargets: string[] = [currentPath];
                    if (currentPath.includes(`/images/`)) {
                        const parts = currentPath.split("/");
                        const name = parts.pop();
                        const dir = parts.join("/");
                        deleteTargets.push(`${dir}/watermark/${name}`);
                    }

                    await supabase.storage.from("uploads").remove(deleteTargets);

                    // ✅ 새 원본 URL 등록
                    const newOrigUrl =
                        supabase.storage.from("uploads").getPublicUrl(reuploadData.path)
                            .data?.publicUrl || "";
                    originals.push(newOrigUrl);

                    // ✅ 워터마크 이미지 생성
                    const watermarkFile = await addWatermarkToImage(
                        resizedOriginal,
                        companyName,
                        TARGET_WIDTH,
                        TARGET_HEIGHT
                    );

                    const { data: wmData, error: wmError } = await supabase.storage
                        .from("uploads")
                        .upload(watermarkPath, watermarkFile);

                    if (wmError) {
                        console.error("❌ 워터마크 업로드 실패:", wmError.message);
                        watermarks.push("");
                        continue;
                    }

                    const wmUrl =
                        supabase.storage.from("uploads").getPublicUrl(wmData.path).data
                            ?.publicUrl || "";
                    watermarks.push(wmUrl);
                } catch (ex) {
                    console.error("❌ 기존 파일 처리 중 오류:", ex);
                    originals.push("");
                    watermarks.push("");
                }
            }
        }

        // ----------------------------------------------------------
        // 🔹 3. Storage 자동 정리
        // ----------------------------------------------------------
        await cleanupUnusedStorageFiles(id, [...originals, ...watermarks]);
    } catch (err) {
        console.error("예기치 않은 오류:", err);
    }

    return { originals, watermarks };
};

/**
 * ✅ 비율 유지 리사이즈 (고정 박스 안 fit)
 * - crop / 여백 없음
 * - 투명 배경 유지
 */
async function resizeImageToFitBox(
    file: File | Blob,
    maxWidth: number,
    maxHeight: number
): Promise<Blob> {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1); // 확대 금지
            const newWidth = Math.round(img.width * scale);
            const newHeight = Math.round(img.height * scale);

            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d")!;
            canvas.width = newWidth;
            canvas.height = newHeight;

            // ✅ 투명 배경 유지 (fillRect 없음)
            ctx.drawImage(img, 0, 0, newWidth, newHeight);

            canvas.toBlob((blob) => resolve(blob!), "image/png", 0.9);
        };
        img.src = URL.createObjectURL(file);
    });
}

/**
 * ✅ 중앙 워터마크 추가 (비율유지된 이미지 위)
 */
async function addWatermarkToImage(
    file: File | Blob,
    text: string,
    targetWidth: number,
    targetHeight: number
): Promise<Blob> {
    const resized = await resizeImageToFitBox(file, targetWidth, targetHeight);
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d")!;
            canvas.width = img.width;
            canvas.height = img.height;

            ctx.drawImage(img, 0, 0);

            const fontSize = Math.floor(canvas.width / 8);
            ctx.font = `bold ${fontSize}px sans-serif`;
            ctx.fillStyle = "rgba(255,255,255,0.25)";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(text, canvas.width / 2, canvas.height / 2);

            canvas.toBlob((blob) => resolve(blob!), "image/png", 0.9);
        };
        img.src = URL.createObjectURL(resized);
    });
}

/**
 * ✅ Storage 정리 (현재 사용 중인 URL 외 파일 삭제)
 */
async function cleanupUnusedStorageFiles(id: number, validUrls: string[]) {
    try {
        const basePath = `images/${id}`;
        const { data: files } = await supabase.storage.from("uploads").list(basePath);
        const { data: wmFiles } = await supabase.storage
            .from("uploads")
            .list(`${basePath}/watermark`);

        const allPaths = [
            ...(files?.map((f) => `${basePath}/${f.name}`) || []),
            ...(wmFiles?.map((f) => `${basePath}/watermark/${f.name}`) || []),
        ];

        const baseUrl =
            supabase.storage.from("uploads").getPublicUrl("").data?.publicUrl || "";
        const unused = allPaths.filter(
            (path) => !validUrls.some((url) => url.includes(path))
        );

        if (unused.length > 0) {
            console.log("🧹 Storage 정리:", unused);
            await supabase.storage.from("uploads").remove(unused);
        }
    } catch (err) {
        console.error("❌ Storage 정리 오류:", err);
    }
}

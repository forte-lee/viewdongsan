// src/lib/geoBatchUpdater.ts

import { createClient } from "@supabase/supabase-js";

// Supabase 클라이언트 초기화
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// JS SDK 기반 지오코딩 (window.kakao 사용)
function geocodeAddressViaSDK(address: string): Promise<{ lat: number; lng: number } | null> {
    return new Promise((resolve) => {
        if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
            console.error("❌ Kakao 지도 SDK가 로드되지 않았습니다.");
            resolve(null);
            return;
        }

        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.addressSearch(address, (result: Array<{ y: string; x: string }>, status: string) => {
            if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
                resolve({
                    lat: parseFloat(result[0].y),
                    lng: parseFloat(result[0].x),
                });
            } else {
                resolve(null);
            }
        });
    });
}

export async function runGeoBatchUpdate() {
    console.log("▶️ JS SDK 기반 좌표 일괄 업데이트 시작");

    const { data: properties, error } = await supabase
        .from("property")
        .select("id, data")
        .or("data->>latitude.is.null,data->>longitude.is.null");

    if (error || !properties) {
        console.error("❌ Supabase 데이터 조회 실패:", error?.message);
        return;
    }

    for (const p of properties) {
        const address = p.data?.address;
        if (!address) continue;

        const coords = await geocodeAddressViaSDK(address);
        if (!coords) {
            console.warn(`❌ 변환 실패: ${address}`);
            continue;
        }

        await supabase
            .from("property")
            .update({
                data: {
                    ...p.data,
                    latitude: coords.lat,
                    longitude: coords.lng,
                },
            })
            .eq("id", p.id);

        console.log(`✅ ${address} → (${coords.lat}, ${coords.lng})`);

        await new Promise((res) => setTimeout(res, 200)); // 과속 방지
    }

    console.log("✅ JS SDK 기반 좌표 업데이트 완료");
}

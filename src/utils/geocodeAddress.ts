"use client";

/**
 * 주소를 카카오맵 Geocoder로 좌표로 변환
 */
export function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
    return new Promise((resolve) => {
        if (typeof window === "undefined" || !window.kakao?.maps?.services?.Geocoder) {
            resolve(null);
            return;
        }
        const geocoder = new window.kakao.maps.services.Geocoder() as {
            addressSearch: (
                address: string,
                callback: (result: Array<{ y: string; x: string }>, status: string) => void
            ) => void;
        };
        geocoder.addressSearch(address, (result, status) => {
            if (status === window.kakao.maps.services.Status.OK && result?.length > 0) {
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

"use client";

import { useEffect, useRef } from "react";
import { useKakaoLoader } from "./useKakaoLoader";

declare global {
    interface Window {
        kakao: any;
    }
}

interface SingleKakaoMapOptions {
    latitude: number;
    longitude: number;
}

export function useSingleKakaoMap(
    containerId: string,
    { latitude, longitude }: SingleKakaoMapOptions
) {
    const isLoaded = useKakaoLoader();
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);

    useEffect(() => {
        if (!isLoaded || !window.kakao || !window.kakao.maps) return;
        if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) return;

        const container =
            document.getElementById(containerId) ?? containerRef.current;
        if (!container) return;

        const center = new window.kakao.maps.LatLng(latitude, longitude);
        const map = new window.kakao.maps.Map(container, { center, level: 6 });
        mapRef.current = map;

        // ✅ 단일 마커 추가
        const marker = new window.kakao.maps.Marker({
            position: center,
            map: map,
        });

        return () => {
            marker.setMap(null);
        };
    }, [isLoaded, latitude, longitude]);

    return { containerRef, map: mapRef.current };
}

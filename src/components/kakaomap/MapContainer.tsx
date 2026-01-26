"use client";

import { useEffect } from "react";
import { useSingleKakaoMap } from "@/hooks/kakaomap/useSingleKakaoMap";

interface MapContainerProps {
  latitude: number;
  longitude: number;
  disableInteraction?: boolean;
  isPreviewMode?: boolean;
}

export default function MapContainer({
  latitude,
  longitude,
  disableInteraction = false,
  isPreviewMode = false,
}: MapContainerProps) {
  const { containerRef, map } = useSingleKakaoMap("single-map", {
    latitude,
    longitude,
  });

  useEffect(() => {
    if (!map || !containerRef.current) return;

    // 지도 인터랙션 제어
    if (disableInteraction) {
      map.setDraggable(false);
      map.setZoomable(false);
    }

    // ✅ ResizeObserver를 통해 실제 DOM 높이 변경을 감지
    const observer = new ResizeObserver(() => {
      map.relayout();
      const center = new window.kakao.maps.LatLng(latitude, longitude);
      map.setCenter(center);
    });

    observer.observe(containerRef.current);

    // ✅ 초기 1회 강제 실행 (미리보기 진입 직후)
    setTimeout(() => {
      map.relayout();
      const center = new window.kakao.maps.LatLng(latitude, longitude);
      map.setCenter(center);
    }, 200);

    return () => observer.disconnect();
  }, [map, disableInteraction, latitude, longitude, isPreviewMode]);

  // ✅ wheel 이벤트를 non-passive로 처리하여 preventDefault 에러 방지
  useEffect(() => {
    if (!containerRef.current || !disableInteraction) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
    };

    // non-passive 이벤트 리스너로 등록
    containerRef.current.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('wheel', handleWheel);
      }
    };
  }, [disableInteraction]);

  return (
    <div
      id="single-map"
      ref={containerRef}
      className={`w-full border rounded-md transition-all duration-500 ${isPreviewMode ? "h-[300px]" : "h-[300px]"
        }`}
    />
  );
}

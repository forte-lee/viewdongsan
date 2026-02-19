// MapPanel.tsx
"use client";
import { forwardRef, useImperativeHandle, useEffect } from "react";
import { Property } from "@/types";
import { useKakaoMap, type CompanyMarkerItem } from "@/hooks/kakaomap/useKakaoMap";
import { useAtomValue } from "jotai";
import { employeesAtom } from "@/store/atoms";

export interface MapPanelRef {
    focusOnProperty: (property: Property) => void;
}

interface MapPanelProps {
    properties: Property[];
    onSelectProperties?: (group: Property[]) => void; // 클러스터 클릭 시 목록
    mapId?: string; // 고유한 맵 ID (기본값: "map-panel")
    selectedPropertyIds?: string[]; // 선택된 매물 ID 목록
    /** 회사 주소 좌표 - 초기 지도 중심으로 사용 (내 회사) */
    initialCenter?: { lat: number; lng: number } | null;
    /** 여러 회사 마커 (외부 페이지용, is_registration_approved=true) */
    companyMarkers?: CompanyMarkerItem[];
    /** 회사 마커 클릭 시 콜백 */
    onCompanyMarkerClick?: (company: CompanyMarkerItem) => void;
    /** 선택된 회사 ID (클릭된 회사 마커 시각적 피드백용) */
    selectedCompanyId?: number | null;
}

const MapPanel = forwardRef<MapPanelRef, MapPanelProps>(
    ({ properties, onSelectProperties, mapId = "map-panel", selectedPropertyIds = [], initialCenter, companyMarkers, onCompanyMarkerClick, selectedCompanyId }, ref) => {
        const mapOptions = (() => {
            const base: Record<string, unknown> = {};
            if (companyMarkers && companyMarkers.length > 0) {
                base.companyMarkers = companyMarkers;
                base.onCompanyMarkerClick = onCompanyMarkerClick;
                base.selectedCompanyId = selectedCompanyId ?? null;
            }
            if (initialCenter) {
                base.latitude = initialCenter.lat;
                base.longitude = initialCenter.lng;
                base.initialCenterOnly = true;
            }
            return Object.keys(base).length > 0 ? base : undefined;
        })();
        const { containerRef, map, placeMarkersByProperties, focusToLatLng } =
            useKakaoMap(mapId, mapOptions);
        const employees = useAtomValue(employeesAtom);

        useEffect(() => {
            if (!map) {
                console.warn("⚠️ MapPanel: 맵이 아직 로드되지 않았습니다.", {
                    mapId,
                    hasContainer: !!containerRef.current,
                    hasKakao: !!window.kakao,
                    hasKakaoMaps: !!window.kakao?.maps
                });
                return;
            }
            
            console.log("✅ MapPanel: 맵 로드 완료, 마커 배치 시작", {
                mapId,
                propertiesCount: properties.length
            });
            
            placeMarkersByProperties(
                properties,
                // 개별 마커 클릭(클러스터 해제 상태)
                (single) => onSelectProperties?.(single),
                // 숫자 클러스터 클릭(여러 개 포함)
                (group) => onSelectProperties?.(group),
                selectedPropertyIds
            );
        }, [map, properties, onSelectProperties, selectedPropertyIds, mapId]);

        useImperativeHandle(ref, () => ({
            focusOnProperty: (p: Property) => {
                const lat = Number(p.data?.latitude);
                const lng = Number(p.data?.longitude);
                if (!isNaN(lat) && !isNaN(lng)) {
                    // employee_id를 통해 이름 가져오기
                    const propertyName = (() => {
                        if (p.employee_id && employees) {
                            const employee = employees.find(emp => emp.id === p.employee_id);
                            if (employee) return employee.kakao_name || employee.name || "";
                        }
                        return "";
                    })();
                    focusToLatLng(lat, lng, propertyName);
                }
            },
        }));

        return (
            <div className="w-full h-full relative">
                <div 
                    id={mapId} 
                    ref={containerRef} 
                    className="w-full h-full" 
                    style={{ position: "relative" }}
                />
                {!map && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300">
                        <div className="text-center">
                            <p className="text-gray-600 font-semibold">카카오맵 로딩 중...</p>
                            <p className="text-sm text-gray-500 mt-2">
                                {typeof window !== "undefined" && !window.kakao ? "카카오 SDK 로딩 중..." : "맵 초기화 중..."}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        );
    }
);

MapPanel.displayName = "MapPanel";
export { MapPanel };

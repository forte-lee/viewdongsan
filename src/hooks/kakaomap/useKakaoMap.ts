// useKakaoMap.ts
"use client";

import { useEffect, useRef, useState } from "react";
import { useKakaoLoader } from "./useKakaoLoader";
import { useDebounce } from "@/utils/useDebounce";
import type { Property } from "@/types";

declare global {
    interface Window {
        kakao: {
            maps: {
                Map: new (container: HTMLElement, options: Record<string, unknown>) => {
                    relayout: () => void;
                    setDraggable: (draggable: boolean) => void;
                    setZoomable: (zoomable: boolean) => void;
                    setCenter: (center: unknown) => void;
                    getProjection: () => {
                        pointFromCoords: (coords: unknown) => { x: number; y: number };
                    };
                };
                LatLng: new (lat: number, lng: number) => unknown;
                services: {
                    Geocoder: new () => unknown;
                    Status: {
                        OK: string;
                    };
                };
                Marker: new (options: Record<string, unknown>) => {
                    setMap: (map: unknown) => void;
                    getPosition: () => unknown;
                };
                MarkerClusterer: new (options: Record<string, unknown>) => {
                    clear: () => void;
                    addMarkers: (markers: unknown[]) => void;
                    getMarkers: () => unknown[];
                };
                MarkerImage: new (url: string, size: unknown, options: Record<string, unknown>) => unknown;
                Size: new (width: number, height: number) => unknown;
                Point: new (x: number, y: number) => unknown;
                InfoWindow: new (options: Record<string, unknown>) => {
                    close: () => void;
                    setContent: (content: string) => void;
                    setPosition: (position: unknown) => void;
                    open: (map: unknown) => void;
                };
                event: {
                    addListener: (target: unknown, event: string, handler: (...args: unknown[]) => void) => void;
                    removeListener: (target: unknown, event: string, handler: (...args: unknown[]) => void) => void;
                };
                load: (callback: () => void) => void;
            };
        };
    }
}

interface KakaoMapOptions {
    latitude?: number;
    longitude?: number;
    coordinates?: { lat: number; lng: number }[];
}

interface UseKakaoMapReturn {
    containerRef: React.RefObject<HTMLDivElement | null>;
    map: {
        relayout: () => void;
        setDraggable: (draggable: boolean) => void;
        setZoomable: (zoomable: boolean) => void;
        setCenter: (center: unknown) => void;
        getProjection: () => {
            pointFromCoords: (coords: unknown) => { x: number; y: number };
        };
    } | null;
    clearAll: () => void;
    /**
     * properties를 클러스터로만 표시
     * - onMarkerClick: 클러스터가 풀려 단일 마커를 클릭했을 때(개수=1)
     * - onClusterClick: 숫자 버블(클러스터)을 클릭했을 때, 포함된 전체 매물 반환
     */
    placeMarkersByProperties: (
        properties: Property[],
        onMarkerClick?: (group: Property[]) => void,
        onClusterClick?: (group: Property[]) => void,
        selectedPropertyIds?: string[]
    ) => void;
    /** 중심 이동 + 간단 인포윈도우 */
    focusToLatLng: (lat: number, lng: number, title?: string) => void;
}

export function useKakaoMap(
    containerId: string,
    options?: KakaoMapOptions
): UseKakaoMapReturn {
    const isLoaded = useKakaoLoader(); // SDK: ...&autoload=false&libraries=clusterer
    const containerRef = useRef<HTMLDivElement>(null);

    // 외부 객체는 전부 ref로
    const mapRef = useRef<{
        relayout: () => void;
        setDraggable: (draggable: boolean) => void;
        setZoomable: (zoomable: boolean) => void;
        setCenter: (center: unknown) => void;
        getProjection: () => {
            pointFromCoords: (coords: unknown) => { x: number; y: number };
        };
    } | null>(null);
    const [map, setMap] = useState<{
        relayout: () => void;
        setDraggable: (draggable: boolean) => void;
        setZoomable: (zoomable: boolean) => void;
        setCenter: (center: unknown) => void;
        getProjection: () => {
            pointFromCoords: (coords: unknown) => { x: number; y: number };
        };
    } | null>(null); // 맵 상태를 state로 관리하여 리렌더링 트리거
    const clustererRef = useRef<{
        clear: () => void;
        addMarkers: (markers: unknown[]) => void;
        getMarkers: () => unknown[];
    } | null>(null);
    const markersRef = useRef<Array<{
        setMap: (map: unknown) => void;
    }>>([]);
    const infoWindowRef = useRef<{
        close: () => void;
        setContent: (content: string) => void;
        setPosition: (position: unknown) => void;
        open: (map: unknown) => void;
    } | null>(null);

    const debouncedLat = useDebounce(options?.latitude, 300);
    const debouncedLng = useDebounce(options?.longitude, 300);
    const debouncedCoords = useDebounce(options?.coordinates, 300);

    // 맵 & 클러스터러 초기화 1회
    useEffect(() => {
        if (typeof window === "undefined") return;
        
        console.log("🔄 useKakaoMap: 초기화 시도", {
            containerId,
            isLoaded,
            hasKakao: !!window.kakao,
            hasKakaoMaps: !!window.kakao?.maps
        });
        
        if (!isLoaded) {
            console.log("⏳ useKakaoMap: 카카오맵 SDK가 아직 로드되지 않았습니다.");
            return;
        }
        
        if (!window.kakao || !window.kakao.maps) {
            console.error("❌ useKakaoMap: window.kakao.maps가 없습니다.");
            return;
        }

        const container =
            document.getElementById(containerId) ?? containerRef.current;
        if (!container) {
            console.error("❌ useKakaoMap: 컨테이너를 찾을 수 없습니다.", containerId);
            return;
        }
        
        console.log("✅ useKakaoMap: 컨테이너 찾음, 맵 초기화 시작");

        const init = (lat: number, lng: number) => {
            try {
                console.log("🗺️ useKakaoMap: 맵 생성 시작", { lat, lng });
                const center = new window.kakao.maps.LatLng(lat, lng);
                const newMap = new window.kakao.maps.Map(container, { center, level: 5 });
                mapRef.current = newMap;
                
                // 맵이 생성된 후 relayout 호출하여 렌더링 보장
                setTimeout(() => {
                    if (newMap && container) {
                        newMap.relayout();
                        console.log("✅ useKakaoMap: 맵 relayout 완료");
                    }
                }, 100);
                
                setMap(newMap); // 상태 업데이트로 리렌더링 트리거
                console.log("✅ useKakaoMap: 맵 생성 완료", {
                    containerWidth: container.offsetWidth,
                    containerHeight: container.offsetHeight,
                    containerId
                });

                const clusterer = new window.kakao.maps.MarkerClusterer({
                    map: newMap,
                    averageCenter: true,
                    minLevel: 1,            // 필요 시 조정 (클러스터가 언제 풀릴지)
                    disableClickZoom: true, // 🔴 자동 줌 해제 → clusterclick을 우리가 처리
                    calculator: [10, 30, 50],
                    styles: [
                        {
                            width: "40px",
                            height: "40px",
                            background: "rgba(29,78,216,0.92)",
                            borderRadius: "20px",
                            color: "#fff",
                            textAlign: "center",
                            lineHeight: "40px",
                            fontWeight: "700",
                            boxShadow: "0 2px 6px rgba(0,0,0,.25)",
                        },
                    ],
                });
                clustererRef.current = clusterer;
                console.log("✅ useKakaoMap: 클러스터러 생성 완료");
            } catch (error) {
                console.error("❌ useKakaoMap: 맵 초기화 실패", error);
            }
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => init(pos.coords.latitude, pos.coords.longitude),
                () => init(37.497942, 127.027621)
            );
        } else {
            init(37.497942, 127.027621);
        }

        return () => {
            clearAll();
            mapRef.current = null;
            setMap(null); // 상태 초기화
            clustererRef.current = null;
            infoWindowRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoaded, containerId]);

    const clearAll = () => {
        // 클러스터러 내부 마커 제거
        clustererRef.current?.clear();
        // 개별 마커 인스턴스들도 지도에서 제거(안전)
        markersRef.current.forEach((m) => m?.setMap?.(null));
        markersRef.current = [];
        // 인포윈도우 닫기
        if (infoWindowRef.current) {
            infoWindowRef.current.close();
        }
    };

    // 매물 타입별 마커 색상 매핑
    const getMarkerColorByType = (propertyType: string | undefined): string => {
        if (!propertyType) return "#3B82F6"; // 기본 파란색
        
        const type = propertyType.toLowerCase();
        
        // 아파트: 파란색
        if (type.includes("아파트") || type === "아파트") {
            return "#3B82F6"; // 파란색
        }
        
        // 오피스텔: 초록색
        if (type.includes("오피스텔")) {
            return "#10B981"; // 초록색
        }
        
        // 상가: 주황색
        if (type.includes("상가") || type.includes("근린생활") || type.includes("업무시설") || 
            type.includes("빌딩") || type.includes("의료시설") || type.includes("공장") || 
            type.includes("창고") || type.includes("숙박") || type.includes("지식산업센터")) {
            return "#F97316"; // 주황색
        }
        
        // 공동주택: 노란색
        if (type.includes("공동주택") || type.includes("다세대") || type.includes("연립") || 
            type.includes("도시생활주택")) {
            return "#FBBF24"; // 노란색
        }
        
        // 단독주택: 보라색
        if (type.includes("단독주택") || type.includes("다가구") || type.includes("다중주택")) {
            return "#A855F7"; // 보라색
        }
        
        // 건물: 회색
        if (type.includes("건물")) {
            return "#6B7280"; // 회색
        }
        
        // 토지: 갈색
        if (type.includes("토지")) {
            return "#92400E"; // 갈색
        }
        
        // 기본값: 파란색
        return "#3B82F6";
    };

    // SVG 마커 이미지 생성 (data URL 사용)
    const createMarkerImage = (color: string, isSelected: boolean = false): unknown => {
        // 선택된 마커는 더 크게, 가운데 원 안에 파란색 점 추가
        const width = isSelected ? 28 : 24;
        const height = isSelected ? 41 : 35;
        const strokeWidth = 1.5;
        const circleRadius = isSelected ? 6 : 5;
        const viewBox = isSelected ? "0 0 28 41" : "0 0 24 35";
        const centerX = isSelected ? 14 : 12;
        
        // 선택된 마커는 크기와 그림자 효과, 가운데 파란색 점으로 구분
        const svg = isSelected 
            ? `<svg width="${width}" height="${height}" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <filter id="shadow-${color.replace('#', '')}" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
                    </filter>
                </defs>
                <path d="M${centerX} 0C6.265 0 0 6.265 0 ${centerX}c0 9.917 ${centerX} 27.083 ${centerX} 27.083S${width} ${centerX + 9.917} ${width} ${centerX}C${width} 6.265 ${width - 6.265} 0 ${centerX} 0z" 
                      fill="${color}" 
                      stroke="#FFFFFF" 
                      stroke-width="${strokeWidth}"
                      filter="url(#shadow-${color.replace('#', '')})"/>
                <circle cx="${centerX}" cy="${centerX}" r="${circleRadius}" fill="#FFFFFF"/>
                <circle cx="${centerX}" cy="${centerX}" r="3" fill="#3B82F6"/>
            </svg>`
            : `<svg width="${width}" height="${height}" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0C5.373 0 0 5.373 0 12c0 8.5 12 23 12 23s12-14.5 12-23C24 5.373 18.627 0 12 0z" 
                      fill="${color}" 
                      stroke="#FFFFFF" 
                      stroke-width="${strokeWidth}"/>
                <circle cx="12" cy="12" r="${circleRadius}" fill="#FFFFFF"/>
            </svg>`;
        
        // SVG를 data URL로 변환
        const encodedSvg = encodeURIComponent(svg);
        const dataUrl = `data:image/svg+xml;charset=utf-8,${encodedSvg}`;
        
        const imageSize = new window.kakao.maps.Size(width, height);
        const imageOption = { offset: new window.kakao.maps.Point(width / 2, height) };
        
        return new window.kakao.maps.MarkerImage(dataUrl, imageSize, imageOption);
    };

    const placeMarkersByProperties = (
        properties: Property[],
        onMarkerClick?: (group: Property[]) => void,
        onClusterClick?: (group: Property[]) => void,
        selectedPropertyIds: string[] = []
    ) => {
        const map = mapRef.current;
        const clusterer = clustererRef.current;
        if (!map || !clusterer) return;

        // 클러스터러에 추가 속성을 저장하기 위한 타입 정의
        interface ClustererWithFlags {
            __clusterClickBound?: boolean;
            __selectedClusterInfo?: { propertyIds: string[]; center?: { lat: number; lng: number } | null };
            __clusterReapplyStyleBound?: boolean;
            __clusterStyleInterval?: NodeJS.Timeout;
            __clusterAutoStyleBound?: boolean;
            __clusterStyleBound?: boolean;
            __selectedClusterPropertyIds?: Set<string>;
        }
        const clustererWithFlags = clusterer as unknown as ClustererWithFlags;

        clearAll();

        const ms: Array<{
            setMap: (map: unknown) => void;
        }> = [];

        for (const p of properties) {
            const lat = Number(p.data?.latitude);
            const lng = Number(p.data?.longitude);
            if (isNaN(lat) || isNaN(lng)) continue;

            const pos = new window.kakao.maps.LatLng(lat, lng);
            
            // 매물 타입에 따른 마커 색상 결정
            const propertyType = p.data?.type || p.property_type;
            const markerColor = getMarkerColorByType(propertyType);
            
            // 선택된 매물인지 확인
            const isSelected = selectedPropertyIds.includes(String(p.id));
            const markerImage = createMarkerImage(markerColor, isSelected);
            
            const marker = new window.kakao.maps.Marker({ 
                position: pos,
                image: markerImage,
                zIndex: isSelected ? 1000 : 1 // 선택된 마커를 위에 표시
            });

            // 역참조 보관
            (marker as unknown as { __property: Property }).__property = p;

            // 개별 마커 클릭(클러스터가 풀린 상태에서만 발생)
            if (onMarkerClick) {
                window.kakao.maps.event.addListener(marker, "click", () => {
                    onMarkerClick([p]);
                });
            }

            ms.push(marker);
        }

        // 마커는 map에 직접 올리지 않고, 클러스터러에만 추가
        clusterer.addMarkers(ms);
        markersRef.current = ms;

        // 선택된 매물이 포함된 클러스터 스타일 변경 함수
        const updateClusterStyle = (cluster: { 
            getMarkers: () => Array<{ __property?: Property }>; 
            setStyles?: (styles: unknown) => void;
            getElement?: () => HTMLElement | null;
            getCenter?: () => unknown;
        }, clickedPropertyIds?: string[]) => {
            try {
                console.log('=== 클러스터 스타일 업데이트 시작 ===');
                console.log('클러스터 객체:', cluster);
                console.log('클러스터 객체의 키들:', Object.keys(cluster));
                
                const markers = cluster.getMarkers();
                console.log('클러스터에 포함된 마커 수:', markers.length);
                
                // 클릭한 매물 ID 목록이 있으면 그것을 사용, 없으면 기존 selectedPropertyIds 사용
                const idsToCheck = clickedPropertyIds || selectedPropertyIds;
                
                const hasSelected = markers.some((m) => {
                    const prop = m.__property;
                    return prop && idsToCheck.includes(String(prop.id));
                });
                
                console.log('선택된 매물이 포함되어 있는가:', hasSelected);
                console.log('확인할 매물 ID 목록:', idsToCheck);

                // 클러스터 요소 가져오기 (여러 방법 시도)
                let element = null;
                
                // 방법 1: getElement() 메서드 사용
                if (typeof cluster.getElement === 'function') {
                    try {
                        element = cluster.getElement();
                        console.log('getElement()로 찾은 요소:', element);
                    } catch (e) {
                        console.log('getElement() 오류:', e);
                    }
                } else {
                    console.log('getElement() 메서드가 없습니다');
                }
                
                // 방법 2: 내부 속성 확인 (특히 _clusterMarker)
                if (!element) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const clusterAny = cluster as any;
                    console.log('내부 속성 확인:', {
                        _element: clusterAny._element,
                        element: clusterAny.element,
                        el: clusterAny.el,
                        $element: clusterAny.$element,
                        _clusterMarker: clusterAny._clusterMarker
                    });
                    
                    // _clusterMarker가 있으면 그 안의 요소 확인
                    if (clusterAny._clusterMarker) {
                        console.log('_clusterMarker 객체:', clusterAny._clusterMarker);
                        console.log('_clusterMarker의 키들:', Object.keys(clusterAny._clusterMarker || {}));
                        
                        // _clusterMarker에서 요소 찾기 (a 속성이 DOM 요소일 수 있음)
                        if (clusterAny._clusterMarker.a && clusterAny._clusterMarker.a.nodeName) {
                            element = clusterAny._clusterMarker.a;
                            console.log('_clusterMarker.a로 찾은 요소:', element);
                        }
                        if (clusterAny._clusterMarker?.getElement) {
                            element = clusterAny._clusterMarker.getElement();
                            console.log('_clusterMarker.getElement()로 찾은 요소:', element);
                        } else if (clusterAny._clusterMarker?._element) {
                            element = clusterAny._clusterMarker._element;
                            console.log('_clusterMarker._element로 찾은 요소:', element);
                        }
                    }
                    
                    element = element || clusterAny._element || clusterAny.element || clusterAny.el || clusterAny.$element;
                    console.log('내부 속성으로 찾은 요소:', element);
                }
                
                // 방법 3: 클러스터의 위치를 이용해 DOM에서 찾기
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const clusterAnyForCenter = cluster as any;
                if (!element && clusterAnyForCenter.getCenter) {
                    try {
                        const center = clusterAnyForCenter.getCenter();
                        const mapContainer = document.getElementById(containerId) ?? containerRef.current;
                        if (mapContainer && center && mapRef.current) {
                            // 지도 좌표를 화면 좌표로 변환
                            const projection = mapRef.current.getProjection();
                            const pixel = projection.pointFromCoords(center);
                            
                            // 해당 위치의 요소 찾기
                            const allDivs = mapContainer.querySelectorAll('div');
                            allDivs.forEach((div: Element) => {
                                const el = div as HTMLElement;
                                const text = el.textContent?.trim() || '';
                                const style = el.style;
                                
                                // 클러스터로 보이는 요소
                                if (/^\d+$/.test(text) && 
                                    (style.borderRadius === '20px' || style.borderRadius === '22px')) {
                                    const rect = el.getBoundingClientRect();
                                    const mapRect = mapContainer.getBoundingClientRect();
                                    
                                    // 위치 비교 (근사치)
                                    const elX = rect.left + rect.width / 2 - mapRect.left;
                                    const elY = rect.top + rect.height / 2 - mapRect.top;
                                    const clusterX = pixel.x;
                                    const clusterY = pixel.y;
                                    
                                    // 거리가 가까우면 해당 요소로 간주
                                    const distance = Math.sqrt(
                                        Math.pow(elX - clusterX, 2) + Math.pow(elY - clusterY, 2)
                                    );
                                    
                                    if (distance < 50) { // 50픽셀 이내
                                        element = el;
                                    }
                                }
                            });
                        }
                        } catch {
                            // 무시
                        }
                }

                if (element) {
                    console.log('요소를 찾았습니다:', element);
                    console.log('요소의 현재 스타일:', {
                        background: element.style.background,
                        border: element.style.border,
                        width: element.style.width,
                        height: element.style.height
                    });
                    
                    if (hasSelected) {
                        console.log('선택된 클러스터 스타일 적용');
                        
                        // data 속성과 클래스 추가
                        element.setAttribute('data-selected-cluster', 'true');
                        element.classList.add('selected-cluster');
                        
                        // 기존 스타일 유지하면서 선택된 클러스터 스타일 적용
                        const existingLeft = element.style.left || '';
                        const existingTop = element.style.top || '';
                        const existingPosition = element.style.position || 'absolute';
                        const existingZIndex = element.style.zIndex || '0';
                        const existingMargin = element.style.margin || '';
                        const existingWhiteSpace = element.style.whiteSpace || 'nowrap';
                        const existingCursor = element.style.cursor || 'pointer';
                        const existingColor = element.style.color || 'rgb(255, 255, 255)';
                        // const existingTextAlign = element.style.textAlign || 'center'; // TODO: 사용 예정
                        
                        // cssText로 모든 스타일을 한 번에 덮어쓰기
                        element.style.cssText = `
                            position: ${existingPosition} !important;
                            z-index: ${existingZIndex} !important;
                            white-space: ${existingWhiteSpace} !important;
                            margin: ${existingMargin || '-20px 0px 0px -20px'} !important;
                            ${existingLeft ? `left: ${existingLeft} !important;` : ''}
                            ${existingTop ? `top: ${existingTop} !important;` : ''}
                            box-sizing: border-box !important;
                            display: flex !important;
                            align-items: center !important;
                            justify-content: center !important;
                            background: rgba(96, 165, 250, 0.92) !important;
                            border: 3px solid #1e40af !important;
                            width: 40px !important;
                            height: 40px !important;
                            border-radius: 20px !important;
                            color: ${existingColor} !important;
                            text-align: center !important;
                            line-height: 1 !important;
                            font-weight: 800 !important;
                            box-shadow: 0 2px 6px rgba(0,0,0,.25) !important;
                            cursor: ${existingCursor} !important;
                            padding: 0 !important;
                        `.trim();
                        
                        // 추가로 setProperty도 사용하여 확실하게 적용
                        element.style.setProperty('box-sizing', 'border-box', 'important');
                        element.style.setProperty('display', 'flex', 'important');
                        element.style.setProperty('align-items', 'center', 'important');
                        element.style.setProperty('justify-content', 'center', 'important');
                        element.style.setProperty('background', 'rgba(96, 165, 250, 0.92)', 'important');
                        element.style.setProperty('border', '3px solid #1e40af', 'important');
                        element.style.setProperty('width', '40px', 'important');
                        element.style.setProperty('height', '40px', 'important');
                        element.style.setProperty('border-radius', '20px', 'important');
                        element.style.setProperty('text-align', 'center', 'important');
                        element.style.setProperty('line-height', '1', 'important');
                        element.style.setProperty('box-shadow', '0 2px 6px rgba(0,0,0,.25)', 'important');
                        element.style.setProperty('font-weight', '800', 'important');
                        element.style.setProperty('padding', '0', 'important');
                        
                        console.log('스타일 적용 후:', {
                            background: element.style.background,
                            border: element.style.border,
                            width: element.style.width,
                            height: element.style.height,
                            computedBackground: window.getComputedStyle(element).background
                        });
                    } else {
                        // 선택되지 않은 클러스터는 data 속성과 클래스 제거
                        element.removeAttribute('data-selected-cluster');
                        element.classList.remove('selected-cluster');
                    }
                } else {
                    console.warn('클러스터 요소를 찾을 수 없습니다');
                    console.log('클러스터 객체 전체:', JSON.stringify(cluster, null, 2));
                }
                console.log('=== 클러스터 스타일 업데이트 종료 ===');
            } catch (e) {
                console.error('클러스터 스타일 업데이트 오류:', e);
                if (e instanceof Error) {
                    console.error('스택 트레이스:', e.stack);
                }
            }
        };

        // 선택된 클러스터를 추적하기 위한 Set
        const selectedClusterElements = new Set<HTMLElement>();
        // 선택된 클러스터의 매물 ID를 저장 (클러스터 재생성 시 사용)
        const selectedClusterPropertyIds = clustererWithFlags.__selectedClusterPropertyIds || new Set<string>();
        clustererWithFlags.__selectedClusterPropertyIds = selectedClusterPropertyIds;

        // 클러스터 생성 후 자동으로 선택된 클러스터 스타일 업데이트
        if (!clustererWithFlags.__clusterStyleBound) {
            const updateAllClusterStyles = () => {
                if (selectedPropertyIds.length === 0 && selectedClusterPropertyIds.size === 0) {
                    // 선택된 매물이 없으면 모든 클러스터를 일반 스타일로 복원
                    const mapContainer = document.getElementById(containerId) ?? containerRef.current;
                    if (mapContainer) {
                        const allSelectedClusters = mapContainer.querySelectorAll('[data-selected-cluster="true"]');
                        allSelectedClusters.forEach((el) => {
                            const htmlEl = el as HTMLElement;
                            htmlEl.removeAttribute('data-selected-cluster');
                            htmlEl.classList.remove('selected-cluster');
                            htmlEl.style.background = "rgba(29,78,216,0.92)";
                            htmlEl.style.border = "none";
                            htmlEl.style.width = "40px";
                            htmlEl.style.height = "40px";
                            htmlEl.style.borderRadius = "20px";
                            htmlEl.style.lineHeight = "40px";
                            htmlEl.style.boxShadow = "0 2px 6px rgba(0,0,0,.25)";
                            htmlEl.style.fontWeight = "700";
                        });
                    }
                    selectedClusterElements.clear();
                    selectedClusterPropertyIds.clear();
                    return;
                }

                // 선택된 매물 ID Set 생성
                const selectedIdsSet = new Set(selectedPropertyIds.map(id => String(id)));
                // 저장된 클러스터 매물 ID도 포함
                selectedClusterPropertyIds.forEach(id => selectedIdsSet.add(id));

                // 지도에서 모든 클러스터 요소 찾기
                const mapContainer = document.getElementById(containerId) ?? containerRef.current;
                if (!mapContainer) return;

                // 모든 클러스터 요소 확인
                const allDivs = mapContainer.querySelectorAll('div');
                const currentSelectedElements = new Set<HTMLElement>();

                allDivs.forEach((div: Element) => {
                    const el = div as HTMLElement;
                    const text = el.textContent?.trim() || '';
                    const computedStyle = window.getComputedStyle(el);
                    const inlineStyle = el.style;
                    
                    // 클러스터로 보이는 요소 확인 (숫자 텍스트 + 원형)
                    if (/^\d+$/.test(text) && 
                        (computedStyle.borderRadius === '20px' || computedStyle.borderRadius === '22px' || 
                         inlineStyle.borderRadius === '20px' || inlineStyle.borderRadius === '22px')) {
                        
                        // 클러스터의 위치를 가져와서 해당 위치 근처의 마커 확인
                        const rect = el.getBoundingClientRect();
                        const mapRect = mapContainer.getBoundingClientRect();
                        const centerX = rect.left + rect.width / 2 - mapRect.left;
                        const centerY = rect.top + rect.height / 2 - mapRect.top;
                        
                        // 클러스터 중심점에서 가까운 마커 확인
                        const markers = clustererRef.current?.getMarkers() || [];
                        let hasSelectedProperty = false;
                        
                        for (const marker of markers) {
                            const prop = (marker as unknown as { __property?: Property }).__property;
                            if (prop && selectedIdsSet.has(String(prop.id))) {
                                const markerTyped = marker as { getPosition: () => unknown };
                                const markerPos = markerTyped.getPosition();
                                const projection = mapRef.current?.getProjection();
                                if (projection) {
                                    // 지도 좌표를 화면 좌표(픽셀)로 변환
                                    const markerPoint = projection.pointFromCoords(markerPos);
                                    const markerScreenX = markerPoint.x;
                                    const markerScreenY = markerPoint.y;
                                    
                                    // 화면 좌표로 거리 계산
                                    const distance = Math.sqrt(
                                        Math.pow(centerX - markerScreenX, 2) + 
                                        Math.pow(centerY - markerScreenY, 2)
                                    );
                                    
                                    // 클러스터 반경 내에 선택된 매물이 있으면 선택된 클러스터로 표시
                                    if (distance < 50) { // 50픽셀 반경
                                        hasSelectedProperty = true;
                                        break;
                                    }
                                }
                            }
                        }
                        
                        if (hasSelectedProperty) {
                            currentSelectedElements.add(el);
                            
                            // data 속성과 클래스 추가
                            el.setAttribute('data-selected-cluster', 'true');
                            el.classList.add('selected-cluster');
                            
                            // 기존 스타일 유지하면서 선택된 클러스터 스타일 적용
                            const existingLeft = inlineStyle.left || '';
                            const existingTop = inlineStyle.top || '';
                            const existingPosition = inlineStyle.position || computedStyle.position || 'absolute';
                            const existingZIndex = inlineStyle.zIndex || computedStyle.zIndex || '0';
                            const existingMargin = inlineStyle.margin || computedStyle.margin || '';
                            const existingWhiteSpace = inlineStyle.whiteSpace || computedStyle.whiteSpace || 'nowrap';
                            const existingCursor = inlineStyle.cursor || computedStyle.cursor || 'pointer';
                            const existingColor = inlineStyle.color || computedStyle.color || 'rgb(255, 255, 255)';
                            // const existingTextAlign = inlineStyle.textAlign || computedStyle.textAlign || 'center'; // TODO: 사용 예정
                            
                            // cssText로 모든 스타일을 한 번에 덮어쓰기
                            el.style.cssText = `
                                position: ${existingPosition} !important;
                                z-index: ${existingZIndex} !important;
                                white-space: ${existingWhiteSpace} !important;
                                margin: ${existingMargin || '-20px 0px 0px -20px'} !important;
                                ${existingLeft ? `left: ${existingLeft} !important;` : ''}
                                ${existingTop ? `top: ${existingTop} !important;` : ''}
                                box-sizing: border-box !important;
                                display: flex !important;
                                align-items: center !important;
                                justify-content: center !important;
                                background: rgba(96, 165, 250, 0.92) !important;
                                border: 3px solid #1e40af !important;
                                width: 40px !important;
                                height: 40px !important;
                                border-radius: 20px !important;
                                color: ${existingColor} !important;
                                text-align: center !important;
                                line-height: 1 !important;
                                font-weight: 800 !important;
                                box-shadow: 0 2px 6px rgba(0,0,0,.25) !important;
                                cursor: ${existingCursor} !important;
                                padding: 0 !important;
                            `.trim();
                            
                            // 추가로 setProperty도 사용하여 확실하게 적용
                            el.style.setProperty('box-sizing', 'border-box', 'important');
                            el.style.setProperty('display', 'flex', 'important');
                            el.style.setProperty('align-items', 'center', 'important');
                            el.style.setProperty('justify-content', 'center', 'important');
                            el.style.setProperty('background', 'rgba(96, 165, 250, 0.92)', 'important');
                            el.style.setProperty('border', '3px solid #1e40af', 'important');
                            el.style.setProperty('width', '40px', 'important');
                            el.style.setProperty('height', '40px', 'important');
                            el.style.setProperty('border-radius', '20px', 'important');
                            el.style.setProperty('text-align', 'center', 'important');
                            el.style.setProperty('line-height', '1', 'important');
                            el.style.setProperty('box-shadow', '0 2px 6px rgba(0,0,0,.25)', 'important');
                            el.style.setProperty('font-weight', '800', 'important');
                            el.style.setProperty('padding', '0', 'important');
                        } else {
                            // 선택되지 않은 클러스터는 일반 스타일로 복원
                            el.removeAttribute('data-selected-cluster');
                            el.classList.remove('selected-cluster');
                            const bgColor = computedStyle.backgroundColor || inlineStyle.background || '';
                            if (bgColor.includes('220') || bgColor.includes('38')) {
                                el.style.background = "rgba(29,78,216,0.92)";
                                el.style.border = "none";
                                el.style.width = "40px";
                                el.style.height = "40px";
                                el.style.borderRadius = "20px";
                                el.style.lineHeight = "40px";
                                el.style.boxShadow = "0 2px 6px rgba(0,0,0,.25)";
                                el.style.fontWeight = "700";
                            }
                        }
                    }
                });

                // 이전에 선택된 클러스터 중 현재 선택되지 않은 것들은 일반 스타일로 복원
                selectedClusterElements.forEach((el) => {
                    if (!currentSelectedElements.has(el)) {
                        el.removeAttribute('data-selected-cluster');
                        el.classList.remove('selected-cluster');
                        el.style.background = "rgba(29,78,216,0.92)";
                        el.style.border = "none";
                        el.style.width = "40px";
                        el.style.height = "40px";
                        el.style.borderRadius = "20px";
                        el.style.lineHeight = "40px";
                        el.style.boxShadow = "0 2px 6px rgba(0,0,0,.25)";
                        el.style.fontWeight = "700";
                    }
                });

                selectedClusterElements.clear();
                currentSelectedElements.forEach((el) => selectedClusterElements.add(el));
            };

            window.kakao.maps.event.addListener(clusterer, "clustered", () => {
                // 클러스터 생성 후 약간의 지연을 두고 확인
                setTimeout(updateAllClusterStyles, 100);
            });
            clustererWithFlags.__clusterStyleBound = true;
        }

        // 클러스터 클릭 시 스타일 업데이트 및 매물 반환
        
        if (!clustererWithFlags.__clusterClickBound) {
            window.kakao.maps.event.addListener(clusterer, "clusterclick", (...args: unknown[]) => {
                const cluster = args[0] as { 
                    getMarkers: () => Array<{ __property?: Property }>; 
                    getCenter?: () => unknown;
                };
                console.log('클러스터 클릭 이벤트 발생');
                
                // 먼저 클러스터에 포함된 매물 ID 추출
                const included = cluster.getMarkers();
                const props: Property[] = [];
                const clickedPropertyIds: string[] = [];
                
                for (const m of included) {
                    const prop = m.__property;
                    if (prop) {
                        props.push(prop);
                        clickedPropertyIds.push(String(prop.id));
                    }
                }
                
                console.log('클릭한 클러스터의 매물 ID들:', clickedPropertyIds);
                
                // 이전에 선택된 모든 클러스터를 일반 스타일로 복원
                const mapContainer = document.getElementById(containerId) ?? containerRef.current;
                if (mapContainer) {
                    const allSelectedClusters = mapContainer.querySelectorAll('[data-selected-cluster="true"]');
                    allSelectedClusters.forEach((el) => {
                        const htmlEl = el as HTMLElement;
                        htmlEl.removeAttribute('data-selected-cluster');
                        htmlEl.classList.remove('selected-cluster');
                        htmlEl.style.background = "rgba(29,78,216,0.92)";
                        htmlEl.style.border = "none";
                        htmlEl.style.width = "40px";
                        htmlEl.style.height = "40px";
                        htmlEl.style.borderRadius = "20px";
                        htmlEl.style.lineHeight = "40px";
                        htmlEl.style.boxShadow = "0 2px 6px rgba(0,0,0,.25)";
                        htmlEl.style.fontWeight = "700";
                    });
                }
                
                // 이전 선택 정보 초기화
                selectedClusterElements.clear();
                selectedClusterPropertyIds.clear();
                
                // 클릭한 클러스터의 매물 ID를 저장 (클러스터 재생성 시 사용)
                clickedPropertyIds.forEach(id => selectedClusterPropertyIds.add(id));
                
                // 클릭한 클러스터의 매물 ID를 사용하여 스타일 업데이트
                updateClusterStyle(cluster, clickedPropertyIds);
                
                // 선택된 클러스터 정보 저장 (재생성 후 스타일 적용을 위해)
                const center = cluster.getCenter?.() as { getLat: () => number; getLng: () => number } | undefined;
                clustererWithFlags.__selectedClusterInfo = {
                    propertyIds: clickedPropertyIds,
                    center: center ? { lat: center.getLat(), lng: center.getLng() } : null
                };
                
                // 포함된 매물 반환 (상태 업데이트)
                if (onClusterClick) {
                    onClusterClick(props);
                }
            });
            clustererWithFlags.__clusterClickBound = true;
        }
        
        // 클러스터 재생성 후 선택된 클러스터 스타일 다시 적용
        if (!clustererWithFlags.__clusterReapplyStyleBound) {
            const reapplySelectedClusterStyle = () => {
                const selectedInfo = clustererWithFlags.__selectedClusterInfo;
                if (!selectedInfo || !selectedInfo.propertyIds || selectedInfo.propertyIds.length === 0) {
                    return;
                }
                
                // 선택된 매물 ID가 현재 selectedPropertyIds에 포함되어 있는지 확인
                const hasSelected = selectedInfo.propertyIds.some((id: string) => 
                    selectedPropertyIds.includes(id)
                );
                
                if (!hasSelected || !selectedInfo.center || !mapRef.current) {
                    return;
                }
                
                const mapContainer = document.getElementById(containerId) ?? containerRef.current;
                if (!mapContainer) return;
                
                // 선택된 클러스터의 위치를 화면 좌표로 변환
                const projection = mapRef.current.getProjection();
                const clusterCenter = new window.kakao.maps.LatLng(
                    selectedInfo.center.lat, 
                    selectedInfo.center.lng
                );
                const pixel = projection.pointFromCoords(clusterCenter);
                
                // 모든 클러스터 요소 찾기
                const allDivs = mapContainer.querySelectorAll('div');
                let foundSelectedCluster = false;
                
                allDivs.forEach((div: Element) => {
                    const el = div as HTMLElement;
                    const text = el.textContent?.trim() || '';
                    const style = el.style;
                    const computedStyle = window.getComputedStyle(el);
                    const inlineStyle = el.style;
                    
                    // 클러스터로 보이는 요소 확인
                    if (/^\d+$/.test(text) && 
                        (style.borderRadius === '20px' || style.borderRadius === '22px' || 
                         style.borderRadius.includes('22px'))) {
                        
                        // 클러스터 요소의 위치 확인
                        const rect = el.getBoundingClientRect();
                        const mapRect = mapContainer.getBoundingClientRect();
                        const elX = rect.left + rect.width / 2 - mapRect.left;
                        const elY = rect.top + rect.height / 2 - mapRect.top;
                        
                        // 거리가 가까우면 선택된 클러스터로 간주
                        const distance = Math.sqrt(
                            Math.pow(elX - pixel.x, 2) + Math.pow(elY - pixel.y, 2)
                        );
                        
                        if (distance < 50) { // 50픽셀 이내
                            foundSelectedCluster = true;
                            console.log('선택된 클러스터 찾음, 스타일 적용:', el);
                            
                            // data 속성 추가로 선택된 클러스터 표시
                            el.setAttribute('data-selected-cluster', 'true');
                            
                            // 클래스를 추가하여 CSS로도 스타일 적용 가능하도록
                            el.classList.add('selected-cluster');
                            
                            // 인라인 스타일 직접 설정 (카카오맵이 덮어쓸 수 있으므로 강제로 적용)
                            el.style.cssText = `
                                position: absolute !important;
                                z-index: 0 !important;
                                white-space: nowrap !important;
                                margin: -20px 0px 0px -20px !important;
                                box-sizing: border-box !important;
                                display: flex !important;
                                align-items: center !important;
                                justify-content: center !important;
                                background: rgba(96, 165, 250, 0.92) !important;
                                border: 3px solid #1e40af !important;
                                width: 40px !important;
                                height: 40px !important;
                                border-radius: 20px !important;
                                color: rgb(255, 255, 255) !important;
                                text-align: center !important;
                                line-height: 1 !important;
                                font-weight: 800 !important;
                                box-shadow: 0 2px 6px rgba(0,0,0,.25) !important;
                                cursor: pointer !important;
                                padding: 0 !important;
                            `;
                            
                            // 추가로 setProperty도 사용하여 확실하게 적용
                            el.style.setProperty('box-sizing', 'border-box', 'important');
                            el.style.setProperty('display', 'flex', 'important');
                            el.style.setProperty('align-items', 'center', 'important');
                            el.style.setProperty('justify-content', 'center', 'important');
                            el.style.setProperty('background', 'rgba(96, 165, 250, 0.92)', 'important');
                            el.style.setProperty('border', '3px solid #1e40af', 'important');
                            el.style.setProperty('width', '40px', 'important');
                            el.style.setProperty('height', '40px', 'important');
                            el.style.setProperty('border-radius', '20px', 'important');
                            el.style.setProperty('text-align', 'center', 'important');
                            el.style.setProperty('line-height', '1', 'important');
                            el.style.setProperty('box-shadow', '0 2px 6px rgba(0,0,0,.25)', 'important');
                            el.style.setProperty('font-weight', '800', 'important');
                            el.style.setProperty('padding', '0', 'important');
                            
                            console.log('스타일 적용 후 확인:', {
                                background: el.style.background,
                                border: el.style.border,
                                width: el.style.width,
                                height: el.style.height,
                                computedStyle: window.getComputedStyle(el).background
                            });
                        } else {
                            // 선택되지 않은 클러스터는 data 속성 제거 및 일반 스타일로 복원
                            el.removeAttribute('data-selected-cluster');
                            el.classList.remove('selected-cluster');
                            const bgColor = computedStyle.backgroundColor || inlineStyle.background || '';
                            if (bgColor.includes('220') || bgColor.includes('38')) {
                                el.style.background = "rgba(29,78,216,0.92)";
                                el.style.border = "none";
                                el.style.width = "40px";
                                el.style.height = "40px";
                                el.style.borderRadius = "20px";
                                el.style.lineHeight = "40px";
                                el.style.boxShadow = "0 2px 6px rgba(0,0,0,.25)";
                                el.style.fontWeight = "700";
                            }
                        }
                    }
                });
            };
            
            window.kakao.maps.event.addListener(clusterer, "clustered", () => {
                console.log('클러스터 재생성 이벤트 발생, 스타일 재적용 시도');
                // 여러 번 시도하여 확실하게 적용
                setTimeout(() => {
                    console.log('첫 번째 스타일 재적용 시도');
                    reapplySelectedClusterStyle();
                }, 50);
                setTimeout(() => {
                    console.log('두 번째 스타일 재적용 시도');
                    reapplySelectedClusterStyle();
                }, 200);
                setTimeout(() => {
                    console.log('세 번째 스타일 재적용 시도');
                    reapplySelectedClusterStyle();
                }, 500);
            });
            
            // MutationObserver를 사용하여 DOM 변경 감지
            const mapContainer = document.getElementById(containerId) ?? containerRef.current;
            if (mapContainer) {
                const observer = new MutationObserver(() => {
                    // 너무 자주 실행되지 않도록 디바운스
                    const observerWithTimeout = observer as unknown as { __timeout?: NodeJS.Timeout };
                    if (observerWithTimeout.__timeout) {
                        clearTimeout(observerWithTimeout.__timeout);
                    }
                    observerWithTimeout.__timeout = setTimeout(() => {
                        reapplySelectedClusterStyle();
                    }, 100);
                });
                observer.observe(mapContainer, { 
                    childList: true, 
                    subtree: true,
                    attributes: true,
                    attributeFilter: ['style']
                });
            }
            
            // 주기적으로 스타일 확인 (클러스터가 재생성될 수 있으므로)
            const intervalId = setInterval(() => {
                if (clustererWithFlags.__selectedClusterInfo) {
                    reapplySelectedClusterStyle();
                }
            }, 1000);
            
            // cleanup 함수에 interval 제거 추가 필요 (하지만 여기서는 ref로 관리)
            clustererWithFlags.__clusterReapplyStyleBound = true;
            clustererWithFlags.__clusterStyleInterval = intervalId;
        }

        // 클러스터 생성 후에도 선택된 클러스터 스타일 업데이트 시도
        // 클러스터가 생성될 때마다 모든 클러스터를 확인하여 선택된 매물이 포함된 클러스터 찾기
        if (!clustererWithFlags.__clusterAutoStyleBound) {
            window.kakao.maps.event.addListener(clusterer, "clustered", () => {
                // 클러스터 생성 후 약간의 지연을 두고 모든 클러스터 확인
                setTimeout(() => {
                    const mapContainer = document.getElementById(containerId) ?? containerRef.current;
                    if (!mapContainer) return;

                    // 선택된 매물 ID 목록
                    // const selectedIds = new Set(selectedPropertyIds.map(id => String(id))); // TODO: 선택된 매물 필터링 기능 구현 시 사용

                    // 모든 클러스터 요소 찾기
                    const allDivs = mapContainer.querySelectorAll('div');
                    allDivs.forEach((div: Element) => {
                        const el = div as HTMLElement;
                        const text = el.textContent?.trim() || '';
                        const style = el.style;
                        
                        // 클러스터로 보이는 요소 확인
                        if (/^\d+$/.test(text) && 
                            (style.borderRadius === '20px' || style.borderRadius === '22px') &&
                            (style.width === '40px' || style.width === '44px')) {
                            
                            // 이 클러스터에 선택된 매물이 포함되어 있는지 확인
                            // 클러스터의 마커 정보를 직접 가져올 수 없으므로
                            // 클러스터 클릭 시에만 정확하게 처리됨
                        }
                    });
                }, 100);
            });
            clustererWithFlags.__clusterAutoStyleBound = true;
        }
    };

    // 옵션(debounce) 변화에 따른 기본 중심 표시(선택)
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        if (debouncedLat != null && debouncedLng != null) {
            focusToLatLng(debouncedLat, debouncedLng);
            return;
        }

        if (debouncedCoords && debouncedCoords.length > 0) {
            const [first] = debouncedCoords;
            if (first) focusToLatLng(first.lat, first.lng);
            return;
        }
    }, [debouncedLat, debouncedLng, debouncedCoords]);

    const focusToLatLng = (lat: number, lng: number, title?: string) => {
        const map = mapRef.current;
        if (!map) return;

        const pos = new window.kakao.maps.LatLng(lat, lng);
        map.setCenter(pos);

        if (!infoWindowRef.current) {
            infoWindowRef.current = new window.kakao.maps.InfoWindow({ removable: true });
        }
        infoWindowRef.current.setContent(`
      <div style="padding:8px;font-size:13px;max-width:220px;">
        <strong>${title || "선택한 위치"}</strong><br/>
        (${lat}, ${lng})
      </div>
    `);
        infoWindowRef.current.setPosition(pos);
        infoWindowRef.current.open(map);
    };

    return {
        containerRef,
        map, // state로 관리되는 맵 반환
        clearAll,
        placeMarkersByProperties,
        focusToLatLng,
    };
}

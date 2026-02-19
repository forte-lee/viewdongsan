/**
 * 카카오맵 SDK 전역 타입 정의
 * 여러 파일에서 중복 선언 시 타입 충돌이 발생하므로 한 곳에서만 정의
 */
declare global {
    interface Window {
        kakao: {
            maps: {
                load: (callback: () => void) => void;
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
                CustomOverlay: new (options: Record<string, unknown>) => {
                    setMap: (map: unknown) => void;
                    setContent: (content: string | HTMLElement) => void;
                    setPosition: (position: unknown) => void;
                };
                event: {
                    addListener: (target: unknown, event: string, handler: (...args: unknown[]) => void) => void;
                    removeListener: (target: unknown, event: string, handler: (...args: unknown[]) => void) => void;
                };
            };
        };
    }
}

export {};

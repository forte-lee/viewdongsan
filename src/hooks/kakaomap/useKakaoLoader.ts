import { useEffect, useState } from "react";

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
                event: {
                    addListener: (target: unknown, event: string, handler: (...args: unknown[]) => void) => void;
                    removeListener: (target: unknown, event: string, handler: (...args: unknown[]) => void) => void;
                };
            };
        };
    }
}

export function useKakaoLoader() {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const READY = () =>
            !!(window.kakao?.maps?.services && window.kakao?.maps?.MarkerClusterer);

        const ID = "kakao-maps-sdk";
        const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY;
        const REQUIRED_SRC = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false&libraries=services,clusterer`;

        // 이미 완전히 로드된 경우
        if (READY()) {
            setIsLoaded(true);
            return;
        }

        const existing = document.getElementById(ID) as HTMLScriptElement | null;

        // 이미 스크립트가 있는데 clusterer가 빠져 있으면 교체
        if (existing) {
            const hasClustererInSrc =
                existing.src.includes("libraries=") &&
                existing.src.includes("clusterer");

            if (!hasClustererInSrc) {
                // 잘못 붙은 스크립트 제거 후 재삽입
                existing.parentElement?.removeChild(existing);
                insertScript(); // 올바른 URL로 새로 삽입
            } else {
                // src는 올바른데 아직 초기화 전 → 폴링
                const wait = () => (READY() ? setIsLoaded(true) : setTimeout(wait, 50));
                wait();
            }
            return;
        }

        // 최초 삽입
        insertScript();

        function insertScript() {
            const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY;
            
            if (!apiKey) {
                console.error("❌ 카카오맵 API 키가 설정되지 않았습니다. NEXT_PUBLIC_KAKAO_MAP_API_KEY 환경변수를 확인하세요.");
                return;
            }

            console.log("🔄 카카오맵 스크립트 로드 시작:", {
                apiKey: `${apiKey.substring(0, 10)}...`,
                scriptSrc: REQUIRED_SRC,
                currentHost: window.location.host,
                currentOrigin: window.location.origin
            });

            const script = document.createElement("script");
            script.id = ID;
            script.defer = true;
            script.src = REQUIRED_SRC;

            script.onload = () => {
                console.log("✅ 카카오맵 스크립트 로드 완료");
                
                // autoload=false → 여기서 초기화
                if (!window.kakao) {
                    console.error("❌ window.kakao가 없습니다.");
                    return;
                }
                
                if (!window.kakao.maps) {
                    console.error("❌ window.kakao.maps가 없습니다.");
                    return;
                }
                
                console.log("🔄 카카오맵 초기화 시작...");
                window.kakao.maps.load(() => {
                    console.log("✅ 카카오맵 초기화 완료");
                    if (READY()) {
                        console.log("✅ 카카오맵 준비 완료 (services, clusterer 포함)");
                        setIsLoaded(true);
                    } else {
                        console.error("❌ Kakao Maps loaded, but clusterer is missing.", {
                            hasServices: !!window.kakao?.maps?.services,
                            hasClusterer: !!window.kakao?.maps?.MarkerClusterer,
                            kakao: window.kakao
                        });
                    }
                });
            };

            script.onerror = (event) => {
                const errorInfo = {
                    type: (typeof event === 'object' && event !== null && 'type' in event) ? event.type : "unknown",
                    target: (typeof event === 'object' && event !== null && 'target' in event && event.target) ? {
                        src: (event.target as HTMLScriptElement)?.src,
                        id: (event.target as HTMLScriptElement)?.id
                    } : null,
                    apiKey: apiKey ? `${apiKey.substring(0, 10)}...` : "없음",
                    scriptSrc: REQUIRED_SRC,
                    currentHost: window.location.host,
                    currentOrigin: window.location.origin,
                    protocol: window.location.protocol,
                    message: "카카오 개발자 콘솔에서 플랫폼 설정을 확인하세요.",
                    platformSettings: [
                        `http://${window.location.host}`,
                        `https://${window.location.host}`,
                        `http://localhost:3003`,
                        `http://183.98.94.40:3003`
                    ],
                    troubleshooting: [
                        "1. 카카오 개발자 콘솔(https://developers.kakao.com/) 접속",
                        "2. 내 애플리케이션 > 앱 설정 > 플랫폼 설정",
                        "3. Web 플랫폼에 다음 도메인 추가:",
                        `   - http://${window.location.host}`,
                        `   - http://localhost:3003`,
                        "4. 저장 후 페이지 새로고침"
                    ]
                };
                
                console.error("❌ 카카오맵 스크립트 로드 실패:", errorInfo);
                
                // 네트워크 탭에서 확인할 수 있도록 스크립트 URL 출력
                console.error("📡 시도한 스크립트 URL:", REQUIRED_SRC);
                console.error("🔍 브라우저 네트워크 탭에서 위 URL의 응답을 확인하세요.");
            };

            document.head.appendChild(script);
            console.log("📝 카카오맵 스크립트 태그 추가 완료");
        }
    }, []);

    return isLoaded;
}

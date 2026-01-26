import { useEffect, useState } from "react";

declare global {
    interface Window {
        kakao: any;
    }
}

export function useKakaoLoader() {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const READY = () =>
            !!(window.kakao?.maps?.services && window.kakao?.maps?.MarkerClusterer);

        const ID = "kakao-maps-sdk";
        const REQUIRED_SRC = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY
            }&autoload=false&libraries=services,clusterer`;

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
            const script = document.createElement("script");
            script.id = ID;
            script.defer = true;
            script.src = REQUIRED_SRC;

            script.onload = () => {
                // autoload=false → 여기서 초기화
                window.kakao.maps.load(() => {
                    if (READY()) setIsLoaded(true);
                    else console.error("Kakao Maps loaded, but clusterer is missing.");
                });
            };

            script.onerror = () => {
                console.error("카카오맵 로드 실패");
            };

            document.head.appendChild(script);
        }
    }, []);

    return isLoaded;
}

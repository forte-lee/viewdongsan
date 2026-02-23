import { useEffect, useState, useRef } from "react";
import { supabase } from "@/utils/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { createEmployeeOnSignup } from "../supabase/manager/useCreateEmployeeOnSignup";

export function useAuthCheck() {
    const router = useRouter();
    const pathname = usePathname();
    const [isChecking, setIsChecking] = useState(true); // 로딩 상태
    const [user, setUser] = useState<User | null>(null); // 사용자 상태
    const codeRemovedRef = useRef(false); // code 파라미터 제거 여부 추적

    useEffect(() => {
        let isMounted = true; // 컴포넌트가 마운트되어 있는지 추적

        const checkAuth = async () => {
            setIsChecking(true);
            
            // Supabase가 자동으로 OAuth 콜백을 처리하므로 getSession()만 호출하면 됩니다
            // getSession()이 URL의 code 파라미터를 자동으로 감지하고 세션을 교환합니다
            const { data } = await supabase.auth.getSession();

            if (!isMounted) return; // 컴포넌트가 언마운트되었으면 중단

            // URL에서 code 파라미터 확인
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get("code");

            // OAuth 콜백 중이면 세션을 확인하고 처리
            if (code) {
                console.log("🔄 OAuth 콜백 감지, 세션 확인 중...");
                if (data?.session?.user) {
                    // 세션이 이미 교환되었으면 사용자 정보 설정
                    setUser(data.session.user);
                    console.log("✅ 세션 확인 완료, 사용자 정보 설정");
                    
                    // employee 생성도 여기서 처리 (onAuthStateChange가 트리거되지 않는 경우 대비)
                    try {
                        await createEmployeeOnSignup(data.session.user);
                    } catch (error) {
                        console.error("❌ 회원가입 시 employee 생성 실패:", error);
                    }
                    
                    // URL에서 code 파라미터 제거
                    if (!codeRemovedRef.current) {
                        codeRemovedRef.current = true;
                        const newUrl = new URL(window.location.href);
                        newUrl.searchParams.delete("code");
                        const newPath = newUrl.pathname + newUrl.search;
                        if (newPath !== window.location.pathname + window.location.search) {
                            router.replace(newPath, { scroll: false });
                        }
                    }
                    
                    setIsChecking(false);
                } else {
                    // 세션이 아직 없으면 onAuthStateChange를 기다림
                    console.log("⏳ 세션 대기 중, onAuthStateChange 트리거 대기...");
                    // 타임아웃을 설정하여 onAuthStateChange가 트리거되지 않는 경우 대비
                    setTimeout(() => {
                        if (isMounted && !codeRemovedRef.current) {
                            console.warn("⚠️ onAuthStateChange가 트리거되지 않음, 재시도...");
                            // 재시도: getSession()을 다시 호출
                            supabase.auth.getSession().then(({ data: retryData }) => {
                                if (retryData?.session?.user && isMounted) {
                                    setUser(retryData.session.user);
                                    setIsChecking(false);
                                } else if (isMounted) {
                                    setIsChecking(false);
                                }
                            });
                        }
                    }, 2000);
                }
                return; // onAuthStateChange가 추가로 처리할 수 있도록 함
            }

            if (data?.session?.user) {
                setUser(data.session.user); // 로그인된 사용자 정보 설정
            } else {
                setUser(null);
                // 공개 페이지: 로그인 없이 접근 허용 (링크 공유용)
                const publicPaths = ["/", "/auth", "/auth/callback", "/property-detail", "/property-ad", "/property-main-detail"];
                const isPublicPath = pathname && (publicPaths.includes(pathname) || pathname.startsWith("/auth/"));
                // 관리자 페이지 또는 공개 페이지가 아닌 경우에만 리다이렉트
                if (!pathname?.startsWith("/admin") && !pathname?.startsWith("/auth/callback") && !isPublicPath) {
                    if (pathname !== "/") {
                        router.replace("/"); // 로그인되지 않은 경우 메인 페이지로 이동
                    }
                }
            }
            setIsChecking(false);
        };

        checkAuth();

        // 실시간 상태 업데이트 처리
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!isMounted) return; // 컴포넌트가 언마운트되었으면 중단
            
            console.log("🔄 onAuthStateChange 이벤트:", event, session?.user?.email);
            setIsChecking(true); // 상태 변경 시작 시 로딩 시작
            try {
                if (session?.user) {
                    setUser(session.user); // 사용자 정보 먼저 업데이트 (UI 즉시 반영)

                    // OAuth 콜백 후 URL에서 code 파라미터 제거
                    const urlParams = new URLSearchParams(window.location.search);
                    const code = urlParams.get("code");
                    if (code && !codeRemovedRef.current) {
                        codeRemovedRef.current = true;
                        const newUrl = new URL(window.location.href);
                        newUrl.searchParams.delete("code");
                        const newPath = newUrl.pathname + newUrl.search;
                        if (newPath !== window.location.pathname + window.location.search) {
                            router.replace(newPath, { scroll: false });
                        }
                    }

                    // 🔥 회원가입 시 employee 테이블에 자동 저장 (비동기로 실행, await하지 않음)
                    // 사용자 정보는 이미 설정했으므로 UI는 즉시 업데이트됨
                    // INITIAL_SESSION: OAuth 콜백 후 앱 최초 로드 시 발생 - 신규 가입자도 이 이벤트로 들어올 수 있음
                    const eventType = event as string;
                    if (eventType === "SIGNED_UP" || eventType === "SIGNED_IN" || eventType === "INITIAL_SESSION") {
                        // 백그라운드에서 실행하여 UI 블로킹 방지
                        createEmployeeOnSignup(session.user).catch((error) => {
                            console.error("❌ 회원가입 시 employee 생성 실패:", error);
                            // 에러가 발생해도 로그인은 계속 진행되도록 함
                        });
                    }
                } else {
                    setUser(null);
                    // SIGNED_OUT 이벤트이거나 관리자 페이지가 아닌 경우에만 리다이렉트
                    // 관리자 페이지에서는 useCheckAdminAccess가 권한 체크를 하므로 여기서 리다이렉트하지 않음
                    if (event === "SIGNED_OUT" && !pathname?.startsWith("/admin")) {
                        router.replace("/"); // 로그아웃 시 메인 페이지로 이동
                    }
                }
            } finally {
                // 모든 처리가 완료된 후 로딩 종료 (컴포넌트가 마운트되어 있을 때만)
                // createEmployeeOnSignup을 await하지 않으므로 즉시 실행됨
                if (isMounted) {
                    console.log("✅ onAuthStateChange 완료, isChecking = false");
                    setIsChecking(false);
                }
            }
        });

        return () => {
            isMounted = false; // 컴포넌트 언마운트 시 플래그 설정
            subscription.unsubscribe(); // 구독 해제
        };
    }, [router, pathname]);

    return { isChecking, user };
}

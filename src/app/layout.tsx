"use client";

import { metadata } from "../../matadata";  // ✅ metadata.ts에서 불러오기
import { Inter, Roboto_Mono } from "next/font/google";
import { Noto_Sans_KR } from "next/font/google";
import { Toaster } from "@/components/ui/toast/toaster";
import "@/styles/globals.css";
import "@/styles/main.scss";
import CommonFooter from "@/components/common/footer/CommonFooter";
import CommonHeader from "@/components/common/header/CommonHeader";
import { AuthProvider } from "./context/AuthContext";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui";
import { useSetAtom } from "jotai";
import { guestNewPropertiesAtom } from "@/store/atoms";
import { supabase } from "@/utils/supabase/client";
import { useLoadGuestNewProperties } from "@/hooks/apis";
import LayoutInitializer from "@/components/common/etc/LayoutInitializer";

const NOTO_SANS_KR = Noto_Sans_KR({
  weight: ["400", "700"],
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [isPopup, setIsPopup] = useState(false);

  const setGuestNewMap = useSetAtom(guestNewPropertiesAtom);
  const loadGuestNewProperties = useLoadGuestNewProperties();  
  
  /** 🔥 앱 최초 실행 시 NEW 매물 전체 로드 */
  useEffect(() => {
    loadGuestNewProperties();
  }, []);

  useEffect(() => {
    console.log("📡 Realtime 구독 시작");

    const channel = supabase
      .channel("guest_new_properties")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "guest_new_properties",
        },
        (payload) => {
          console.log("📌 Realtime 이벤트:", payload);

          const { eventType, new: newRow, old: oldRow } = payload;

          // INSERT → 새 매물 알림 추가
          if (eventType === "INSERT" && newRow) {
            setGuestNewMap((prev) => {
              const list = prev[newRow.guestproperty_id] || [];
              return {
                ...prev,
                [newRow.guestproperty_id]: [...list, newRow.property_id],
              };
            });
          }

          // UPDATE → is_read=true → 삭제
          if (eventType === "UPDATE") {
            if (newRow.is_read === true) {
              // 읽음 처리 → 리스트에서 제거
              setGuestNewMap((prev) => {
                const filtered = prev[newRow.guestproperty_id]?.filter(
                  (id) => id !== newRow.property_id
                ) || [];
                
                // ✅ 빈 배열이면 해당 키를 완전히 제거
                const updated = { ...prev };
                if (filtered.length === 0) {
                  delete updated[newRow.guestproperty_id];
                } else {
                  updated[newRow.guestproperty_id] = filtered;
                }
                return updated;
              });
            } else {
              // 🔥 재등록 UPDATE (is_read: false)
              setGuestNewMap((prev) => {
                const list = prev[newRow.guestproperty_id] || [];
                if (!list.includes(newRow.property_id)) {
                  return {
                    ...prev,
                    [newRow.guestproperty_id]: [...list, newRow.property_id],
                  };
                }
                return prev;
              });
            }
          }

          // DELETE → row 삭제되면 NEW에서도 제거
          if (eventType === "DELETE" && oldRow) {
            setGuestNewMap((prev) => {
              const filtered = prev[oldRow.guestproperty_id]?.filter(
                (id) => id !== oldRow.property_id
              ) || [];
              
              // ✅ 빈 배열이면 해당 키를 완전히 제거
              const updated = { ...prev };
              if (filtered.length === 0) {
                delete updated[oldRow.guestproperty_id];
              } else {
                updated[oldRow.guestproperty_id] = filtered;
              }
              return updated;
            });
          }
        }
      )
      .subscribe();

    return () => {
      console.log("❌ Realtime 구독 해제");
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const autoSyncAll = async () => {
      try {
        const userResult = await supabase.auth.getUser();
        const user = userResult.data.user;
        if (!user) return;

        const email = user.user_metadata?.email ?? user.email;
        if (!email) return;

        // 회사 ID 가져오기 (UUID 우선, 폴백으로 이메일 사용)
        let employee = null;
        if (user.id) {
          const result = await supabase
            .from("employee")
            .select("id, company_id")
            .eq("supabase_user_id", user.id)
            .maybeSingle();
          employee = result.data;
        }

        // UUID로 못 찾은 경우 이메일로 찾기 (마이그레이션 지원)
        if (!employee) {
          const result = await supabase
            .from("employee")
            .select("id, company_id")
            .eq("kakao_email", email)
            .maybeSingle();
          employee = result.data;
        }
        
        const companyId = employee?.company_id ?? null;
        const employeeId = employee?.id ?? null;

        // 손님 목록 불러오기
        const { data: guests, error: guestsError } = await supabase
          .from("guest")
          .select("id, employee_id");

        if (guestsError) {
          console.error("❌ 손님 목록 조회 실패:", guestsError);
          return;
        }

        if (!guests) return;

        // employee_id로 필터링
        const myGuests = guests.filter(g => 
          employeeId !== null && g.employee_id === employeeId
        );

        // useSyncGuestNewProperties는 일반 함수이지만 "use"로 시작하므로
        // React Hook 규칙을 피하기 위해 동적 import 사용
        const { useSyncGuestNewProperties: syncGuestNewProperties } = await import("@/hooks/supabase/guestnewproperty/useSyncGuestNewProperties");

        for (const g of myGuests) {
          try {
            await syncGuestNewProperties(g.id, { insert: true, companyId });
          } catch (syncError) {
            console.error(`❌ 매물 동기화 실패 (guestId: ${g.id}):`, syncError);
            // 개별 동기화 실패는 계속 진행
          }
        }
      } catch (error) {
        console.error("❌ autoSyncAll 에러:", error);
        // 에러가 발생해도 앱은 계속 실행되도록 함
      }
    };

    autoSyncAll();
  }, []);


  useEffect(() => {
    setIsPopup(typeof window !== "undefined" && window.opener !== null);
  }, []);

  return (
    <html lang="ko">
      <head>
        {/* ✅ JSX 표현식으로 감싸서 오류 해결 */}
        <title>{String(metadata.title)}</title>
        <meta name="description" content={String(metadata.description)} />
      </head>
      <body className={`${NOTO_SANS_KR.className} ${inter.variable} ${robotoMono.variable}`}>
        <AuthProvider>
          
        {/* 인증정보가 설정된 이후에 실행되므로 안정적 */}
        <LayoutInitializer />
          {!isPopup && <CommonHeader />}

          <script src="https://developers.kakao.com/sdk/js/kakao.min.js" async></script>
          <script
            src="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
            type="text/javascript"
            async
          ></script>                    

          <ScrollArea className="flex-1 w-full">
            <div className="flex w-full flex-col justify-start pb-10"> {/* 아래 버튼 공간 여유 */}
              <div className="page">
                <main className="page__main">
                  {children}
                </main>
              </div>
              {!isPopup && <CommonFooter />}
            </div>
          </ScrollArea>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}

"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { GuestProperty, Property } from "@/types";
import { fetchRecommendedProperties, useAuthCheck, useGetCompanyId } from "@/hooks/apis/";
import PropertyReadCard from "@/app/manage/components/propertycard/PropertyReadCard";

export default function RecommendPage() {
    const { id } = useParams(); // 현재 guestproperty_id
    const { user } = useAuthCheck();
    const { company } = useGetCompanyId(user); // UUID 기반
    
    const [guestProperty, setGuestProperty] = useState<GuestProperty | null>(null);
    const [recommended, setRecommended] = useState<Property[]>([]);
    const [newFlags, setNewFlags] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);

    // ⭐ 손님조건 + 추천매물 + NEW 로딩
    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;

            try {
                // 1️⃣ guestproperty 가져오기
                const { data: gp, error: gpError } = await supabase
                    .from("guestproperty")
                    .select("*")
                    .eq("id", id)
                    .single();

                if (gpError) throw gpError;
                setGuestProperty(gp);

                // 2️⃣ 추천 매물 가져오기 (소속 부동산 기반 필터링)
                const list = await fetchRecommendedProperties(gp.data, company);

                // ⭐ 최신순 정렬
                const sorted = list.sort((a, b) => {
                    const dateA = new Date(a.update_at || a.create_at).getTime();
                    const dateB = new Date(b.update_at || b.create_at).getTime();
                    return dateB - dateA;
                });

                setRecommended(sorted);

                // 3️⃣ NEW 데이터 로딩
                const { data: newRows, error: newErr } = await supabase
                    .from("guest_new_properties")
                    .select("property_id")
                    .eq("guestproperty_id", id)
                    .eq("is_read", false);

                if (newErr) throw newErr;

                setNewFlags(newRows?.map((r) => r.property_id) || []);
            } catch (err) {
                console.error("❌ 추천매물 로딩 오류:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    // ⭐ 클릭 시 읽음 처리 (DB + 부모창 반영)
    const handleMarkAsRead = async (propertyId: number) => {
        try {
            // DB 업데이트
            await supabase
                .from("guest_new_properties")
                .update({ 
                    is_read: true,
                    updated_at: new Date().toISOString(),   // ← 직접 updated_at 갱신 
                })
                .eq("guestproperty_id", id)
                .eq("property_id", propertyId);

            // popup UI도 즉시 반영
            setNewFlags((prev) => prev.filter((pid) => pid !== propertyId));

            // 부모창에 NEW 제거 요청
            window.opener?.postMessage(
                {
                    type: "MARK_NEW_READ",
                    guestproperty_id: Number(id),
                    property_id: propertyId,
                },
                "*"
            );
        } catch (e) {
            console.error("⚠️ 읽음 처리 오류:", e);
        }
    };

    if (loading) {
        return <div className="p-6 text-center">추천 매물을 불러오는 중입니다...</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-lg font-bold mb-2">추천 매물 리스트</h1>
            <p className="text-sm text-gray-500 mb-4">
                손님 조건에 맞는 매물이 {recommended.length}건 발견되었습니다.
            </p>

            {recommended.length > 0 ? (
                <div className="flex flex-col gap-2">
                    {recommended.map((p) => {
                        const isNew = newFlags.includes(p.id);

                        return (
                            <div
                                key={p.id}
                                onClick={() => handleMarkAsRead(p.id)}
                                className={`relative flex flex-row items-start gap-2 rounded-md transition
                                    ${isNew
                                        ? "border-2 border-red-500 shadow-md bg-white"
                                        : "border border-gray-200 hover:bg-gray-50"
                                    }`}
                            >
                                <PropertyReadCard property={p} selected={false} />
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-gray-400 text-center py-10">
                    조건에 맞는 매물이 없습니다.
                </div>
            )}
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Property } from "@/types";
import { PropertyCardAdDetailView } from "@/app/manage/components/propertycard/components";
import { ShowData } from "@/app/manage/components/propertycard/Data";

export default function PropertyAdPage() {
    const sp = useSearchParams();
    const id = sp.get("id");

    const [loading, setLoading] = useState(true);
    const [property, setProperty] = useState<Property | null>(null);
    const [showData, setShowData] = useState<ShowData | null>(null);

    useEffect(() => {
        if (!id) return;

        try {
            // ✅ key 통일
            const raw = localStorage.getItem(`propertyAd:${id}`);
            if (raw) {
                const parsed = JSON.parse(raw);
                setProperty(parsed.property_Data);
                setShowData(parsed.data);
            }
        } catch (e) {
            console.error("❌ 광고 데이터 로딩 실패:", e);
        } finally {
            setLoading(false);
        }
    }, [id]);

    if (!id) return <div>잘못된 접근입니다 (id 없음)</div>;
    if (loading) return <div>불러오는 중…</div>;
    if (!property || !showData) return <div>광고 데이터가 없습니다</div>;

    return (
        <div className="w-screen h-screen bg-white">
            <PropertyCardAdDetailView 
                property_Data={property} 
                data={showData}                
            />
        </div>
    );
}

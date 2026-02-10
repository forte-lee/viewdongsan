"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Property } from "@/types";
import { PropertyCardAdDetailView } from "@/app/manage/components/propertycard/components";
import { ShowData } from "@/app/manage/components/propertycard/Data";

// 광고용 로컬스토리지 키 (버전 관리용)
const AD_STORAGE_KEY_PREFIX = "propertyAd:v2:";

function PropertyAdContent() {
    const sp = useSearchParams();
    const id = sp.get("id");

    const [loading, setLoading] = useState(true);
    const [property, setProperty] = useState<Property | null>(null);
    const [showData, setShowData] = useState<ShowData | null>(null);

    useEffect(() => {
        if (!id) return;

        try {
            // ✅ v2 키 우선 사용
            let raw = localStorage.getItem(`${AD_STORAGE_KEY_PREFIX}${id}`);

            // v2 데이터가 없으면, 구버전 키는 무시하고 "광고 데이터 없음" 처리
            // (사용자가 관리 화면에서 광고 버튼을 다시 누르면 v2로 재생성됨)
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

export default function PropertyAdPage() {
    return (
        <Suspense fallback={<div>불러오는 중…</div>}>
            <PropertyAdContent />
        </Suspense>
    );
}

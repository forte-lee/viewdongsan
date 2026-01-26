"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PropertyCardDetailView } from "@/app/manage/components/propertycard/components";
import { useGetPropertyAll } from "@/hooks/apis";
import { Property } from "@/types";
import { ShowData } from "@/app/manage/components/propertycard/Data";

export default function PropertyDetailPage() {
    const sp = useSearchParams();
    const id = sp.get("id");
    const initialIndex = useMemo(
        () => Number(sp.get("index") ?? 0),
        [sp]
    );

    const [loading, setLoading] = useState(true);
    const [property, setProperty] = useState<Property | null>(null);
    const [showData, setShowData] = useState<ShowData | null>(null);
    const [images, setImages] = useState<string[]>([]);
    
    // 팝업 창에서 전체 매물 목록을 API로 다시 가져오기 (평균 계산용)
    // localStorage에 저장하지 않아 할당량 초과 방지
    const { propertysAll } = useGetPropertyAll();

    useEffect(() => {
        if (!id) return;
      
        try {
          const raw = localStorage.getItem(`propertyDetail:${id}`);
          if (raw) {
            const parsed = JSON.parse(raw);
            setProperty(parsed.property_Data);
            setShowData(parsed.data);
            setImages(parsed.images ?? []);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      }, [id]);
      

    if (!id) return <div>잘못된 접근입니다 (id 없음)</div>;
    if (loading) return <div>불러오는 중…</div>;
    if (!property || !showData) return <div>데이터가 없습니다</div>;

    return (
        <div className="w-screen h-screen bg-white">
            <PropertyCardDetailView
                property_Data={property}
                data={showData}
                images={images}
                initialIndex={Number.isNaN(initialIndex) ? 0 : initialIndex}
                propertysAll={propertysAll}
            />
        </div>
    );
}

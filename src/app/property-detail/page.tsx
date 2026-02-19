"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PropertyCardDetailView } from "@/app/manage/components/propertycard/components";
import { useGetPropertyAll } from "@/hooks/apis";
import { useFetchPropertyById } from "@/hooks/supabase/property/useFetchPropertyById";
import { propertyToShowData } from "@/app/manage/components/propertycard/utils/propertyToShowData";
import { Property } from "@/types";
import { ShowData } from "@/app/manage/components/propertycard/Data";

function PropertyDetailContent() {
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
    
    const { propertysAll } = useGetPropertyAll();
    const { fetchProperty } = useFetchPropertyById();

    useEffect(() => {
        if (!id) return;

        const loadFromLocalStorage = () => {
            try {
                const raw = localStorage.getItem(`propertyDetail:${id}`);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    setProperty(parsed.property_Data);
                    setShowData(parsed.data);
                    setImages(parsed.images ?? []);
                    return true;
                }
            } catch (e) {
                console.error(e);
            }
            return false;
        };

        const loadFromApi = async () => {
            const propertyId = Number(id);
            if (!Number.isFinite(propertyId)) return;

            const fetched = await fetchProperty(propertyId);
            if (fetched) {
                setProperty(fetched);
                const data = propertyToShowData(fetched);
                setShowData(data);
                const imgs =
                    fetched.data?.images_watermark?.length
                        ? fetched.data.images_watermark
                        : fetched.data?.images ?? [];
                setImages(imgs);
            }
        };

        (async () => {
            const fromLocal = loadFromLocalStorage();
            if (!fromLocal) {
                await loadFromApi();
            }
        })().finally(() => setLoading(false));
    }, [id, fetchProperty]);
      

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

export default function PropertyDetailPage() {
    return (
        <Suspense fallback={<div>불러오는 중…</div>}>
            <PropertyDetailContent />
        </Suspense>
    );
}

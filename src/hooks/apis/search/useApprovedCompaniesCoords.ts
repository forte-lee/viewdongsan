"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { geocodeAddress } from "@/utils/geocodeAddress";
import { useKakaoLoader } from "@/hooks/kakaomap/useKakaoLoader";

export interface CompanyMarkerData {
    id: number;
    lat: number;
    lng: number;
    companyName: string;
    companyPhone: string | null;
    companyAddress: string | null;
    companyAddressSub: string | null;
    representativeName: string | null;
    representativePhone: string | null;
    exteriorPhotos: string[];
    companyIntroduction?: string | null;
}

/**
 * is_registration_approved=true인 회사들의 주소를 지오코딩하여 좌표 배열 반환
 * 내 회사 포함, 전체 회사 정보 포함
 */
function useApprovedCompaniesCoords() {
    const isKakaoLoaded = useKakaoLoader();
    const [companyMarkers, setCompanyMarkers] = useState<CompanyMarkerData[]>([]);

    useEffect(() => {
        if (!isKakaoLoaded) {
            setCompanyMarkers([]);
            return;
        }

        let cancelled = false;

        const fetchAndGeocode = async () => {
            const { data: companies, error } = await supabase
                .from("company")
                .select("id, company_name, company_phone, company_address, company_address_sub, representative_name, representative_phone, company_data")
                .eq("is_registration_approved", true);

            if (error || !companies) {
                setCompanyMarkers([]);
                return;
            }

            const results: CompanyMarkerData[] = [];

            for (const c of companies) {
                const address = [c.company_address, c.company_address_sub]
                    .filter(Boolean)
                    .join(" ")
                    .trim();

                if (!address) continue;

                const coords = await geocodeAddress(address);
                if (coords && !cancelled) {
                    const companyData = c.company_data as { exterior_photos?: string[]; company_introduction?: string } | null;
                    results.push({
                        id: c.id,
                        lat: coords.lat,
                        lng: coords.lng,
                        companyName: c.company_name || "",
                        companyPhone: c.company_phone ?? null,
                        companyAddress: c.company_address ?? null,
                        companyAddressSub: c.company_address_sub ?? null,
                        representativeName: c.representative_name ?? null,
                        representativePhone: c.representative_phone ?? null,
                        exteriorPhotos: companyData?.exterior_photos ?? [],
                        companyIntroduction: companyData?.company_introduction ?? null,
                    });
                }
            }

            if (!cancelled) {
                setCompanyMarkers(results);
            }
        };

        fetchAndGeocode();
        return () => {
            cancelled = true;
        };
    }, [isKakaoLoaded]);

    return companyMarkers;
}

export { useApprovedCompaniesCoords };

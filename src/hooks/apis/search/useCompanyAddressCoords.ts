"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { geocodeAddress } from "@/utils/geocodeAddress";
import { useKakaoLoader } from "@/hooks/kakaomap/useKakaoLoader";

/**
 * 회사 주소를 지오코딩하여 좌표 반환
 * @param companyId - 회사 ID (null이면 null 반환)
 */
function useCompanyAddressCoords(companyId: number | null) {
    const isKakaoLoaded = useKakaoLoader();
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

    useEffect(() => {
        if (!companyId || !isKakaoLoaded) {
            setCoords(null);
            return;
        }

        let cancelled = false;

        const fetchAndGeocode = async () => {
            const { data, error } = await supabase
                .from("company")
                .select("company_address, company_address_sub")
                .eq("id", companyId)
                .maybeSingle();

            if (error || !data) {
                setCoords(null);
                return;
            }

            const address = [data.company_address, data.company_address_sub]
                .filter(Boolean)
                .join(" ")
                .trim();

            if (!address) {
                setCoords(null);
                return;
            }

            const result = await geocodeAddress(address);
            if (!cancelled && result) {
                setCoords(result);
            }
        };

        fetchAndGeocode();
        return () => {
            cancelled = true;
        };
    }, [companyId, isKakaoLoaded]);

    return coords;
}

export { useCompanyAddressCoords };

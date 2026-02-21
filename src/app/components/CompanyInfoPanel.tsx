"use client";

import { useEffect, useState } from "react";
import { X, Share2 } from "lucide-react";
import { Button } from "@/components/ui";
import { supabase } from "@/utils/supabase/client";
import type { CompanyMarkerItem } from "@/hooks/kakaomap/useKakaoMap";

interface CompanyInfoPanelProps {
    company: CompanyMarkerItem | null;
    onClose: () => void;
}

function CompanyInfoPanel({ company, onClose }: CompanyInfoPanelProps) {
    const [publicCount, setPublicCount] = useState<number | null>(null);
    const [privateCount, setPrivateCount] = useState<number | null>(null);

    useEffect(() => {
        if (!company?.id) {
            setPublicCount(null);
            setPrivateCount(null);
            return;
        }

        const fetchCounts = async () => {
            const { data: employees } = await supabase
                .from("employee")
                .select("id")
                .eq("company_id", company.id);

            if (!employees?.length) {
                setPublicCount(0);
                setPrivateCount(0);
                return;
            }

            const employeeIds = employees.map((e) => e.id);

            const { data: properties } = await supabase
                .from("property")
                .select("on_board_state")
                .in("employee_id", employeeIds)
                .eq("is_register", true);

            let publicCnt = 0;
            let privateCnt = 0;
            for (const p of properties ?? []) {
                const ob = p.on_board_state as { on_board_state?: boolean } | null;
                if (ob?.on_board_state === true) {
                    publicCnt++;
                } else {
                    privateCnt++;
                }
            }
            setPublicCount(publicCnt);
            setPrivateCount(privateCnt);
        };

        fetchCounts();
    }, [company?.id]);

    if (!company) return null;

    const handleShareLink = async () => {
        if (typeof window === "undefined" || !company?.id) return;
        const url = `${window.location.origin}${window.location.pathname}?company=${company.id}`;

        // 1) Clipboard API 시도 (HTTPS/localhost에서만 동작)
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(url);
                alert("링크가 복사되었습니다. 다른 사람에게 공유해 보세요!");
                return;
            }
        } catch {
            /* HTTP 등 비보안 컨텍스트에서 실패 시 fallback으로 진행 */
        }

        // 2) execCommand fallback (HTTP 등에서 동작)
        const textarea = document.createElement("textarea");
        textarea.value = url;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        textarea.style.top = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        try {
            const ok = document.execCommand("copy");
            if (ok) {
                alert("링크가 복사되었습니다. 다른 사람에게 공유해 보세요!");
            } else {
                alert("링크 복사에 실패했습니다. 아래 링크를 직접 복사해 주세요:\n" + url);
            }
        } catch {
            alert("링크 복사에 실패했습니다. 아래 링크를 직접 복사해 주세요:\n" + url);
        } finally {
            document.body.removeChild(textarea);
        }
    };

    const fullAddress = [company.companyAddress, company.companyAddressSub]
        .filter(Boolean)
        .join(" ");
    const imageUrl = company.exteriorPhotos?.[0];

    return (
        <div className="absolute bottom-4 right-4 z-20 w-[320px] rounded-lg border border-gray-200 bg-white shadow-lg">
            <div className="flex items-start justify-between border-b border-gray-100 p-4">
                <h3 className="text-lg font-bold text-gray-900">{company.companyName || "부동산"}</h3>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5 text-gray-600 hover:text-gray-900"
                        onClick={handleShareLink}
                    >
                        <Share2 size={16} />
                        링크 공유
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={onClose}
                    >
                        <X size={18} />
                    </Button>
                </div>
            </div>
            <div className="p-4 space-y-3">
                {imageUrl && (
                    <div className="aspect-[4/3] w-full overflow-hidden rounded-md bg-gray-100">
                        <img
                            src={imageUrl}
                            alt={company.companyName || "회사"}
                            className="h-full w-full object-cover"
                        />
                    </div>
                )}
                {company.companyIntroduction && (
                    <div className="pb-3 border-b border-gray-100">
                        <p className="text-gray-500 text-xs mb-1">회사 소개</p>
                        <p className="text-gray-700 text-sm whitespace-pre-wrap line-clamp-4">{company.companyIntroduction}</p>
                    </div>
                )}
                <div className="flex gap-4 text-sm pb-3 border-b border-gray-100">
                    <div>
                        <span className="text-gray-500">공개매물:</span>
                        <span className="ml-2 font-medium">{publicCount ?? "-"}개</span>
                    </div>
                    <div>
                        <span className="text-gray-500">비공개 매물:</span>
                        <span className="ml-2 font-medium">{privateCount ?? "-"}개</span>
                    </div>
                </div>
                <div className="space-y-1.5 text-sm text-gray-700 pt-3">
                    {company.representativeName && (
                        <p>
                            <span className="text-gray-500">대표:</span> {company.representativeName}
                        </p>
                    )}
                    {(company.companyPhone || company.representativePhone) && (
                        <p>
                            <span className="text-gray-500">번호:</span>{" "}
                            {company.companyPhone || company.representativePhone}
                        </p>
                    )}
                    {fullAddress && (
                        <p>
                            <span className="text-gray-500">주소:</span> {fullAddress}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export { CompanyInfoPanel };

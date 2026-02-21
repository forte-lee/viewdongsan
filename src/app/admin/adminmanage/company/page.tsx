"use client";

import { Button, Separator, Input, Textarea } from "@/components/ui";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import { ChevronLeft, Upload, X } from "lucide-react";
import { Label } from "@radix-ui/react-label";
import { useAuthCheck } from "@/hooks/apis";
import { useAtomValue } from "jotai";
import { companyAtom, employeesAtom, userEmailAtom } from "@/store/atoms";
import { useGetCompanyId } from "@/hooks/apis/search/useGetCompanyId";
import { supabase } from "@/utils/supabase/client";
import {
    Card,
    CardContent,
} from "@/components/ui";
import { toast } from "@/hooks/use-toast";
import type { CompanyData } from "@/hooks/supabase/company/useGetCompaniesAll";
import { useUpdateCompany } from "@/hooks/supabase/company/useUpdateCompany";
import { uploadCompanyImage } from "@/hooks/image/useUploadCompanyImage";

declare global {
    interface Window {
        daum: {
            Postcode: new (options: {
                oncomplete: (data: {
                    jibunAddress?: string;
                    roadAddress?: string;
                    address?: string;
                }) => void;
            }) => { open: () => void };
        };
    }
}

interface CompanyInfo {
    id: number;
    company_name?: string | null;
    company_phone?: string | null;
    company_address?: string | null;
    company_address_sub?: string | null;
    representative_name?: string | null;
    representative_phone?: string | null;
    broker_registration_number?: string | null;
    company_data?: CompanyData | null;
    is_registration_approved?: boolean;
    created_at?: string;
}

function CompanyManagePage() {
    const router = useRouter();
    const { user } = useAuthCheck();
    const companyId = useAtomValue(companyAtom);
    const [isLoading, setIsLoading] = useState(true);
    const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
    const { updateCompany, isLoading: isSaving } = useUpdateCompany();

    // 편집용 로컬 상태
    const [companyName, setCompanyName] = useState("");
    const [companyPhone, setCompanyPhone] = useState("");
    const [companyAddress, setCompanyAddress] = useState("");
    const [companyAddressSub, setCompanyAddressSub] = useState("");
    const [representativeName, setRepresentativeName] = useState("");
    const [representativePhone, setRepresentativePhone] = useState("");
    const [brokerRegistrationNumber, setBrokerRegistrationNumber] = useState("");
    const [companyData, setCompanyData] = useState<CompanyData>({});
    const [uploadingKey, setUploadingKey] = useState<string | null>(null);

    const businessRegInputRef = useRef<HTMLInputElement>(null);
    const brokerLicenseInputRef = useRef<HTMLInputElement>(null);
    const exteriorInputRef = useRef<HTMLInputElement>(null);

    // companyId 로드 (UUID 기반)
    const { company } = useGetCompanyId(user);
    const employees = useAtomValue(employeesAtom);
    const userEmail = useAtomValue(userEmailAtom);

    // 대표 또는 매니저가 회사 정보 편집 가능
    const currentUserEmployee = user?.id
        ? employees.find((emp) => emp.supabase_user_id === user.id) || employees.find((emp) => emp.kakao_email === userEmail)
        : employees.find((emp) => emp.kakao_email === userEmail);
    const isCEO = currentUserEmployee?.manager === "대표";
    const isManager = currentUserEmployee?.manager === "매니저";
    const canEditCompanyInfo = isCEO || isManager;

    // 회사 정보 로드
    useEffect(() => {
        const loadCompanyInfo = async () => {
            try {
                const targetCompanyId = companyId || company;
                if (!targetCompanyId) {
                    setIsLoading(false);
                    return;
                }

                const { data, error } = await supabase
                    .from("company")
                    .select("id, company_name, company_phone, company_address, company_address_sub, representative_name, representative_phone, broker_registration_number, company_data, is_registration_approved, created_at")
                    .eq("id", targetCompanyId)
                    .maybeSingle();

                if (error) {
                    console.error("❌ 회사 정보 로드 실패:", error);
                    toast({
                        variant: "destructive",
                        title: "오류 발생",
                        description: "회사 정보를 불러오는 데 실패했습니다.",
                    });
                    setIsLoading(false);
                    return;
                }

                if (data) {
                    const info = data as CompanyInfo;
                    setCompanyInfo(info);
                    setCompanyName(info.company_name || "");
                    setCompanyPhone(info.company_phone || "");
                    setCompanyAddress(info.company_address || "");
                    setCompanyAddressSub(info.company_address_sub || "");
                    setRepresentativeName(info.representative_name || "");
                    setRepresentativePhone(info.representative_phone || "");
                    setBrokerRegistrationNumber(info.broker_registration_number || "");
                    setCompanyData(info.company_data || {});
                }
            } catch (error) {
                console.error("❌ 회사 정보 로드 중 오류:", error);
                toast({
                    variant: "destructive",
                    title: "오류 발생",
                    description: "회사 정보를 불러오는 중 오류가 발생했습니다.",
                });
            } finally {
                setIsLoading(false);
            }
        };

        loadCompanyInfo();
    }, [companyId, company]);

    const targetCompanyId = companyId || company;

    const handleSave = async () => {
        if (!targetCompanyId || !companyInfo) return;
        const success = await updateCompany(targetCompanyId, {
            company_name: companyName.trim() || null,
            company_phone: companyPhone.trim() || null,
            company_address: companyAddress.trim() || null,
            company_address_sub: companyAddressSub.trim() || null,
            representative_name: representativeName.trim() || null,
            representative_phone: representativePhone.trim() || null,
            broker_registration_number: brokerRegistrationNumber.trim() || null,
            company_data: { ...companyData },
        });
        if (success) {
            setCompanyInfo((prev) =>
                prev
                    ? {
                          ...prev,
                          company_name: companyName.trim() || null,
                          company_phone: companyPhone.trim() || null,
                          company_address: companyAddress.trim() || null,
                          company_address_sub: companyAddressSub.trim() || null,
                          representative_name: representativeName.trim() || null,
                          representative_phone: representativePhone.trim() || null,
                          broker_registration_number: brokerRegistrationNumber.trim() || null,
                          company_data: { ...companyData },
                      }
                    : null
            );
        }
    };

    const handleImageUpload = async (
        type: "business_registration" | "broker_license" | "exterior",
        file: File
    ) => {
        if (!targetCompanyId) return;
        setUploadingKey(type);
        const existingUrl =
            type === "business_registration"
                ? companyData.business_registration
                : type === "broker_license"
                  ? companyData.broker_license
                  : undefined;
        const url = await uploadCompanyImage(targetCompanyId, file, type, {
            replaceExistingUrl: existingUrl,
        });
        setUploadingKey(null);
        if (url) {
            if (type === "exterior") {
                setCompanyData((prev) => ({
                    ...prev,
                    exterior_photos: [...(prev.exterior_photos || []), url],
                }));
            } else {
                setCompanyData((prev) => ({
                    ...prev,
                    [type]: url,
                }));
            }
        }
    };

    const handleRemoveExteriorPhoto = (index: number) => {
        setCompanyData((prev) => {
            const photos = [...(prev.exterior_photos || [])];
            photos.splice(index, 1);
            return { ...prev, exterior_photos: photos };
        });
    };

    const handleRemoveSingleImage = (key: "business_registration" | "broker_license") => {
        setCompanyData((prev) => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
    };

    // 주소 검색 (Daum 우편번호 서비스)
    const handleAddressSearch = () => {
        if (typeof window === "undefined" || !window.daum?.Postcode) {
            toast({
                variant: "destructive",
                title: "주소 검색 불가",
                description: "주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.",
            });
            return;
        }
        new window.daum.Postcode({
            oncomplete: (data: { jibunAddress?: string; roadAddress?: string; address?: string }) => {
                const address = data.jibunAddress || data.roadAddress || data.address || "";
                setCompanyAddress(address);
            },
        }).open();
    };

    return (
        <>
            <div className="page__manage__header">
                <div className="flex flex-row justify-between items-center">
                        <div className="flex flex-row justify-between items-start">
                        <div className="flex flex-row justify-start items-center gap-2">
                            <Button
                                variant={"outline"}
                                size={"icon"}
                                onClick={() => router.push("/admin/adminmanage")}
                            >
                                <ChevronLeft />
                            </Button>
                            <div className="flex flex-row justify-start items-end gap-3 pl-4">
                                <Label className={"text-3xl font-bold"}>회사 정보 관리</Label>
                                <Label className={"text-xl text-gray-500 font-bold"}>(회사 정보)</Label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Separator className="my-1" />
            <div className="page__manage__body">
                <div className="flex flex-col w-full items-center justify-start gap-1">
                    {isLoading ? (
                        <div className="page__manage__body__noData">
                            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                                로딩 중...
                            </h3>
                        </div>
                    ) : companyInfo ? (
                        <div className="page__manage__body__isData w-full max-w-6xl p-4">
                            <Card className="bg-white rounded-lg shadow-sm border border-gray-200 w-full">
                                <CardContent className="p-6">
                                    <div className="flex flex-col gap-6">
                                        {/* 회사 정보 섹션 */}
                                        <div className="flex flex-col gap-4">
                                            <div className="flex items-center justify-between">
                                                <h2 className="text-lg font-semibold text-gray-900">회사 정보</h2>
                                                {companyInfo && (canEditCompanyInfo || isCEO) && (
                                                    <Button
                                                        onClick={handleSave}
                                                        disabled={isSaving}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                                    >
                                                        {isSaving ? "저장 중..." : "저장"}
                                                    </Button>
                                                )}
                                            </div>
                                            
                                            {/* 회사명 */}
                                            <div className="flex items-center gap-6">
                                                <Label className="text-sm text-gray-600 font-medium min-w-[160px]">회사명</Label>
                                                {canEditCompanyInfo ? (
                                                    <Input
                                                        value={companyName}
                                                        onChange={(e) => setCompanyName(e.target.value)}
                                                        placeholder="회사명 입력"
                                                        className="max-w-xs"
                                                    />
                                                ) : (
                                                    <span className="text-sm text-gray-900">{companyName || "-"}</span>
                                                )}
                                            </div>

                                            <Separator className="my-1" />

                                            {/* 연락처 */}
                                            <div className="flex items-center gap-6">
                                                <Label className="text-sm text-gray-600 font-medium min-w-[160px]">연락처</Label>
                                                {canEditCompanyInfo ? (
                                                    <Input
                                                        value={companyPhone}
                                                        onChange={(e) => setCompanyPhone(e.target.value)}
                                                        placeholder="02-1234-5678"
                                                        className="max-w-xs"
                                                    />
                                                ) : (
                                                    <span className="text-sm text-gray-900">{companyPhone || "-"}</span>
                                                )}
                                            </div>

                                            <Separator className="my-1" />

                                            {/* 주소 */}
                                            <div className="flex items-start gap-6">
                                                <Label className="text-sm text-gray-600 font-medium min-w-[160px] pt-1">주소</Label>
                                                {canEditCompanyInfo ? (
                                                    <div className="flex flex-col gap-2 w-full max-w-md">
                                                        <div className="flex items-center gap-2">
                                                            <Input
                                                                value={companyAddress}
                                                                readOnly
                                                                placeholder="주소 검색을 눌러주세요"
                                                                className="w-full bg-gray-50 cursor-pointer"
                                                                onClick={handleAddressSearch}
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                onClick={handleAddressSearch}
                                                                className="shrink-0"
                                                            >
                                                                주소 검색
                                                            </Button>
                                                        </div>
                                                        <Input
                                                            value={companyAddressSub}
                                                            onChange={(e) => setCompanyAddressSub(e.target.value)}
                                                            placeholder="상세 주소 (동, 호수, 층 등)"
                                                            className="w-full"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col gap-1">
                                                        {companyAddress && (
                                                            <span className="text-sm text-gray-900">{companyAddress}</span>
                                                        )}
                                                        {companyAddressSub && (
                                                            <span className="text-sm text-gray-900">{companyAddressSub}</span>
                                                        )}
                                                        {!companyAddress && !companyAddressSub && (
                                                            <span className="text-sm text-gray-500">-</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <Separator className="my-1" />

                                            {/* 대표자 이름 */}
                                            <div className="flex items-center gap-6">
                                                <Label className="text-sm text-gray-600 font-medium min-w-[160px]">대표자 이름</Label>
                                                {canEditCompanyInfo ? (
                                                    <Input
                                                        value={representativeName}
                                                        onChange={(e) => setRepresentativeName(e.target.value)}
                                                        placeholder="대표자 이름 입력"
                                                        className="max-w-xs"
                                                    />
                                                ) : (
                                                    <span className="text-sm text-gray-900">{representativeName || "-"}</span>
                                                )}
                                            </div>

                                            <Separator className="my-1" />

                                            {/* 대표자 연락처 */}
                                            <div className="flex items-center gap-6">
                                                <Label className="text-sm text-gray-600 font-medium min-w-[160px]">대표자 연락처</Label>
                                                {isCEO ? (
                                                    <Input
                                                        value={representativePhone}
                                                        onChange={(e) => setRepresentativePhone(e.target.value)}
                                                        placeholder="010-1234-5678"
                                                        className="max-w-xs"
                                                    />
                                                ) : (
                                                    <span className="text-sm text-gray-900">{representativePhone || "-"}</span>
                                                )}
                                            </div>

                                            <Separator className="my-1" />

                                            {/* 중개등록번호 */}
                                            <div className="flex items-center gap-6">
                                                <Label className="text-sm text-gray-600 font-medium min-w-[160px]">중개등록번호</Label>
                                                {isCEO ? (
                                                    <Input
                                                        value={brokerRegistrationNumber}
                                                        onChange={(e) => setBrokerRegistrationNumber(e.target.value)}
                                                        placeholder="중개등록번호 입력"
                                                        className="max-w-xs"
                                                    />
                                                ) : (
                                                    <span className="text-sm text-gray-900">{brokerRegistrationNumber || "-"}</span>
                                                )}
                                            </div>

                                            <Separator className="my-1" />

                                            {/* 회사 소개 */}
                                            <div className="flex flex-col gap-2">
                                                <Label className="text-sm text-gray-600 font-medium">회사 소개</Label>
                                                {canEditCompanyInfo ? (
                                                    <Textarea
                                                        value={companyData.company_introduction ?? ""}
                                                        onChange={(e) =>
                                                            setCompanyData((prev) => ({
                                                                ...prev,
                                                                company_introduction: e.target.value,
                                                            }))
                                                        }
                                                        placeholder="회사 소개 글을 입력해 주세요."
                                                        className="min-h-[120px] resize-y"
                                                        rows={5}
                                                    />
                                                ) : (
                                                    <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 whitespace-pre-wrap min-h-[80px]">
                                                        {companyData.company_introduction || "-"}
                                                    </div>
                                                )}
                                            </div>

                                            <Separator className="my-1" />

                                            {/* 회사 증빙 자료 (company_data) - 입력/편집 */}
                                            <div className="flex flex-col gap-4">
                                                <h2 className="text-lg font-semibold text-gray-900 mb-2">회사 증빙 자료</h2>

                                                {/* 사업자등록증 */}
                                                <div className="flex flex-col gap-2">
                                                    <Label className="text-sm text-gray-600 font-medium">사업자등록증</Label>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        {isCEO && (
                                                            <input
                                                                ref={businessRegInputRef}
                                                                type="file"
                                                                accept="image/*"
                                                                className="hidden"
                                                                onChange={(e) => {
                                                                    const file = e.target.files?.[0];
                                                                    if (file) handleImageUpload("business_registration", file);
                                                                    e.target.value = "";
                                                                }}
                                                            />
                                                        )}
                                                        {companyData.business_registration ? (
                                                            <div className="flex items-center gap-2">
                                                                <a
                                                                    href={companyData.business_registration}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="block rounded-lg overflow-hidden border border-gray-200 hover:ring-2 hover:ring-blue-300 transition-shadow"
                                                                >
                                                                    <img
                                                                        src={companyData.business_registration}
                                                                        alt="사업자등록증"
                                                                        className="w-24 h-24 object-cover"
                                                                    />
                                                                </a>
                                                                {isCEO && (
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handleRemoveSingleImage("business_registration")}
                                                                    >
                                                                        <X className="w-4 h-4" />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        ) : null}
                                                        {isCEO && (
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => businessRegInputRef.current?.click()}
                                                                disabled={uploadingKey === "business_registration"}
                                                            >
                                                                <Upload className="w-4 h-4 mr-1" />
                                                                {uploadingKey === "business_registration" ? "업로드 중..." : "사진 업로드"}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* 중개업등록증 */}
                                                <div className="flex flex-col gap-2">
                                                    <Label className="text-sm text-gray-600 font-medium">중개업등록증</Label>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        {isCEO && (
                                                            <input
                                                                ref={brokerLicenseInputRef}
                                                                type="file"
                                                                accept="image/*"
                                                                className="hidden"
                                                                onChange={(e) => {
                                                                    const file = e.target.files?.[0];
                                                                    if (file) handleImageUpload("broker_license", file);
                                                                    e.target.value = "";
                                                                }}
                                                            />
                                                        )}
                                                        {companyData.broker_license ? (
                                                            <div className="flex items-center gap-2">
                                                                <a
                                                                    href={companyData.broker_license}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="block rounded-lg overflow-hidden border border-gray-200 hover:ring-2 hover:ring-blue-300 transition-shadow"
                                                                >
                                                                    <img
                                                                        src={companyData.broker_license}
                                                                        alt="중개업등록증"
                                                                        className="w-24 h-24 object-cover"
                                                                    />
                                                                </a>
                                                                {isCEO && (
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handleRemoveSingleImage("broker_license")}
                                                                    >
                                                                        <X className="w-4 h-4" />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        ) : null}
                                                        {isCEO && (
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => brokerLicenseInputRef.current?.click()}
                                                                disabled={uploadingKey === "broker_license"}
                                                            >
                                                                <Upload className="w-4 h-4 mr-1" />
                                                                {uploadingKey === "broker_license" ? "업로드 중..." : "사진 업로드"}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* 외부사진 */}
                                                <div className="flex flex-col gap-2">
                                                    <Label className="text-sm text-gray-600 font-medium">외부사진</Label>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        {isCEO && (
                                                            <input
                                                                ref={exteriorInputRef}
                                                                type="file"
                                                                accept="image/*"
                                                                className="hidden"
                                                                onChange={(e) => {
                                                                    const file = e.target.files?.[0];
                                                                    if (file) handleImageUpload("exterior", file);
                                                                    e.target.value = "";
                                                                }}
                                                            />
                                                        )}
                                                        {(companyData.exterior_photos || []).map((url, i) => (
                                                            <div key={i} className="flex items-center gap-1">
                                                                <a
                                                                    href={url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="block rounded-lg overflow-hidden border border-gray-200 hover:ring-2 hover:ring-blue-300 transition-shadow"
                                                                >
                                                                    <img
                                                                        src={url}
                                                                        alt={`외부사진 ${i + 1}`}
                                                                        className="w-24 h-24 object-cover"
                                                                    />
                                                                </a>
                                                                {isCEO && (
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handleRemoveExteriorPhoto(i)}
                                                                    >
                                                                        <X className="w-3 h-3" />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        ))}
                                                        {isCEO && (
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => exteriorInputRef.current?.click()}
                                                                disabled={uploadingKey === "exterior"}
                                                            >
                                                                <Upload className="w-4 h-4 mr-1" />
                                                                {uploadingKey === "exterior" ? "업로드 중..." : "사진 추가"}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <Separator className="my-1" />

                                            {/* 가입정보 */}
                                            <div className="flex flex-col gap-4">
                                                <h2 className="text-lg font-semibold text-gray-900 mb-2">가입정보</h2>

                                                {/* 가입일 */}
                                                <div className="flex items-center gap-6">
                                                    <Label className="text-sm text-gray-600 font-medium min-w-[160px]">가입일</Label>
                                                    <span className="text-sm text-gray-900">
                                                        {companyInfo.created_at
                                                            ? new Date(companyInfo.created_at).toLocaleDateString("ko-KR", {
                                                                  year: "numeric",
                                                                  month: "long",
                                                                  day: "numeric",
                                                              })
                                                            : "-"}
                                                    </span>
                                                </div>

                                                <Separator className="my-1" />

                                                {/* 부동산 등록 승인여부 */}
                                                <div className="flex items-center gap-6">
                                                    <Label className="text-sm text-gray-600 font-medium min-w-[160px]">부동산 등록 승인여부</Label>
                                                    <span className={`text-sm font-medium ${companyInfo.is_registration_approved ? "text-green-600" : "text-amber-600"}`}>
                                                        {companyInfo.is_registration_approved ? "승인됨" : "미승인"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <div className="page__manage__body__noData">
                            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                                회사 정보를 찾을 수 없습니다.
                            </h3>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default CompanyManagePage;


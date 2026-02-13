"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui";
import { Button, Input, Label } from "@/components/ui";
import { useCreateCompany } from "@/hooks/supabase/company/useCreateCompany";

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

interface FranchiseModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const REQUIRED_FIELDS = [
    { key: "company_name", label: "회사명", placeholder: "회사명을 입력하세요" },
    { key: "company_phone", label: "회사 전화번호", placeholder: "02-1234-5678" },
    { key: "company_address", label: "회사 주소", placeholder: "주소검색을 눌러주세요" },
    { key: "company_address_sub", label: "상세 주소", placeholder: "동, 호수 등 상세 주소를 입력하세요" },
    { key: "representative_name", label: "대표자 이름", placeholder: "대표자 이름을 입력하세요" },
    { key: "representative_phone", label: "대표자 연락처", placeholder: "010-1234-5678" },
] as const;

function FranchiseModal({ open, onOpenChange }: FranchiseModalProps) {
    const { createCompany, isLoading } = useCreateCompany();
    const [formData, setFormData] = useState({
        company_name: "",
        company_phone: "",
        company_address: "",
        company_address_sub: "",
        representative_name: "",
        representative_phone: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleInputChange = (key: (typeof REQUIRED_FIELDS)[number]["key"], value: string) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
        if (errors[key]) {
            setErrors((prev) => ({ ...prev, [key]: "" }));
        }
    };

    const handleAddressSearch = () => {
        if (typeof window === "undefined" || !window.daum?.Postcode) {
            setErrors((prev) => ({ ...prev, company_address: "주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요." }));
            return;
        }
        new window.daum.Postcode({
            oncomplete: (data: { jibunAddress?: string; roadAddress?: string; address?: string }) => {
                const address = data.jibunAddress || data.roadAddress || data.address || "";
                handleInputChange("company_address", address);
            },
        }).open();
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        REQUIRED_FIELDS.forEach(({ key, label }) => {
            const value = formData[key].trim();
            if (!value) {
                newErrors[key] = `${label}을(를) 입력해주세요`;
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        const result = await createCompany({
            company_name: formData.company_name.trim(),
            company_phone: formData.company_phone.trim(),
            company_address: formData.company_address.trim(),
            company_address_sub: formData.company_address_sub.trim(),
            representative_name: formData.representative_name.trim(),
            representative_phone: formData.representative_phone.trim(),
        });

        if (result.success) {
            setFormData({
                company_name: "",
                company_phone: "",
                company_address: "",
                company_address_sub: "",
                representative_name: "",
                representative_phone: "",
            });
            setErrors({});
            onOpenChange(false);
        }
    };

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) {
            if (isLoading) return;
            setFormData({
                company_name: "",
                company_phone: "",
                company_address: "",
                company_address_sub: "",
                representative_name: "",
                representative_phone: "",
            });
            setErrors({});
        }
        onOpenChange(nextOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>가맹 신청</DialogTitle>
                    <DialogDescription>
                        가맹 신청을 위해 아래 정보를 입력해주세요. 검토 후 연락드리겠습니다.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {REQUIRED_FIELDS.map(({ key, label, placeholder }) => (
                        <div key={key} className="space-y-2">
                            <Label htmlFor={key} className="text-sm font-medium">
                                {label}
                                <span className="text-red-500 ml-0.5">*</span>
                            </Label>
                            {key === "company_address" ? (
                                <div className="flex gap-2">
                                    <Input
                                        id={key}
                                        value={formData[key]}
                                        onChange={(e) => handleInputChange(key, e.target.value)}
                                        placeholder={placeholder}
                                        className={errors[key] ? "border-red-500" : ""}
                                        readOnly
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleAddressSearch}
                                        className="shrink-0"
                                    >
                                        주소검색
                                    </Button>
                                </div>
                            ) : (
                                <Input
                                    id={key}
                                    value={formData[key]}
                                    onChange={(e) => handleInputChange(key, e.target.value)}
                                    placeholder={placeholder}
                                    className={errors[key] ? "border-red-500" : ""}
                                />
                            )}
                            {errors[key] && (
                                <p className="text-xs text-red-500">{errors[key]}</p>
                            )}
                        </div>
                    ))}
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            disabled={isLoading}
                        >
                            취소
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "등록 중..." : "가맹 신청"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default FranchiseModal;

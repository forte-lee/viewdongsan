"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog/dialog";
import { Button } from "@/components/ui";
import { useAtomValue } from "jotai";
import { employeesAtom, companyAtom } from "@/store/atoms";
import { useState, useEffect } from "react";
import { useTransferPropertyDelete } from "@/hooks/supabase/property/useTransferPropertyDelete";
import { useTransferProperty } from "@/hooks/supabase/property/useTransferProperty";
import { supabase } from "@/utils/supabase/client";

interface TransferPropertyDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    propertyId?: number;
    propertyIds?: number[]; // 다중 매물 이전 시 사용
    currentEmployeeId: number | null;
    onSuccess: () => void;
    isDeleteProperty?: boolean; // property_delete인지 property인지 구분
}

function TransferPropertyDialog({
    open,
    onOpenChange,
    propertyId,
    propertyIds,
    currentEmployeeId,
    onSuccess,
    isDeleteProperty = true,
}: TransferPropertyDialogProps) {
    const employees = useAtomValue(employeesAtom);
    const companyId = useAtomValue(companyAtom);
    const { transferPropertyDelete, transferPropertyDeletesBulk } = useTransferPropertyDelete();
    const { transferProperty, transferPropertiesBulk } = useTransferProperty();
    const [companyEmployees, setCompanyEmployees] = useState<Array<{ id: number; name: string; kakao_email: string }>>([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const loadCompanyEmployees = async () => {
            if (!companyId) return;

            try {
                const { data, error } = await supabase
                    .from("employee")
                    .select("id, name, kakao_email")
                    .eq("company_id", companyId)
                    .order("name", { ascending: true });

                if (error) {
                    console.error("직원 목록 로드 실패:", error);
                    return;
                }

                if (data) {
                    setCompanyEmployees(data);
                }
            } catch (error) {
                console.error("직원 목록 로드 실패:", error);
            }
        };

        if (open && companyId) {
            loadCompanyEmployees();
        }
    }, [open, companyId]);

    const handleTransfer = async () => {
        if (!selectedEmployeeId) {
            return;
        }

        setIsLoading(true);
        try {
            const selectedEmployee = employees.find(emp => emp.id === selectedEmployeeId);
            if (!selectedEmployee) {
                alert("선택한 직원을 찾을 수 없습니다.");
                return;
            }

            let success = false;
            if (propertyIds && propertyIds.length > 0) {
                // 다중 매물 이전
                success = isDeleteProperty
                    ? await transferPropertyDeletesBulk(propertyIds, selectedEmployeeId)
                    : await transferPropertiesBulk(propertyIds, selectedEmployeeId);
            } else if (propertyId != null) {
                success = isDeleteProperty
                    ? await transferPropertyDelete(propertyId, selectedEmployeeId)
                    : await transferProperty(propertyId, selectedEmployeeId);
            }

            if (success) {
                onSuccess();
                onOpenChange(false);
                setSelectedEmployeeId(null);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>담당자 이전</DialogTitle>
                    <DialogDescription>
                        {propertyIds && propertyIds.length > 1
                            ? `${propertyIds.length}개 매물을 이전할 담당자를 선택해주세요.`
                            : "매물을 이전할 담당자를 선택해주세요."}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">담당자 선택</label>
                        <select
                            value={selectedEmployeeId || ""}
                            onChange={(e) => setSelectedEmployeeId(e.target.value ? Number(e.target.value) : null)}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                            disabled={isLoading}
                        >
                            <option value="">담당자를 선택하세요</option>
                            {companyEmployees
                                .filter((emp) => emp.id !== currentEmployeeId)
                                .map((emp) => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.name} ({emp.kakao_email})
                                    </option>
                                ))}
                        </select>
                        {companyEmployees.length === 0 && (
                            <p className="text-sm text-gray-500">이전할 수 있는 담당자가 없습니다.</p>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => {
                            onOpenChange(false);
                            setSelectedEmployeeId(null);
                        }}
                        disabled={isLoading}
                    >
                        취소
                    </Button>
                    <Button
                        onClick={handleTransfer}
                        disabled={!selectedEmployeeId || isLoading}
                        className="bg-blue-600 hover:bg-blue-400 text-white"
                    >
                        {isLoading ? "이전 중..." : "이전"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export { TransferPropertyDialog };


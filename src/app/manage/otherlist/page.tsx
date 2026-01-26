"use client";

import { Button, Separator } from "@/components/ui";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import PropertyCard from "@/app/manage/components/propertycard/PropertyCard";
import PropertyReadCard from "@/app/manage/components/propertycard/PropertyReadCard";
import { Property } from "@/types";
import { useGetPropertys } from "@/hooks/apis";
import { Label } from "@radix-ui/react-label";
import { useAtomValue } from "jotai";
import { isManagerAtom, employeesAtom } from "@/store/atoms";

function OtherListPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const otherUserEmployeeId = searchParams.get("employeeId");

    // 🔥 이제는 atom에서 받아오면 됨 (RootLayout에서 이미 계산됨)
    const isManager = useAtomValue(isManagerAtom);
    const employees = useAtomValue(employeesAtom);
    
    // employeeId로 직원 이름 찾기
    const otherUserName = (() => {
        if (otherUserEmployeeId) {
            const employeeId = Number(otherUserEmployeeId);
            if (!isNaN(employeeId)) {
                const employee = employees.find(emp => emp.id === employeeId);
                if (employee) {
                    return employee.kakao_name || employee.name;
                }
            }
        }
        return "직원";
    })();

    const { propertys, getPropertys } = useGetPropertys();
    const [localPropertys, setLocalPropertys] = useState<Property[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [sortKey, setSortKey] = useState<keyof Property>("update_at");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    // 직원 매물 불러오기 (employee_id 기반)
    useEffect(() => {
        const employeeId = otherUserEmployeeId ? Number(otherUserEmployeeId) : null;
        
        if (!employeeId || isNaN(employeeId)) {
            setIsLoading(false);
            return;
        }

        getPropertys(employeeId);
        setIsLoading(false);
    }, [otherUserEmployeeId]);

    // 정렬
    useEffect(() => {
        if (propertys) {
            const sorted = [...propertys].sort((a, b) => {
                const aDate = new Date(a[sortKey] as string).getTime();
                const bDate = new Date(b[sortKey] as string).getTime();
                return sortOrder === "asc" ? aDate - bDate : bDate - aDate;
            });
            setLocalPropertys(sorted);
        }
    }, [propertys, sortKey, sortOrder]);

    const handleDelete = (propertyId: number) => {
        setLocalPropertys((prev) => prev.filter((p) => p.id !== propertyId));
    };

    if (isLoading) {
        return <div className="flex items-center justify-center w-full h-full">
            <div className="text-xl font-semibold">로딩 중...</div>
        </div>;
    }

    return (
        <>
            <div className="page__manage__header">
                <div className="flex flex-row justify-between items-center">
                    <Button variant="outline" size="icon" onClick={() => router.push("/manage")}>
                        <ChevronLeft />
                    </Button>
                </div>

                <div className="page__manage__header__top">
                    <div className="flex flex-row justify-between items-center">
                        <div className="flex flex-row justify-start items-end gap-3">
                            <Label className="text-3xl font-bold">
                                {otherUserName}님의 매물
                            </Label>
                        </div>

                        <div className="flex items-center justify-end gap-4">
                            <select value={sortKey} onChange={(e) => setSortKey(e.target.value as keyof Property)}
                                className="border border-gray-300 p-2 rounded">
                                <option value="update_at">최근 수정일</option>
                                <option value="create_at">등록일</option>
                            </select>

                            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                                className="border border-gray-300 p-2 rounded">
                                <option value="desc">내림차순</option>
                                <option value="asc">오름차순</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <Separator className="my-1" />

            <div className="page__manage__body">
                <div className="flex flex-col w-full items-center justify-start gap-1">
                    {localPropertys.length !== 0 ? (
                        <div className="page__manage__body__isData">
                            {localPropertys.map((property) =>
                                isManager ? (
                                    <PropertyCard
                                        key={property.id}
                                        property={property}
                                        selected={false}
                                        onDelete={handleDelete}
                                    />
                                ) : (
                                    <PropertyReadCard
                                        key={property.id}
                                        property={property}
                                        selected={false}
                                    />
                                )
                            )}
                        </div>
                    ) : (
                        <div className="page__manage__body__noData">
                            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                                등록된 매물이 없습니다.
                            </h3>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default OtherListPage;

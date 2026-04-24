"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { GuestProperty, Property } from "@/types";
import { fetchRecommendedProperties, useAuth, useGetCompanyId } from "@/hooks/apis/";
import PropertyReadCard from "@/app/manage/components/propertycard/PropertyReadCard";

type GroupedProperty = {
    key: string;
    latest: Property;
    older: Property[];
};

export default function RecommendPage() {
    const { id } = useParams(); // 현재 guestproperty_id
    const { user } = useAuth();
    const { company } = useGetCompanyId(user); // UUID 기반
    
    const [, setGuestProperty] = useState<GuestProperty | null>(null);
    const [recommended, setRecommended] = useState<Property[]>([]);
    const [newFlags, setNewFlags] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedGroupKeys, setExpandedGroupKeys] = useState<Set<string>>(new Set());
    const [markingAsReadIds, setMarkingAsReadIds] = useState<Set<number>>(new Set());

    // ⭐ 손님조건 + 추천매물 + NEW 로딩
    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;

            try {
                // 1️⃣ guestproperty 가져오기
                const { data: gp, error: gpError } = await supabase
                    .from("guestproperty")
                    .select("*")
                    .eq("id", id)
                    .single();

                if (gpError) throw gpError;
                setGuestProperty(gp);

                // 2️⃣ 추천 매물 가져오기 (소속 부동산 기반 필터링)
                const list = await fetchRecommendedProperties(gp.data, company);

                // ⭐ 최신순 정렬
                const sorted = list.sort((a, b) => {
                    const dateA = new Date(a.update_at || a.create_at).getTime();
                    const dateB = new Date(b.update_at || b.create_at).getTime();
                    return dateB - dateA;
                });

                setRecommended(sorted);

                // 3️⃣ NEW 데이터 로딩
                const { data: newRows, error: newErr } = await supabase
                    .from("guest_new_properties")
                    .select("property_id")
                    .eq("guestproperty_id", id)
                    .eq("is_read", false);

                if (newErr) throw newErr;

                setNewFlags(newRows?.map((r) => r.property_id) || []);
            } catch (err) {
                console.error("❌ 추천매물 로딩 오류:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const getTimeValue = (value: unknown): number => {
        if (typeof value === "string" || typeof value === "number" || value instanceof Date) {
            const parsed = new Date(value).getTime();
            return Number.isNaN(parsed) ? 0 : parsed;
        }
        return 0;
    };

    const normalizeAddressPart = (value: string | null | undefined): string => {
        return (value ?? "").trim().replace(/\s+/g, " ").toLowerCase();
    };

    const groupedRecommended = useMemo<GroupedProperty[]>(() => {
        const orderedKeys: string[] = [];
        const groupedMap = new Map<string, Property[]>();

        recommended.forEach((property) => {
            const data = property.data ?? {};
            const address = normalizeAddressPart(data.address);
            const dong = normalizeAddressPart(data.address_dong);
            const ho = normalizeAddressPart(data.address_ho);
            const keyBase = `${address}|${dong}|${ho}`;
            const groupKey = keyBase === "||" ? `__property_${property.id}` : keyBase;

            if (!groupedMap.has(groupKey)) {
                groupedMap.set(groupKey, []);
                orderedKeys.push(groupKey);
            }
            groupedMap.get(groupKey)?.push(property);
        });

        return orderedKeys
            .map((key): GroupedProperty | null => {
                const properties = groupedMap.get(key) ?? [];
                const sortedInGroup = [...properties].sort(
                    (a, b) => getTimeValue(b.create_at) - getTimeValue(a.create_at)
                );
                const [latest, ...older] = sortedInGroup;
                if (!latest) return null;
                return { key, latest, older };
            })
            .filter((group): group is GroupedProperty => group !== null);
    }, [recommended]);

    const visibleRows = useMemo(() => {
        return groupedRecommended.flatMap((group) => {
            const rows: Array<{ property: Property; groupKey: string; isReply: boolean; hasReplies: boolean }> = [
                {
                    property: group.latest,
                    groupKey: group.key,
                    isReply: false,
                    hasReplies: group.older.length > 0,
                },
            ];

            if (expandedGroupKeys.has(group.key)) {
                group.older.forEach((property) => {
                    rows.push({
                        property,
                        groupKey: group.key,
                        isReply: true,
                        hasReplies: false,
                    });
                });
            }

            return rows;
        });
    }, [groupedRecommended, expandedGroupKeys]);

    const olderCountByGroupKey = useMemo(() => {
        const countMap = new Map<string, number>();
        groupedRecommended.forEach((group) => {
            countMap.set(group.key, group.older.length);
        });
        return countMap;
    }, [groupedRecommended]);

    // ⭐ 클릭 시 읽음 처리 (DB + 부모창 반영)
    const handleMarkAsRead = async (propertyId: number) => {
        if (!newFlags.includes(propertyId)) return;
        if (markingAsReadIds.has(propertyId)) return;

        setMarkingAsReadIds((prev) => new Set(prev).add(propertyId));
        try {
            // DB 업데이트
            await supabase
                .from("guest_new_properties")
                .update({ 
                    is_read: true,
                    updated_at: new Date().toISOString(),   // ← 직접 updated_at 갱신 
                })
                .eq("guestproperty_id", id)
                .eq("property_id", propertyId);

            // popup UI도 즉시 반영
            setNewFlags((prev) => prev.filter((pid) => pid !== propertyId));

            // 부모창에 NEW 제거 요청
            window.opener?.postMessage(
                {
                    type: "MARK_NEW_READ",
                    guestproperty_id: Number(id),
                    property_id: propertyId,
                },
                "*"
            );
        } catch (e) {
            console.error("⚠️ 읽음 처리 오류:", e);
        } finally {
            setMarkingAsReadIds((prev) => {
                const next = new Set(prev);
                next.delete(propertyId);
                return next;
            });
        }
    };

    if (loading) {
        return <div className="p-6 text-center">추천 매물을 불러오는 중입니다...</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-lg font-bold mb-2">추천 매물 리스트</h1>
            <p className="text-sm text-gray-500 mb-4">
                손님 조건에 맞는 매물이 {recommended.length}건 발견되었습니다.
            </p>

            {visibleRows.length > 0 ? (
                <div className="flex flex-col gap-2">
                    {visibleRows.map((row) => {
                        const isNew = newFlags.includes(row.property.id);

                        return (
                            <div
                                key={`${row.groupKey}-${row.property.id}`}
                                onClick={() => {
                                    if (isNew) {
                                        void handleMarkAsRead(row.property.id);
                                    }
                                }}
                                className={`flex flex-col rounded-md transition
                                    ${isNew
                                        ? "border-2 border-red-500 shadow-md bg-white"
                                        : "border border-gray-200 hover:bg-gray-50"
                                    } ${row.isReply ? "border-l-4 border-l-gray-300 bg-gray-50" : ""}`}
                            >
                                <PropertyReadCard
                                    property={row.property}
                                    selected={false}
                                    isReply={row.isReply}
                                />
                                {!row.isReply && row.hasReplies && (
                                    <div className="px-4 pb-2">
                                        <button
                                            type="button"
                                            className="text-sm text-gray-600 hover:text-blue-600"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setExpandedGroupKeys((prev) => {
                                                    const next = new Set(prev);
                                                    if (next.has(row.groupKey)) {
                                                        next.delete(row.groupKey);
                                                    } else {
                                                        next.add(row.groupKey);
                                                    }
                                                    return next;
                                                });
                                            }}
                                        >
                                            {expandedGroupKeys.has(row.groupKey)
                                                ? `이전 등록 매물 ${olderCountByGroupKey.get(row.groupKey) ?? 0}개 숨기기`
                                                : `이전 등록 매물 ${olderCountByGroupKey.get(row.groupKey) ?? 0}개 보기`}
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-gray-400 text-center py-10">
                    조건에 맞는 매물이 없습니다.
                </div>
            )}
        </div>
    );
}

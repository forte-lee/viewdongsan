"use client";

import { Button, Separator } from "@/components/ui";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronUp } from "lucide-react";
import Image from "next/image";
import GuestCard from "@/app/guest/components/guestcard/GuestCard";
import { MyGuestListFilterPanel } from "@/app/guest/components/filters";
import { Label } from "@radix-ui/react-label";
import {
    useAuthCheck,
    useCreateGuest,
    useGetGuestAll,
    useGetGuestPropertyAll,
    useLoadGuestNewProperties,
    useSyncGuestNewProperties,
    useGetCompanyId,
} from "@/hooks/apis";
import { supabase } from "@/utils/supabase/client";
import { useAtomValue } from "jotai";
import { employeesAtom } from "@/store/atoms";

function GuestMylistPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const employeeIdParam = searchParams.get("employeeId");

    const createGuest = useCreateGuest();
    const { guests, getGuests } = useGetGuestAll();
    const { guestPropertyAll, getGuestPropertyAll } = useGetGuestPropertyAll();
    const [mergedGuests, setMergedGuests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuthCheck();
    const { company } = useGetCompanyId(user); // UUID 기반
    const employees = useAtomValue(employeesAtom);
    
    // 로그인한 사용자의 실제 employee_id 찾기 (UUID 기반)
    const loggedInEmployeeId = (() => {
        if (user?.id) {
            const employee = employees.find(emp => emp.supabase_user_id === user.id);
            if (employee) return employee.id;
        }
        return null;
    })();
    
    // 현재 사용자의 employee_id 찾기 (보안 검증은 useEffect에서 처리)
    const currentEmployeeId = (() => {
        // 1. 로그인한 사용자의 실제 employee_id를 먼저 가져옴
        const actualEmployeeId = loggedInEmployeeId;
        
        // 2. URL 파라미터에서 employeeId가 있으면 검증
        if (employeeIdParam) {
            const paramId = Number(employeeIdParam);
            if (!isNaN(paramId)) {
                // URL 파라미터의 employeeId가 로그인한 사용자의 employee_id와 일치하는지 확인
                if (actualEmployeeId !== null && paramId === actualEmployeeId) {
                    return paramId;
                }
                // 일치하지 않으면 null 반환 (useEffect에서 리다이렉트 처리)
                return null;
            }
        }
        
        // 3. URL 파라미터가 없거나 유효하지 않으면 로그인한 사용자의 employee_id 사용
        return actualEmployeeId;
    })();
    const [filterExpanded, setFilterExpanded] = useState<boolean>(false);
    const [sortKey, setSortKey] = useState<"create_at" | "update_at">("update_at");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    const [isGuestLoaded, setIsGuestLoaded] = useState(false);
    const [isGuestPropertyLoaded, setIsGuestPropertyLoaded] = useState(false);
    
    const [currentGuestId, setCurrentGuestId] = useState<number | null>(null);
    
    const loadGuestNewProperties = useLoadGuestNewProperties();


    const [filter, setFilter] = useState<{
        types: string[];
        propertys: string[];
        tradeTypes: string[];
        phoneKeyword: string;
        memoKeyword: string;
    }>({
        types: [],
        propertys: [],
        tradeTypes: [],
        phoneKeyword: "",
        memoKeyword: "",
    });


    // ⭐ 보안 검증: URL 파라미터의 employeeId가 로그인한 사용자의 employee_id와 일치하는지 확인
    useEffect(() => {
        if (employeeIdParam && loggedInEmployeeId !== null) {
            const paramId = Number(employeeIdParam);
            if (!isNaN(paramId) && paramId !== loggedInEmployeeId) {
                // 권한이 없는 경우 올바른 URL로 리다이렉트
                router.replace(`/guest/mylist?employeeId=${loggedInEmployeeId}`);
            }
        } else if (!employeeIdParam && loggedInEmployeeId !== null) {
            // URL 파라미터가 없으면 로그인한 사용자의 employee_id로 리다이렉트
            router.replace(`/guest/mylist?employeeId=${loggedInEmployeeId}`);
        }
    }, [employeeIdParam, loggedInEmployeeId, router]);

    // ⭐ 페이지 진입 시 추천 매물 동기화 + NEW 데이터 최신화
    useEffect(() => {
        const syncAndLoad = async () => {
            if (currentEmployeeId === null) {
                loadGuestNewProperties();
                return;
            }

            try {
                // 현재 사용자의 손님 목록 가져오기 (employee_id 기반)
                const { data: myGuests, error: guestsError } = await supabase
                    .from("guest")
                    .select("id")
                    .eq("employee_id", currentEmployeeId);

                if (guestsError) {
                    console.error("❌ 손님 목록 조회 실패:", guestsError);
                    loadGuestNewProperties();
                    return;
                }

                if (!myGuests || myGuests.length === 0) {
                    // 손님이 없으면 NEW 데이터만 로드
                    loadGuestNewProperties();
                    return;
                }

                // 2. 모든 손님에 대해 추천 매물 동기화 실행 (소속 부동산 기반 필터링)
                console.log("🔄 손님 관리 페이지 진입 - 추천 매물 동기화 시작");
                for (const guest of myGuests) {
                    try {
                        await useSyncGuestNewProperties(guest.id, { insert: true, companyId: company });
                    } catch (syncError) {
                        console.error(`❌ 매물 동기화 실패 (guestId: ${guest.id}):`, syncError);
                        // 개별 동기화 실패는 계속 진행
                    }
                }
                console.log("✅ 추천 매물 동기화 완료");

                // 3. 동기화 후 NEW 데이터 로드
                loadGuestNewProperties();
            } catch (error) {
                console.error("❌ 추천 매물 동기화 중 오류:", error);
                // 에러가 발생해도 NEW 데이터는 로드
                loadGuestNewProperties();
            }
        };

                syncAndLoad();
    }, [currentEmployeeId, company]);

    
    useEffect(() => {
        if (isGuestLoaded && currentEmployeeId !== null) {
            const guest = guests.find((g) => g.employee_id === currentEmployeeId);
            if (guest) setCurrentGuestId(guest.id);
        }
    }, [isGuestLoaded, guests, currentEmployeeId]);


    // ✅ 손님/손님매물 데이터 로드
    useEffect(() => {
        const fetchData = async () => {
            if (guests.length === 0) await getGuests();
            setIsGuestLoaded(true);

            if (guestPropertyAll.length === 0) await getGuestPropertyAll();
            setIsGuestPropertyLoaded(true);
        };
        fetchData();
    }, []);

    // ✅ 손님-손님매물 병합 (employee_id 기반)
    useEffect(() => {
        if (isGuestLoaded && isGuestPropertyLoaded && currentEmployeeId !== null) {
            const filteredGuests = guests.filter((guest) => guest.employee_id === currentEmployeeId);
            const mergedData = filteredGuests.map((guest) => ({
                ...guest,
                properties: guestPropertyAll.filter(
                    (property) => property.guest_id === guest.id
                ),
            }));
            setMergedGuests(mergedData);
            setIsLoading(false);
        }
    }, [isGuestLoaded, isGuestPropertyLoaded, guests, guestPropertyAll, currentEmployeeId]);

    // ✅ 필터 적용
    const filteredMergedGuests = mergedGuests
        .filter((guest) => {
            const noFilterApplied =
                filter.types.length === 0 &&
                filter.propertys.length === 0 &&
                filter.tradeTypes.length === 0 &&
                !filter.phoneKeyword &&
                !filter.memoKeyword;

            if (noFilterApplied) {
                // employee_id로 매칭
                return currentEmployeeId !== null && guest.employee_id === currentEmployeeId;
            }

            const guestProperties = guest.properties ?? [];
            const hasMatching = guestProperties.some((gp: any) => {
                const matchType =
                    filter.types.length === 0 || filter.types.includes(gp.type);
                const matchProperty =
                    filter.propertys.length === 0 ||
                    (Array.isArray(gp.data?.propertys)
                        ? gp.data.propertys.some((p: string) =>
                            filter.propertys.includes(p)
                        )
                        : filter.propertys.includes(gp.data?.propertys));
                const matchTradeType =
                    filter.tradeTypes.length === 0 ||
                    (Array.isArray(gp.data?.trade_types) &&
                        gp.data.trade_types.some((t: string) =>
                            filter.tradeTypes.includes(t)
                        ));
                const matchPhone =
                    !filter.phoneKeyword ||
                    (() => {
                        const raw = guest.data?.phone;
                        const keyword = filter.phoneKeyword.replace(/[^0-9]/g, "");
                        if (!raw || keyword === "") return true;
                        if (Array.isArray(raw)) {
                            return raw.some((p: string) =>
                                p.replace(/[^0-9]/g, "").includes(keyword)
                            );
                        } else if (typeof raw === "string") {
                            return raw.replace(/[^0-9]/g, "").includes(keyword);
                        }
                        return false;
                    })();

                const matchMemo = (() => {
                    const guestMemo = guest.data?.memo?.toLowerCase() || "";
                    const keyword = filter.memoKeyword.toLowerCase();
                    if (!keyword) return true;
                    const memoInGuest = guestMemo.includes(keyword);
                    const memoInGuestProperty = guestProperties.some((gp: any) => {
                        const extraMemo =
                            gp.data?.extra_memo?.toLowerCase?.() || "";
                        return extraMemo.includes(keyword);
                    });
                    return memoInGuest || memoInGuestProperty;
                })();

                return (
                    matchType &&
                    matchProperty &&
                    matchTradeType &&
                    matchPhone &&
                    matchMemo
                );
            });
            return hasMatching;
        })
        .sort((a, b) => {
            const dateA = new Date(a[sortKey]).getTime();
            const dateB = new Date(b[sortKey]).getTime();
            return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
        });

    // ✅ 새 손님 등록
    const handleTypeClick = async () => {
        try {
            await createGuest();
        } catch (error) {
            console.error("손님 등록 중 오류 발생:", error);
            alert("손님 등록 중 문제가 발생했습니다.");
        }
    };

    const handleDelete = (guestId: number) => {
        setMergedGuests((prev) => prev.filter((guest) => guest.id !== guestId));
    };

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (
                event.data?.type === "UPDATE_GUEST" ||
                event.data?.type === "UPDATE_GUEST_PROPERTY"
            ) {
                getGuests();
                getGuestPropertyAll();
            }
        };
        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center w-full h-full">
                <div className="text-xl font-semibold">로딩 중...</div>
            </div>
        );
    }    

    return (
        <>
            <div className="page__guest__header">
                <div className="flex flex-row justify-between items-center">
                    <div className="flex flex-row justify-between items-start">
                        <Button
                            variant={"outline"}
                            size={"icon"}
                            onClick={() => {
                                if (currentEmployeeId !== null) {
                                    router.push(`/guest/mylist?employeeId=${currentEmployeeId}`);
                                } else {
                                    alert("직원 정보를 찾을 수 없습니다.");
                                }
                            }}
                        >
                            <ChevronLeft />
                        </Button>
                        <div className="flex flex-row justify-start items-end gap-3 pl-4">
                            <Label className="text-3xl font-bold">손님 관리</Label>
                            <Label className="text-xl text-gray-500 font-bold">
                                ({`${user?.user_metadata.full_name || "사용자"}`}님의 손님)
                            </Label>
                        </div>
                    </div>
                    <Button
                        variant={"outline"}
                        className="font-normal text-white bg-blue-600 hover:text-white hover:bg-blue-400 w-1/6"
                        onClick={handleTypeClick}
                    >
                        새 손님등록
                    </Button>
                </div>

                <div className="page__guest__header__top mt-1">
                    <div className="flex flex-col gap-4 w-full">
                        <div className="flex justify-between items-center w-full">
                            <Button
                                variant="outline"
                                className="text-sm bg-gray-100 text-gray-800 hover:bg-gray-200 flex items-center gap-2 px-4 py-2"
                                onClick={() =>
                                    setFilterExpanded((prev: boolean) => !prev)
                                }
                            >
                                검색 조건
                                {filterExpanded ? (
                                    <ChevronUp size={16} />
                                ) : (
                                    <ChevronDown size={16} />
                                )}
                            </Button>
                            <div className="flex items-center gap-2">
                                <select
                                    value={sortKey}
                                    onChange={(e) =>
                                        setSortKey(
                                            e.target.value as
                                            | "create_at"
                                            | "update_at"
                                        )
                                    }
                                    className="border border-gray-300 bg-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                >
                                    <option value="update_at">수정일</option>
                                    <option value="create_at">등록일</option>
                                </select>
                                <select
                                    value={sortOrder}
                                    onChange={(e) =>
                                        setSortOrder(
                                            e.target.value as "asc" | "desc"
                                        )
                                    }
                                    className="border border-gray-300 bg-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                >
                                    <option value="desc">내림차순</option>
                                    <option value="asc">오름차순</option>
                                </select>
                            </div>
                        </div>

                        <div className={filterExpanded ? "block" : "hidden"}>
                            <MyGuestListFilterPanel onFilterChange={setFilter} />
                        </div>
                    </div>
                </div>
            </div>

            <Separator className="my-1" />
            <div className="page__guest__body">
                <div className="flex flex-col w-full items-center justify-start gap-1">
                    {filteredMergedGuests.length > 0 ? (
                        <div className="page__guest__body__isData">
                            {filteredMergedGuests.map((guest) => (
                                <GuestCard
                                    key={guest.id}
                                    guest={guest}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="page__manage__body__noData">
                            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                                등록된 손님이 없습니다.
                            </h3>
                            <small className="text-sm font-medium leading-none text-[#6d6d6d] mt-3 mb-7">
                                손님등록하기
                            </small>
                            <button onClick={handleTypeClick}>
                                <Image
                                    src={"/assets/images/button.svg"}
                                    width={74}
                                    height={74}
                                    alt="rounded-button"
                                />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default GuestMylistPage;

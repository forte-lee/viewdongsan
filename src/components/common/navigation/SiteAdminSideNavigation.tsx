"use client";

import { Button } from "@/components/ui";
import { useRouter } from "next/navigation";
import { Separator } from "@radix-ui/react-separator";

function SiteAdminSideNavigation() {
    const router = useRouter();

    return (
        <aside className="page__aside">
            <div className="flex flex-col h-full gap-3">
                <Button
                    variant={"outline"}
                    className={"font-normal bg-amber-50 text-amber-800 hover:text-white hover:bg-amber-600"}
                    onClick={() => router.push(`/manage`)}
                >
                    메인 페이지로 이동
                </Button>

                <Separator className="my-1" />

                <span className="text-xs font-semibold text-amber-600 px-2">사이트 관리자</span>

                <Button
                    variant={"secondary"}
                    className={"font-normal text-white bg-amber-600 hover:text-white hover:bg-amber-500"}
                    onClick={() => router.push("/site-admin/companies")}
                >
                    전체 회사 관리
                </Button>

                <Button
                    variant={"secondary"}
                    className={"font-normal text-white bg-amber-600 hover:text-white hover:bg-amber-500"}
                    onClick={() => router.push("/site-admin/employees")}
                >
                    전체 직원 관리
                </Button>

                <Separator className="my-1" />

                <Button
                    variant={"secondary"}
                    className={"font-normal text-white bg-amber-600 hover:text-white hover:bg-amber-500"}
                    onClick={() => router.push("/site-admin/properties")}
                >
                    전체 매물 관리
                </Button>
                <Button
                    variant={"secondary"}
                    className={"font-normal text-white bg-amber-600 hover:text-white hover:bg-amber-500"}
                    onClick={() => router.push("/site-admin/deleted")}
                >
                    삭제 매물 관리
                </Button>
            </div>
        </aside>
    );
}

export { SiteAdminSideNavigation };

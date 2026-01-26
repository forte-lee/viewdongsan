"use client";

import { Button } from "@/components/ui";
import { useRouter } from "next/navigation";
import { Separator } from "@radix-ui/react-separator";

function AdminSideNavigation() {
    const router = useRouter();
    
    return (
        <aside className="page__aside">
            <div className="flex flex-col h-full gap-3">
                <Button
                    variant={"outline"}
                    className={"font-normal bg-blue-50 text-blue-700 hover:text-white hover:bg-blue-600"}
                    onClick={() => router.push(`/manage`)}
                >
                    메인 페이지로 이동
                </Button>

                <Separator className="my-1" />

                <Button
                    variant={"secondary"}
                    className={"font-normal text-white bg-blue-600 hover:text-white hover:bg-blue-400"}
                    onClick={() => router.push("/admin/adminmanage/company")}
                >
                    회사 정보 관리
                </Button>

                <Button
                    variant={"secondary"}
                    className={"font-normal text-white bg-blue-600 hover:text-white hover:bg-blue-400"}
                    onClick={() => router.push("/admin/adminmanage/employees")}
                >
                    직원 관리
                </Button>

                <Separator className="my-1" />

                <Button
                    variant={"secondary"}
                    className={"font-normal text-white bg-blue-600 hover:text-white hover:bg-blue-400"}
                    onClick={() => router.push("/admin/adminmanage")}
                >
                    매물 관리
                </Button>
                <Button
                    variant={"secondary"}
                    className={"font-normal text-white bg-blue-600 hover:text-white hover:bg-blue-400"}
                    onClick={() => router.push("/admin/adminmanage/deleted")}
                >
                    삭제 매물 관리
                </Button>
            </div>
        </aside>
    );
}

export { AdminSideNavigation };


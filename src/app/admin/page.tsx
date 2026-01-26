"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

function AdminPage() {
    const router = useRouter();

    useEffect(() => {
        // 관리자 페이지 진입 시 adminmanage로 리다이렉트
        router.replace("/admin/adminmanage");
    }, [router]);

    return null;
}

export default AdminPage;


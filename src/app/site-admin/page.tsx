"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

function SiteAdminPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/site-admin/properties");
    }, [router]);

    return null;
}

export default SiteAdminPage;

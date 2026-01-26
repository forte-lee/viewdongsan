"use client";

import { SideNavigation } from "@/components/common/navigation/SideNavigation";

function ManageLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="page">
            <SideNavigation />
            <main className="page__manage relative">{children}</main>
        </div>
    );
}

export default ManageLayout;
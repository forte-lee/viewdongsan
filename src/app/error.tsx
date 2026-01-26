"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("애플리케이션 에러:", error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <h2 className="text-2xl font-bold mb-4">문제가 발생했습니다</h2>
            <p className="text-gray-600 mb-4">
                {error.message || "알 수 없는 오류가 발생했습니다."}
            </p>
            <Button onClick={reset}>다시 시도</Button>
        </div>
    );
}

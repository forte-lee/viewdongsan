"use client";

import React from "react";
import { Label } from "@/components/ui";

export interface GuestMemoFilterProps {
    memoKeyword: string;
    onChange: (value: string) => void;
}

function GuestMemoFilter({ memoKeyword, onChange }: GuestMemoFilterProps) {
    return (
        <div className="flex flex-col gap-2">
            <Label className="text-xl font-bold">메모 검색</Label>
            <input
                type="text"
                value={memoKeyword}
                onChange={(e) => onChange(e.target.value)}
                placeholder="메모 키워드 입력"
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
        </div>
    );
}

export { GuestMemoFilter };
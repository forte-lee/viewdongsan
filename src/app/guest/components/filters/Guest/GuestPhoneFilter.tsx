"use client";

import React from "react";
import { Label } from "@/components/ui";

export interface GuestPhoneFilterProps {
    phoneKeyword: string;
    onChange: (value: string) => void;
}

function GuestPhoneFilter({ phoneKeyword, onChange }: GuestPhoneFilterProps) {
    return (
        <div className="flex flex-col gap-2">
            <Label className="text-xl font-bold">연락처 검색</Label>
            <input
                type="text"
                value={phoneKeyword}
                onChange={(e) => onChange(e.target.value)}
                placeholder="01012341234 또는 1234"
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
        </div>
    );
}

export { GuestPhoneFilter };

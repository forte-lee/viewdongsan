"use client";

import React from "react";
import { Label } from "@/components/ui";
import clsx from "clsx";

const options = ["매매", "전세", "월세"];

export interface GuestTradeTypeFilterProps {
    selected: string[];
    onChange: (values: string[]) => void;
}

function GuestTradeTypeFilter({ selected, onChange }: GuestTradeTypeFilterProps) {
    const toggle = (type: string) => {
        if (selected.includes(type)) {
            onChange(selected.filter((t) => t !== type));
        } else {
            onChange([...selected, type]);
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <Label className="text-xl font-bold">거래 유형</Label>
            <div className="flex gap-2 flex-wrap">
                {options.map((type) => (
                    <button
                        key={type}
                        onClick={() => toggle(type)}
                        className={clsx(
                            "px-3 py-1 border rounded-full text-sm",
                            selected.includes(type)
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-gray-800 border-gray-300"
                        )}
                    >
                        {type}
                    </button>
                ))}
            </div>
        </div>
    );
}

export { GuestTradeTypeFilter };

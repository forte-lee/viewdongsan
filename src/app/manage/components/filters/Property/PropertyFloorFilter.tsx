"use client";

import React, { useEffect, useState } from "react";
import clsx from "clsx";
import { Label } from "@/components/ui";

export interface PropertyFloorFilterProps {
    onFilterChange: (selected: string[]) => void;
}

const FLOOR_OPTIONS = ["지하", "반지하", "1층", "지상", "옥탑"];

function PropertyFloorFilter({ onFilterChange }: PropertyFloorFilterProps) {
    const [selectedFloors, setSelectedFloors] = useState<string[]>([]);

    const toggleFloor = (floor: string) => {
        setSelectedFloors((prev) =>
            prev.includes(floor)
                ? prev.filter((f) => f !== floor)
                : [...prev, floor]
        );
    };

    useEffect(() => {
        onFilterChange(selectedFloors);
    }, [selectedFloors]);

    return (
        <div className="flex flex-col gap-3">
            <Label className="text-xl font-bold">층수</Label>
            <div className="flex flex-wrap gap-2 items-center">
                {FLOOR_OPTIONS.map((floor) => (
                    <button
                        key={floor}
                        onClick={() => toggleFloor(floor)}
                        className={clsx(
                            "px-3 py-1 border rounded-full text-sm",
                            selectedFloors.includes(floor)
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-gray-800 border-gray-300"
                        )}
                    >
                        {floor}
                    </button>
                ))}
            </div>
        </div>
    );
}

export { PropertyFloorFilter };

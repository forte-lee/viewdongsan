"use client";

import React from "react";
import { Checkbox } from "@/components/ui";
import { Label } from "@/components/ui";

export interface PropertyOtherFilterProps {
    hasParking?: boolean;
    petAllowed?: boolean;
    onChange: (options: { hasParking?: boolean; petAllowed?: boolean }) => void;
}

function PropertyOtherFilter({
    hasParking = false,
    petAllowed = false,
    onChange,
}: PropertyOtherFilterProps) {
    const handleChange = (key: "hasParking" | "petAllowed", value: boolean) => {
        onChange({ hasParking, petAllowed, [key]: value });
    };

    return (
        <div className="flex flex-col gap-3">
            <Label className="text-xl font-bold">기타 조건</Label>
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                    <Checkbox
                        id="hasParking"
                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        checked={hasParking}
                        onCheckedChange={(checked) =>
                            handleChange("hasParking", !!checked)
                        }
                    />
                    <Label htmlFor="hasParking">주차 가능</Label>
                </div>
                <div className="flex items-center gap-2">
                    <Checkbox
                        id="petAllowed"
                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        checked={petAllowed}
                        onCheckedChange={(checked) =>
                            handleChange("petAllowed", !!checked)
                        }
                    />
                    <Label htmlFor="petAllowed">반려동물 가능</Label>
                </div>
            </div>
        </div>
    );
}

export { PropertyOtherFilter };

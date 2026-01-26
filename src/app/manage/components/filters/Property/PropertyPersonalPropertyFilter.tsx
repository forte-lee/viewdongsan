"use client";

import React from "react";
import { Checkbox } from "@/components/ui";
import { Label } from "@/components/ui";

export interface PropertyPersonalPropertyFilterProps {
    isPersonalProperty?: boolean;
    onChange: (options: { isPersonalProperty?: boolean }) => void;
}

function PropertyPersonalPropertyFilter({
    isPersonalProperty = false,
    onChange,
}: PropertyPersonalPropertyFilterProps) {
    const handleChange = (checked: boolean) => {
        onChange({ isPersonalProperty: checked ? true : undefined });
    };

    return (
        <div className="flex flex-col gap-3">
            <Label className="text-xl font-bold">개인매물</Label>
            <div className="flex flex-col gap-3 text-sm">
                <div className="flex items-center gap-2">
                    <Checkbox
                        id="isPersonalProperty"
                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        checked={isPersonalProperty}
                        onCheckedChange={handleChange}
                    />
                    <Label htmlFor="isPersonalProperty">개인매물</Label>
                </div>
            </div>
        </div>
    );
}

export { PropertyPersonalPropertyFilter };


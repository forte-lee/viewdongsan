"use client";

import React from "react";
import { Checkbox } from "@/components/ui";
import { Label } from "@/components/ui";

export interface PropertyOnBoardFilterProps {
  onBoardedStates?: boolean[]; // [true, false] 포함 여부
  onChange: (options: { onBoardedStates?: boolean[] }) => void;
}

function PropertyOnBoardFilter({
  onBoardedStates = [true, false],
  onChange,
}: PropertyOnBoardFilterProps) {
  const handleToggle = (value: boolean) => {
    let updated: boolean[];
    if (onBoardedStates.includes(value)) {
      // 이미 선택된 값이면 제거
      updated = onBoardedStates.filter((v) => v !== value);
    } else {
      // 추가
      updated = [...onBoardedStates, value];
    }

    // 아무 것도 없거나 둘 다 선택 → 전체 선택
    if (updated.length === 0 || updated.length === 2) {
      onChange({ onBoardedStates: [true, false] });
    } else {
      onChange({ onBoardedStates: updated });
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <Label className="text-xl font-bold">등록 상태</Label>
      <div className="flex flex-col gap-3 text-sm">
        <div className="flex items-center gap-2">
          <Checkbox
            id="onBoardedTrue"
            checked={onBoardedStates.includes(true)}
            onCheckedChange={(checked) => handleToggle(true)}
            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
          />
          <Label htmlFor="onBoardedTrue">등록 ON</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="onBoardedFalse"
            checked={onBoardedStates.includes(false)}
            onCheckedChange={() => handleToggle(false)}
            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
          />
          <Label htmlFor="onBoardedFalse">등록 OFF</Label>
        </div>
      </div>
    </div>
  );
}

export { PropertyOnBoardFilter };
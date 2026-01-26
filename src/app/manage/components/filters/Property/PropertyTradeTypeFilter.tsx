"use client";

import React, { useState, useEffect } from "react";
import clsx from "clsx";
import { Label } from "@/components/ui";

export interface PropertyTradeTypeFilterProps {
  onChange: (filters: {
    transactionTypes: string[];
    priceRange: {
      trade_price?: [number | null, number | null];
      trade_deposit?: [number | null, number | null];
      trade_rent_deposit?: [number | null, number | null];
      trade_rent?: [number | null, number | null];
    };
  }) => void;
}

function PropertyTradeTypeFilter({ onChange }: PropertyTradeTypeFilterProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{
    trade_price?: [number | null, number | null];
    trade_deposit?: [number | null, number | null];
    trade_rent_deposit?: [number | null, number | null];
    trade_rent?: [number | null, number | null];
  }>({});

  const options = ["매매", "전세", "월세"];

  // 숫자 입력 방어: 빈문자/NaN → null
  const toNumOrNull = (v: string): number | null => {
    if (v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  // 선택 타입별 보유할 필드 맵
  const fieldsByType: Record<string, (keyof typeof priceRange)[]> = {
    "매매": ["trade_price"],
    "전세": ["trade_deposit"],
    "월세": ["trade_rent_deposit", "trade_rent"],
  };

  // 토글: 해제 시 해당 타입 관련 priceRange 삭제
  const toggle = (type: string) => {
    setSelected((prev) => {
      const updated = prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type];

      setPriceRange((pr) => {
        const next = { ...pr };
        const keep = new Set<keyof typeof pr>();
        updated.forEach((t) => (fieldsByType[t] ?? []).forEach((f) => keep.add(f)));
        (Object.keys(next) as (keyof typeof pr)[]).forEach((k) => {
          if (!keep.has(k)) delete next[k];
        });
        return next;
      });

      return updated;
    });
  };

  const handlePriceChange = (
    field: keyof typeof priceRange,
    index: 0 | 1,
    value: string
  ) => {
    setPriceRange((prev) => {
      const current = prev[field] ?? [null, null];
      const updated = [...current] as [number | null, number | null];
      updated[index] = toNumOrNull(value);
      return { ...prev, [field]: updated };
    });
  };

  useEffect(() => {
    onChange({ transactionTypes: selected, priceRange });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, priceRange]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label className="text-xl font-bold">거래 종류</Label>
        <div className="flex flex-wrap gap-2">
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

      {/* 매매 */}
      {selected.includes("매매") && (
        <div className="flex gap-2 items-center">
          <Label className="text-sm">매매 금액</Label>
          <input
            type="number"
            min={0}
            step={1}
            placeholder="최소"
            onChange={(e) => handlePriceChange("trade_price", 0, e.target.value)}
            className="border p-1 rounded"
          />
          <span>~</span>
          <input
            type="number"
            min={0}
            step={1}
            placeholder="최대"
            onChange={(e) => handlePriceChange("trade_price", 1, e.target.value)}
            className="border p-1 rounded"
          />
          <Label className="text-sm">만원</Label>
        </div>
      )}

      {/* 전세 */}
      {selected.includes("전세") && (
        <div className="flex gap-2 items-center">
          <Label className="text-sm">전세 보증금</Label>
          <input
            type="number"
            min={0}
            step={1}
            placeholder="최소"
            onChange={(e) => handlePriceChange("trade_deposit", 0, e.target.value)}
            className="border p-1 rounded"
          />
          <span>~</span>
          <input
            type="number"
            min={0}
            step={1}
            placeholder="최대"
            onChange={(e) => handlePriceChange("trade_deposit", 1, e.target.value)}
            className="border p-1 rounded"
          />
          <Label className="text-sm">만원</Label>
        </div>
      )}

      {/* 월세 */}
      {selected.includes("월세") && (
        <>
          <div className="flex gap-2 items-center">
            <Label className="text-sm">월세 보증금</Label>
            <input
              type="number"
              min={0}
              step={1}
              placeholder="최소"
              onChange={(e) =>
                handlePriceChange("trade_rent_deposit", 0, e.target.value)
              }
              className="border p-1 rounded"
            />
            <span>~</span>
            <input
              type="number"
              min={0}
              step={1}
              placeholder="최대"
              onChange={(e) =>
                handlePriceChange("trade_rent_deposit", 1, e.target.value)
              }
              className="border p-1 rounded"
            />
            <Label className="text-sm">만원</Label>
          </div>
          <div className="flex gap-2 items-center">
            <Label className="text-sm">월세 금액</Label>
            <input
              type="number"
              min={0}
              step={1}
              placeholder="최소"
              onChange={(e) => handlePriceChange("trade_rent", 0, e.target.value)}
              className="border p-1 rounded"
            />
            <span>~</span>
            <input
              type="number"
              min={0}
              step={1}
              placeholder="최대"
              onChange={(e) => handlePriceChange("trade_rent", 1, e.target.value)}
              className="border p-1 rounded"
            />
            <Label className="text-sm">만원</Label>
          </div>
        </>
      )}
    </div>
  );
}

export { PropertyTradeTypeFilter };

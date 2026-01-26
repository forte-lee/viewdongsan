"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { Command as CommandPrimitive } from "cmdk";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/";
import { Button } from "@/components/ui/";
import { Input } from "@/components/ui/";

interface ComboboxProps {
  options: string[];
  selected: string[];
  onSelect: (option: string) => void;
  placeholder?: string;
}

const Combobox = ({ options, selected, onSelect, placeholder }: ComboboxProps) => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          {selected.length > 0 ? selected.join(", ") : placeholder || "선택하세요"}
          <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-2">
        <CommandPrimitive>
          {/* ✅ 수정된 Input 컴포넌트 */}
          <Input
            type="text"
            placeholder="검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border-b p-2 text-sm focus:outline-none"
          />
          <CommandPrimitive.List className="max-h-[200px] overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <CommandPrimitive.Item
                  key={option}
                  value={option}
                  onSelect={() => onSelect(option)}
                  className={cn(
                    "cursor-pointer flex items-center justify-between px-3 py-2 text-sm hover:bg-blue-100",
                    selected.includes(option) && "bg-blue-500 text-white"
                  )}
                >
                  {option}
                  {selected.includes(option) && <Check className="h-4 w-4" />}
                </CommandPrimitive.Item>
              ))
            ) : (
              <div className="px-3 py-2 text-gray-500">검색 결과 없음</div>
            )}
          </CommandPrimitive.List>
        </CommandPrimitive>
      </PopoverContent>
    </Popover>
  );
};

export { Combobox };

"use client";

import React, { useEffect, useState } from "react";
import clsx from "clsx";
import { Label } from "@/components/ui";

export interface PropertyRoomFilterProps {
    onFilterChange: (selected: string[]) => void;
}

const ROOM_OPTIONS = ["원룸", "투룸", "쓰리룸", "4룸 이상"];

function PropertyRoomFilter({ onFilterChange }: PropertyRoomFilterProps) {
    const [selectedRooms, setSelectedRooms] = useState<string[]>([]);

    const toggleRoom = (room: string) => {
        setSelectedRooms((prev) =>
            prev.includes(room)
                ? prev.filter((r) => r !== room)
                : [...prev, room]
        );
    };

    useEffect(() => {
        onFilterChange(selectedRooms);
    }, [selectedRooms]);

    return (
        <div className="flex flex-col gap-3">
            <Label className="text-xl font-bold">룸 개수</Label>
            <div className="flex flex-wrap gap-2 items-center">
                {ROOM_OPTIONS.map((room) => (
                    <button
                        key={room}
                        onClick={() => toggleRoom(room)}
                        className={clsx(
                            "px-3 py-1 border rounded-full text-sm",
                            selectedRooms.includes(room)
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-gray-800 border-gray-300"
                        )}
                    >
                        {room}
                    </button>
                ))}
            </div>
        </div>
    );
}

export { PropertyRoomFilter };

"use client";

import { Card } from "@/components/ui";
import { Guest } from "@/types";
import { GuestCardHeader } from "./components/GuestCardHeader";
import { GuestCardDetail } from "./components/GuestCardDetail";
import { GuestCardMemo } from "./components/GuestCardMemo";

interface Props {
    guest: Guest;
    onDelete: (guest_id: number) => void;
}

function GuestCard({ guest, onDelete }: Props) {
    return (
        <Card className="flex flex-col w-full items-center">
            <div className="flex flex-row w-full p-1">
                <div className="flex flex-row">
                    <GuestCardHeader guest={guest} onDelete={onDelete} />
                </div>
                <div className="flex flex-col items-start">
                    <div>
                        <GuestCardDetail guest={guest} />
                    </div>
                    <div>
                        <GuestCardMemo guest={guest} />
                    </div>
                </div>
            </div>
        </Card>
    );
}

export default GuestCard;

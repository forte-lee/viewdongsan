import { Button, Checkbox, Input, Label } from '@/components/ui';
import React from 'react'

interface Props {
    roomCheck: boolean;
    roomNumber: string;
    roomBathRoomNumber: string;
    roomIsLivingRoom: string;
    onRoomCheckChange: (roomCheck: boolean) => void;
    onNumberChange: (roomNumber: string) => void;
    onBathRoomNumberChange: (roomBathRoomNumber: string) => void;
    onIsLivingRoomChange: (roomIsLivingRoom: string) => void;
}

function GuestRoomSection({ roomCheck, roomNumber, roomBathRoomNumber, roomIsLivingRoom, onRoomCheckChange, onNumberChange, onBathRoomNumberChange, onIsLivingRoomChange }: Props) {
    // ✅ Y 버튼 토글 핸들러
    const handleLivingRoomToggle = () => {
        // 현재 값이 "Y"면 ""로, 아니면 "Y"로 변경
        const newValue = roomIsLivingRoom === "Y" ? "" : "Y";
        onIsLivingRoomChange(newValue);
    };
    
    // ✅ 활성화 상태 확인
    const isActive = roomIsLivingRoom === "Y";
    
    return (
        <div className="flex flex-row p-1 items-center pt-3">
            <div className="flex flex-col w-[30px]">
                <Label
                    htmlFor={`room-checkbox`}
                    className="text-xs"
                >
                </Label>
                <Checkbox
                    id={`room-checkbox`}
                    checked={roomCheck}
                    onCheckedChange={() => onRoomCheckChange(!roomCheck)}
                />
            </div>
            <div className="flex flex-col w-[100px]">
                <Label className="text-base p-1 text-left">방구조</Label>
            </div>
            <div className="flex w-[100px] gap-3 pr-3 items-center">
                <Input
                    className="w-full text-left"
                    type="text"
                    placeholder="방수"
                    value={roomNumber}
                    onChange={(e) => onNumberChange(e.target.value)}
                />
            </div>
            <div className="flex w-[100px] gap-3 pr-3 items-center">
                <Input
                    className="w-full text-left"
                    type="text"
                    placeholder="욕실수"
                    value={roomBathRoomNumber}
                    onChange={(e) => onBathRoomNumberChange(e.target.value)}
                />
            </div>
            <div className="flex flex-row w-1/3 items-center space-x-2 p-1">
                <Label className="text-base w-1/3 gap-4 text-center">거실</Label>
                <Button
                    variant="outline"
                    className={`
                        p-5 text-sm border-solid border-[#ddd] cursor-pointer
                        ${isActive 
                            ? "bg-[#007bff] text-white border-[#0056b3] hover:bg-[#007bff] hover:text-white" 
                            : "text-black bg-[#f9f9f9] hover:bg-blue-100"
                        }
                    `}
                    onClick={handleLivingRoomToggle}
                >
                    Y
                </Button>
            </div>
        </div>
    )
}

export { GuestRoomSection }
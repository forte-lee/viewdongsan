import { Button, Input, Label } from "@/components/ui";

interface StructureSectionProps {
    propertytype: string | undefined;
    structure_room: string;            //방수
    structure_bathroom: string;        //화장실
    structure_living_room: string;     //거실유무
    structure_living_room_memo: string;     //비고

    onStructureRoomChange: (structure_room: string) => void;
    onStructureBathRoomChange: (structure_bathroom: string) => void;
    onStructureLivingRoomChange: (structure_living_room: string) => void;
    onStructureLivingRoomMemoChange: (structure_living_room_memo: string) => void;
}


function StructureSection({ propertytype, structure_room, structure_bathroom, structure_living_room, structure_living_room_memo,
    onStructureRoomChange, onStructureBathRoomChange, onStructureLivingRoomChange, onStructureLivingRoomMemoChange
}: StructureSectionProps) {
    const livingroom = (() => {
        switch (propertytype) {
            case "아파트":
                return ["거실있음", "거실없음"];
            case "오피스텔":
                return ["거실있음", "거실없음"];
            case "공동주택(아파트 외)":
                return ["거실있음", "거실없음"];
            case "단독주택(임대)":
                return ["거실있음", "거실없음"];
            case "상업/업무/공업용":
                return ["내부화장실", "외부화장실"];
            case "건물":
                return ["내부화장실", "외부화장실"];
            default:
                return [];
        }
    })();

    const isOffice = ["상업/업무/공업용", "건물"].includes(propertytype || "");

    return (
        <div className="flex-col p-3">
            <div className="flex pb-3">
                <Label className="text-xl font-bold gap-4">구조
                <span className="ml-2 px-1.5 py-0.5 rounded bg-red-600 text-white text-sm font-semibold">필수</span>
                </Label>
            </div>
            <div className="flex flex-row w-full">
                <div className="flex flex-row w-5/12 items-center justify-between p-1">
                    <div className="flex flex-row w-1/2 items-center space-x-2 p-1">
                        <Label className="text-base w-1/2 text-center">
                            {isOffice ? "룸" : "방수"}
                        </Label>                                                
                        <Input
                            className="w-1/2 font-bold text-right"
                            type="text"
                            placeholder="0"
                            value={structure_room}
                            onChange={(e) => {
                                const numericValue = e.target.value.replace(/[^0-9]/g, ""); // 숫자만 허용
                                const formattedValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ","); // 천 단위 콤마 추가
                                onStructureRoomChange(formattedValue);
                            }}
                        />
                    </div>
                    <div className="flex flex-row w-1/2 items-center space-x-2 p-1">
                        <Label className="text-base w-1/2 text-center">
                            {isOffice ? "화장실" : "욕실수"}
                        </Label>
                        <Input
                            className="w-1/2 font-bold text-right"
                            type="text"
                            placeholder="0"
                            value={structure_bathroom}
                            onChange={(e) => {
                                const numericValue = e.target.value.replace(/[^0-9]/g, ""); // 숫자만 허용
                                const formattedValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ","); // 천 단위 콤마 추가
                                onStructureBathRoomChange(formattedValue);
                            }}
                        />
                    </div>
                </div>
                <div className="flex flex-row w-7/12 items-center p-1">
                    <div className="flex flex-row w-1/2 items-center justify-end space-x-2 p-1">
                        {livingroom.map((data) => (
                            <Button
                                key={data}
                                variant="outline"
                                className={`
                                ${"p-3 text-sm border-solid text-black border-[#ddd] bg-[#f9f9f9] hover:bg-blue-100 cursor-pointer"} 
                                ${structure_living_room === data ? "bg-[#007bff] text-white border-[#0056b3] hover:bg-[#007bff] hover:text-white]" : ""
                                    }`}
                                onClick={() => onStructureLivingRoomChange(data)}
                            >
                                {data}
                            </Button>
                        ))}        
                    </div>
                    <div className="flex flex-row w-1/2 items-center space-x-2 p-1">
                        <Input
                            className="flex w-full"
                            type="text"
                            placeholder="비고"
                            value={structure_living_room_memo}
                            onChange={(e) => onStructureLivingRoomMemoChange(e.target.value || "-")}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export { StructureSection }
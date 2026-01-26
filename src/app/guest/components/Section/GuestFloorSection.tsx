import { Button, Label, Input, Checkbox } from "@/components/ui";

interface Props {
    type: string | undefined;

    floorCheck: boolean;
    floortypes?: string[];
    onFloorCheckChange: (floorCheck: boolean) => void; 
    onFloorTypeSelect: (floortypes: string) => void; 
}

function GuestFloorSection({
    type,floorCheck,
    floortypes = [],
    onFloorCheckChange,
    onFloorTypeSelect,

}: Props) {
    const floorTypes = (() => {
        switch (type) {
            case "주거":
                return ["지상", "지하", "상관없음"];
            case "상가/사무실/산업":
                return ["1층", "지상", "지하", "단층", "연층"];
            default:
                return ["지상", "지하", "상관없음"];
        }
    })();

    return (        
        <div className="flex flex-row p-1 items-center pt-3">
            <div className="flex flex-col w-[30px]">
                <Label
                    htmlFor={`floor-checkbox`}
                    className="text-xs"
                >
                </Label>
                <Checkbox
                    id={`floor-checkbox`}
                    checked={floorCheck}
                    onCheckedChange={() => onFloorCheckChange(!floorCheck)}
                />
            </div>
            <div className="flex flex-col w-[100px]">
                <Label className="text-base p-1 text-left">층수</Label>
            </div>            
            <div className="flex flex-row w-[400px] gap-2 items-center">
                {floorTypes.map((floorType) => (
                    <Button
                        key={floorType}
                        variant="outline"
                        className={`p-5 text-sm border-solid text-black border-[#ddd] bg-[#f9f9f9] hover:bg-blue-100 cursor-pointer ${floortypes.includes(floorType)
                            ? "bg-[#007bff] text-white border-[#0056b3] hover:bg-[#007bff] hover:text-white"
                            : ""
                            }`}
                        onClick={() => onFloorTypeSelect(floorType)}
                    >
                        {floorType}
                    </Button>
                ))}
            </div>
        </div>
    );
}

export { GuestFloorSection };

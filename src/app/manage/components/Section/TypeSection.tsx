import { Button, Label } from "@/components/ui";

interface TypeSectionProps {
    propertytype: string | undefined;
    selectedType: string;
    onTypeSelect: (selectedType: string) => void;
}

function TypeSection({ propertytype, selectedType, onTypeSelect }: TypeSectionProps) {
    
    const types = (() => {
        switch (propertytype) {
            case "아파트":
                return ["아파트"];
            case "오피스텔":
                return ["오피스텔"];
            case "공동주택(아파트 외)":
                return ["공동주택"];
            case "단독주택(임대)":
                return ["단독주택"];
            case "상업/업무/공업용":
                return ["상가", "사무실", "산업용"];
            case "건물":
                return ["건물"];
            case "토지":
                return ["토지"];
            default:
                return ["아파트", "오피스텔", "공동주택", "단독주택", "상가", "사무실", "건물", "토지"];
        }
    })();

    return (
        <div className="flex-col p-3">
            <div className="flex pb-3">
                <Label className="text-xl font-bold gap-4">매물종류
                <span className="ml-2 px-1.5 py-0.5 rounded bg-red-600 text-white text-sm font-semibold">필수</span>
                </Label>
            </div>
            <div className="flex gap-3">
                {types.map((data) => (
                    <Button
                        key={data}
                        variant="outline"                                                
                        className={`
                            ${"p-5 text-sm border-solid text-black border-[#ddd] bg-[#f9f9f9] hover:bg-blue-100 cursor-pointer"} 
                            ${selectedType === data ? "bg-[#007bff] text-white border-[#0056b3] hover:bg-[#007bff] hover:text-white]" : ""
                                }`}
                        onClick={() => onTypeSelect(data)}
                    >
                        {data}
                    </Button>
                ))}
            </div>
        </div>
    )
}

export { TypeSection }
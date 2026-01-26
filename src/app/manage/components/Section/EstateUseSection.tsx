import { Button, Label } from "@/components/ui";

interface EstateUseSectionProps {
    propertytype: string | undefined;
    selectedEstateUse: string;
    onEstateUseSelect: (estateuse: string) => void;
}

function EstateUseSection({ propertytype, selectedEstateUse, onEstateUseSelect }: EstateUseSectionProps) {

    const uses = (() => {
        switch (propertytype) {
            case "아파트":
                return ["아파트", "도시생활주택", "분양권", "기타"];
            case "오피스텔":
                return ["분양권", "오피스텔(주거용)", "오피스텔(사업자)", "기타"];
            case "공동주택(아파트 외)":
                return ["도시생활주택", "분양권", "다세대", "연립", "기타"];
            case "단독주택(임대)":
                return ["다가구", "다중주택", "단독주택", "근린생활시설", "기타"];
            case "상업/업무/공업용":
                return ["1종근린생활", "2종근린생활", "업무시설", "대형빌딩", "꼬마빌딩", "의료시설", "공장", "창고", "숙박", "지식산업센터", "기타"];
            case "건물":
                return ["상가주택", "다세대 통", "단독주택(다가구)", "근린생활시설", "중소형빌딩", "대형빌딩", "공장", "창고", "기타"];
            case "토지":
                return ["대", "전", "답", "임야", "과수원", "목장용지", "광천지", "염전", "공장용지", "학교용지", "주유소용지", "창고용지", "도로", "철도용지", "제방", "하천", "구거", "유지", "양어장", "수도용지", "공원", "체육용지", "유원지", "종교용지", "사적지", "묘지", "잡종지", "기타"];
            default:
                return [];
        }
    })();
    
    return (
        <div className="flex-col p-3">
            <div className="flex pb-3">
                <Label className="text-xl font-bold gap-4">용도
                <span className="ml-2 px-1.5 py-0.5 rounded bg-red-600 text-white text-sm font-semibold">필수</span>
                </Label>
            </div>
            <div className="grid grid-cols-7 gap-3">
                {uses.map((data) => (
                    <Button
                        key={data}
                        variant="outline"
                        className={`
                            ${"p-5 text-sm border-solid text-black border-[#ddd] bg-[#f9f9f9] hover:bg-blue-100 cursor-pointer"} 
                            ${selectedEstateUse === data ? "bg-[#007bff] text-white border-[#0056b3] hover:bg-[#007bff] hover:text-white]" : ""
                                }`}
                        onClick={() => onEstateUseSelect(data)}
                    >
                        {data}
                    </Button>
                ))}
            </div>
        </div>
    );
}

export { EstateUseSection }
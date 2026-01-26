import { Input, Label } from "@/components/ui";

interface LandUseSectionProps {
    landuse: string;
    landuse_memo: string;
    onLandUseSelect: (landuse: string) => void;
    onLandUseMemoChange: (landuse_memo: string) => void;
}

function LandUseSection({ landuse, landuse_memo, onLandUseSelect, onLandUseMemoChange }: LandUseSectionProps) {
    // 용도 옵션 목록
    const options = ["1종 전용주거", "2종 전용주거", "1종 일반주거", "2종 일반주거", "3종 일반주거", "준주거", "중심 상업", 
        "일반 상업", "근린 상업", "유통 상업", "전용 공업", "일반 공업", "준공업", "보전 녹지", "생산 녹지", "자연 녹지", 
        "보전 관리", "생산 관리", "계획 관리", "농림", "자연환경보전"];
    
    return (
        <div className="flex-col p-3">
            <div className="flex pb-3">
                <Label className="text-xl font-bold gap-4">용도지역
                <span className="ml-2 px-1.5 py-0.5 rounded bg-red-600 text-white text-sm font-semibold">필수</span>
                </Label>
            </div>

            {/* 콤보박스 (드롭다운) */}
            <div className="flex items-center space-x-2 p-1">
                <select
                    className="w-1/2 p-2 border border-gray-300 rounded-md bg-white cursor-pointer"
                    value={landuse}
                    onChange={(e) => onLandUseSelect(e.target.value)}
                >
                    <option value="" disabled>용도지역 선택</option>
                    {options.map((data) => (
                        <option key={data} value={data}>
                            {data}
                        </option>
                    ))}
                </select>
            </div>

            {/* "직접입력" 선택 시 입력 필드 표시 */}
            {landuse === "직접입력" && (
                <div className="flex flex-row w-full items-center space-x-2 p-1">
                    <div className="w-1/2 flex gap-3 items-center">
                        <Input
                            className="w-full font-bold text-left"
                            type="text"
                            placeholder="직접입력"
                            value={landuse_memo}
                            onChange={(e) => onLandUseMemoChange(e.target.value)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export { LandUseSection }
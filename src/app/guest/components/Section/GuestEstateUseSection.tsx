import { Button, Checkbox, Label } from "@/components/ui";
import React from "react";
import { Combobox } from "@/components/ui/";

interface Props {
    type: string | undefined;
    estateUseCheck: boolean;
    estateUse: string[];
    onEstateUseCheckChange: (estateNameCheck: boolean) => void;
    onEstateUseToggle: (estateName: string[]) => void;
}

function GuestEstateUseSection({ type, estateUseCheck, estateUse, onEstateUseCheckChange, onEstateUseToggle }: Props) {
    // 용도 옵션 목록
    const options = (() => {
        switch (type) {
            case "주거":
                return ["아파트", "오피스텔", "빌라"];
            case "상가/사무실/산업":
                return ["1종근린생활", "2종근린생활", "업무시설", "대형빌딩", "꼬마빌딩", "오피스텔", "의료시설", "공장", "창고", "숙박", "지식산업센터", "기타"];
            case "건물":
                return ["상가주택", "다세대 통", "단독주택(다가구)", "근린생활시설", "중소형빌딩", "대형빌딩", "공장", "창고", "기타"];
            case "토지":
                return ["대", "전", "답", "임야", "과수원", "목장용지", "광천지", "염전", "공장용지", "학교용지", "주유소용지", "창고용지", "도로", "철도용지", "제방", "하천", "구거", "유지", "양어장", "수도용지", "공원", "체육용지", "유원지", "종교용지", "사적지", "묘지", "잡종지", "기타"];
            default:
                return ["아파트", "오피스텔", "공동주택", "단독주택", "상가", "사무실", "건물", "토지"];
        }
    })();

    const allOptions = ["전체선택", ...options]; // ✅ 전체선택 추가

    // 선택 변경 핸들러
    const handleSelect = (value: string) => {
        if (value === "전체선택") {
            // ✅ 전체선택 클릭 시 모든 항목 선택/해제
            if (estateUse.length === options.length) {
                onEstateUseToggle([]); // 전체 해제
            } else {
                onEstateUseToggle([...options]); // 전체 선택
            }
        } else {
            // ✅ 개별 선택
            if (estateUse.includes(value)) {
                onEstateUseToggle(estateUse.filter((item) => item !== value)); // 제거
            } else {
                onEstateUseToggle([...estateUse, value]); // 추가
            }
        }
    };

    return (
        <div className="flex flex-col">
            {/* 지목 선택 */}
            <div className="flex flex-row p-1 items-center pt-3">
                <div className="flex flex-col w-[30px]">
                    <Label
                        htmlFor={`estatename-checkbox`}
                        className="text-xs"                            
                    >
                    </Label>
                    <Checkbox
                        id={`estatename-checkbox`}
                        checked={estateUseCheck}
                        onCheckedChange={() => onEstateUseCheckChange(!estateUseCheck)}
                    />
                </div>
                <div className="flex flex-col w-[100px]">
                    <Label className="text-base p-1 text-left">건축물용도</Label>
                </div>

                <div className="flex flex-col w-[600px]">
                    {/* ✅ Combobox (전체선택 포함) */}
                    <div className="flex w-[300px]">
                        <Combobox
                            options={allOptions} // ✅ "전체선택" 추가
                            selected={estateUse.length === options.length ? ["전체선택"] : estateUse}
                            onSelect={handleSelect}
                            placeholder="건축물용도 선택"
                        />
                    </div>

                    {/* 선택된 값 목록 */}
                    {estateUse.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {estateUse.map((item) => (
                                <Button
                                    key={item}
                                    variant="outline"
                                    className="text-sm border-gray-300 bg-gray-100 hover:bg-red-200 cursor-pointer px-3 py-1"
                                    onClick={() => onEstateUseToggle(estateUse.filter((i) => i !== item))}
                                >
                                    {item} ✕
                                </Button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export { GuestEstateUseSection };

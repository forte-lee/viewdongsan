import { Button, Input, Label } from '@/components/ui';
import React, { useState } from 'react'

interface HouseSectionProps {
    house_options?: string[];              //옵션
    house_options_memo: string;
    house_security?: string[];             //보안
    house_security_memo: string;
    house_other?: string[];                //기타사항
    house_other_memo: string;
    house_aircon?: string[]; // 선택된 에어컨 종류

    onHouseOptionsChange: (house_options: string) => void;
    onHouseOptionsMemoChange: (house_options_memo: string) => void;
    onHouseSecurityChange: (house_security: string) => void;
    onHouseSecurityMemoChange: (house_security_memo: string) => void;
    onHouseOtherChange: (house_other: string) => void;
    onHouseOtherMemoChange: (house_other_memo: string) => void;
    onHouseAirconChange: (house_aircon: string) => void; // 에어컨 종류 업데이트 핸들러
}

function HouseSection({
    house_options = [],
    house_options_memo,
    house_security = [],
    house_security_memo,
    house_other = [],
    house_other_memo,
    house_aircon = [],
    onHouseOptionsChange,
    onHouseOptionsMemoChange,
    onHouseSecurityChange,
    onHouseSecurityMemoChange,
    onHouseOtherChange,
    onHouseOtherMemoChange,
    onHouseAirconChange,
}: HouseSectionProps) {
    const options = ["에어컨", "세탁기", "냉장고", "싱크대", "가스렌지", "인덕션", "침대", "책상", "옷장", "붙박이장", "식탁", "소파", "신발장", "건조기", "샤워부스", "욕조", "비데", "식기세척기", "전자레인지", "가스오븐", "TV"];

    const securitys = ["경비원", "비디오폰", "인터폰", "카드키", "CCTV", "현관보안", "방범창"];
    const others = ["엘리베이터", "화재경보", "베란다", "테라스", "마당", "택배함", "커뮤니티"];

    const airconTypes = ["벽걸이", "스탠드", "천장형"]; // 에어컨 종류

    return (
        <>
            <div className="flex-col p-3">
                <div className="flex pb-3">
                    <Label className="text-xl font-bold gap-4">옵션
                    <span className="ml-2 px-1.5 py-0.5 rounded bg-red-600 text-white text-sm font-semibold">필수</span>
                    </Label>
                </div>
                <div>
                    <div className="grid grid-cols-7 gap-3 p-3">
                        {options.map((data) => (
                            <Button
                                key={data}
                                variant="outline"
                                className={`p-5 text-sm border-solid text-black border-[#ddd] bg-[#f9f9f9] hover:bg-blue-100 cursor-pointer 
                                    ${house_options.includes(data) ? "bg-[#007bff] text-white border-[#0056b3] hover:bg-[#007bff] hover:text-white]" : ""
                                    }`}
                                onClick={() => {
                                    if (data === "에어컨") {
                                        // "에어컨" 선택 시/해제 시 처리
                                        if (house_options.includes("에어컨")) {
                                            // 해제 시 에어컨 초기화
                                            onHouseOptionsChange("에어컨");
                                            // 에어컨 종류는 빈 배열로 초기화 (각 등록 페이지에서 처리)
                                        } else {
                                            // 선택 시
                                            onHouseOptionsChange("에어컨");
                                        }
                                    } else {
                                        onHouseOptionsChange(data);
                                    }
                                }}
                            >
                                {data}
                            </Button>
                        ))}
                    </div>
                    <div className="flex flex-auto w-full p-3">
                        <Input
                            className="flex font-bold text-left"
                            type="text"
                            placeholder="확인필요, 없음 등"
                            value={house_options_memo}
                            onChange={(e) => onHouseOptionsMemoChange(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* 에어컨 종류 선택 */}
            {house_options.includes("에어컨") && (
                <div className="flex-col p-3">
                    <div className="flex pb-3">
                        <Label className="text-xl font-bold gap-4">에어컨</Label>
                    </div>
                    <div className="mt-3">
                        <div className="grid grid-cols-3 gap-3">
                            {airconTypes.map((type) => (
                                <Button
                                    key={type}
                                    variant="outline"
                                    className={`p-3 text-sm border-solid text-black border-[#ddd] bg-[#f9f9f9] hover:bg-blue-100 cursor-pointer 
                                        ${house_aircon.includes(type) ? "bg-[#007bff] text-white border-[#0056b3] hover:bg-[#007bff] hover:text-white]" : ""
                                        }`}
                                    onClick={() => onHouseAirconChange(type)}
                                >
                                    {type}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-col p-3">
                <div className="flex pb-3">
                    <Label className="text-xl font-bold gap-3">보안</Label>
                </div>
                <div className="grid grid-cols-7 gap-3 p-3">
                    {securitys.map((data) => (
                        <Button
                            key={data}
                            variant="outline"
                            className={`
                                ${"p-5 text-sm border-solid text-black border-[#ddd] bg-[#f9f9f9] hover:bg-blue-100 cursor-pointer"} 
                                ${house_security.includes(data) ? "bg-[#007bff] text-white border-[#0056b3] hover:bg-[#007bff] hover:text-white]" : ""
                                }`}
                            onClick={() => onHouseSecurityChange(data)}
                        >
                            {data}
                        </Button>
                    ))}
                </div>
                <div className="flex flex-auto w-full p-3">
                    <Input
                        className="flex font-bold text-left"
                        type="text"
                        placeholder="비고"
                        value={house_security_memo}
                        onChange={(e) => onHouseSecurityMemoChange(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-col p-3">
                <div className="flex pb-3">
                    <Label className="text-xl font-bold gap-4">기타</Label>
                </div>
                <div className="grid grid-cols-7 gap-3 p-3">
                    {others.map((data) => (
                        <Button
                            key={data}
                            variant="outline"
                            className={`
                                ${"p-5 text-sm border-solid text-black border-[#ddd] bg-[#f9f9f9] hover:bg-blue-100 cursor-pointer"} 
                                ${house_other.includes(data) ? "bg-[#007bff] text-white border-[#0056b3] hover:bg-[#007bff] hover:text-white]" : ""
                                }`}
                            onClick={() => onHouseOtherChange(data)}
                        >
                            {data}
                        </Button>
                    ))}
                </div>
                <div className="flex flex-auto w-full p-3">
                    <Input
                        className="flex font-bold text-left"
                        type="text"
                        placeholder="비고"
                        value={house_other_memo}
                        onChange={(e) => onHouseOtherMemoChange(e.target.value)}
                    />
                </div>
            </div>
        </>
    )
}

export { HouseSection }
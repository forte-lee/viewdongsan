import { Button, Label, Input, Checkbox } from "@/components/ui";
import { formatNumberInput } from "@/utils/formatNumberInput";
import { numberToKorean } from "@/utils/numberToKorean";
import { useEffect, useState } from "react";

interface TradeInfoSectionProps {
    propertytype: string | undefined;

    selectedTradeType?: string[]; // 선택된 거래종류
    onTradeTypeSelect: (tradeType: string) => void; // 거래종류 선택 핸들러
    tradePrice?: string; // 매매가
    tradePriceVAT: boolean;   //VAT별도
    tradeDeposit?: string; // 전세 보증금
    tradeRent?: string; // 월세
    tradeRentVAT: boolean;     //VAT별도
    tradeRentDeposit?: string; // 월세 보증금
    tradeRentSub?: string; // 월세
    tradeRentSubVAT: boolean;
    tradeRentDepositSub?: string; // 월세 보증금
    onTradePriceChange?: (tradePrice: string) => void; // 매매가 변경 핸들러
    onTradePriceVATChange: (tradePriceVAT: boolean) => void;   //매매가 VAT 여부
    onTradeDepositChange?: (tradeDeposit: string) => void; // 전세 보증금 변경 핸들러
    onTradeRentChange?: (tradeRent: string) => void; // 월세 변경 핸들러
    onTradeRentVATChange: (tradeRentVAT: boolean) => void;     //월세 VAT 여부
    onTradeRentDepositChange?: (tradeRentDeposit: string) => void; // 월세 보증금 변경 핸들러
    onTradeRentSubChange?: (tradeRentSub: string) => void; // 월세 변경 핸들러
    onTradeRentSubVATChange: (tradeRentSubVAT: boolean) => void;   //월세 VAT 여부
    onTradeRentDepositSubChange?: (tradeRentDepositSub: string) => void; // 월세 보증금 변경 핸들러
}

function TradeInfoSection({
    propertytype,
    selectedTradeType = [],
    onTradeTypeSelect,
    tradePrice = "",
    tradePriceVAT = false,
    tradeDeposit = "",
    tradeRent = "",
    tradeRentVAT = false,
    tradeRentDeposit = "",
    tradeRentSub = "",
    tradeRentSubVAT = false,
    tradeRentDepositSub = "",
    onTradePriceChange,
    onTradePriceVATChange,
    onTradeDepositChange,
    onTradeRentChange,
    onTradeRentVATChange,
    onTradeRentDepositChange,
    onTradeRentSubChange,
    onTradeRentSubVATChange,
    onTradeRentDepositSubChange,
}: TradeInfoSectionProps) {
    const tradeTypes = (() => {
        switch (propertytype) {
            case "토지":
                return ["매매", "월세"];
            case "건물":
                return ["매매", "월세"];
            case "상업/업무/공업용":
                return ["매매", "월세"];
            case "단독주택(임대)":
                return ["전세", "월세"];
            default:
                return ["매매", "전세", "월세"];
        }
    })();

    const isVATApplicable = ["오피스텔", "상업/업무/공업용", "건물"].includes(propertytype || "");
    const [showSubRent, setShowSubRent] = useState(false);

    useEffect(() => {
        if (
            (tradeRentSub && tradeRentSub.trim() !== "") ||
            (tradeRentDepositSub && tradeRentDepositSub.trim() !== "")
        ) {
            setShowSubRent(true);
        }
    }, [tradeRentSub, tradeRentDepositSub]);


    return (
        <div className="flex-col p-3">
            {/* 거래종류 섹션 */}
            <div className="flex pb-3">
                <Label className="text-xl font-bold gap-4">거래종류
                    <span className="ml-2 px-1.5 py-0.5 rounded bg-red-600 text-white text-sm font-semibold">필수</span>
                </Label>
            </div>
            <div className="flex gap-3 mb-4">
                {tradeTypes.map((tradeType) => (
                    <Button
                        key={tradeType}
                        variant="outline"
                        className={`p-5 text-sm border-solid text-black border-[#ddd] bg-[#f9f9f9] hover:bg-blue-100 cursor-pointer ${selectedTradeType.includes(tradeType)
                            ? "bg-[#007bff] text-white border-[#0056b3] hover:bg-[#007bff] hover:text-white"
                            : ""
                            }`}
                        onClick={() => onTradeTypeSelect(tradeType)}
                    >
                        {tradeType}
                    </Button>
                ))}
            </div>

            {/* 거래 금액 섹션 */}
            {selectedTradeType.includes("매매") && (
                <div>
                    <div className="flex w-1/2 items-center space-x-2 p-1">
                        <Label className="text-base w-1/2 text-left">매매가</Label>
                        <Input
                            className="flex text-right"
                            type="text"
                            placeholder="10,000"
                            value={tradePrice}
                            onChange={(e) => onTradePriceChange?.(formatNumberInput(e.target.value))}
                        />
                        <Label className="text-base w-1/4">만원</Label>

                        {isVATApplicable && (
                            <>
                                <Checkbox
                                    id={`pricevat-checkbox`}
                                    checked={tradePriceVAT}
                                    onCheckedChange={() => onTradePriceVATChange(!tradePriceVAT)}
                                />
                                <Label
                                    htmlFor={`pricevat-checkbox`}
                                    className="w-1/2 text-base"
                                >
                                    VAT별도
                                </Label>
                            </>
                        )}
                    </div>

                    <div className="flex w-1/2 items-center space-x-2 p-1">
                        <Label className="flex w-full text-right text-sm justify-center text-gray-500">
                            {numberToKorean(tradePrice.replace(/,/g, ""))}
                        </Label>
                    </div>
                </div>
            )}

            {selectedTradeType.includes("전세") && (
                <div>
                    <div className="flex w-1/2 items-center space-x-2 p-1">
                        <Label className="text-base w-1/2 text-left">전세 보증금</Label>
                        <Input
                            className="flex text-right"
                            type="text"
                            placeholder="10,000"
                            value={tradeDeposit}
                            onChange={(e) => onTradeDepositChange?.(formatNumberInput(e.target.value))}
                        />
                        <Label className="text-base w-1/4">만원</Label>

                    </div>

                    <div className="flex w-1/2 items-center space-x-2 p-1">
                        <Label className="flex w-full text-sm text-right justify-center text-gray-500">
                            {numberToKorean(tradeDeposit.replace(/,/g, ""))}
                        </Label>
                    </div>
                </div>
            )}

            {selectedTradeType.includes("월세") && (
                <div className="flex flex-col w-full">
                    <div className="flex flex-row">
                        <div className="flex flex-col w-1/2">
                            <div className="flex w-full items-center space-x-2 p-1">
                                <Label className="text-base w-1/2 text-left">월세 보증금</Label>
                                <Input
                                    className="flex text-right"
                                    type="text"
                                    placeholder="10,000"
                                    value={tradeRentDeposit}
                                    onChange={(e) => onTradeRentDepositChange?.(formatNumberInput(e.target.value))}
                                />
                                <Label className="text-base w-1/4">만원</Label>
                            </div>

                            <div className="flex w-full items-center space-x-2 p-1">
                                <Label className="flex w-full text-sm text-right justify-center text-gray-500">
                                    {numberToKorean(tradeRentDeposit.replace(/,/g, ""))}
                                </Label>
                            </div>
                        </div>

                        <div className="flex flex-col w-1/2">
                            <div className="flex w-full items-center space-x-2 p-1">
                                <Label className="text-base w-1/2 text-center">월세</Label>
                                <Input
                                    className="flex text-right"
                                    type="text"
                                    placeholder="100"
                                    value={tradeRent}
                                    onChange={(e) => onTradeRentChange?.(formatNumberInput(e.target.value))}
                                />
                                <Label className="text-base w-1/4">만원</Label>

                                {isVATApplicable && (
                                    <>
                                        <Checkbox
                                            id={`rentvat-checkbox`}
                                            checked={tradeRentVAT}
                                            onCheckedChange={() => onTradeRentVATChange(!tradeRentVAT)}
                                        />
                                        <Label
                                            htmlFor={`rentvat-checkbox`}
                                            className="w-1/2 text-base"
                                        >
                                            VAT별도
                                        </Label>
                                    </>
                                )}
                            </div>
                            <div className="flex w-full items-center space-x-2 p-1">
                                <Label className="flex w-full text-sm text-right justify-center text-gray-500">
                                    {numberToKorean(tradeRent.replace(/,/g, ""))}
                                </Label>
                            </div>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        className="w-[100px] text-sm mt-2 bg-[#007bff] text-white border-[#0056b3] hover:bg-[#007bff] hover:text-white"
                        onClick={() => setShowSubRent((prev) => !prev)}
                    >
                        {showSubRent ? "숨기기" : "월세조정추가"}
                    </Button>

                    {showSubRent && (
                        <div className="flex flex-row">
                            <div className="flex flex-col w-1/2">
                                <div className="flex w-full items-center space-x-2 p-1">
                                    <Label className="text-base w-1/2 text-left">조정 보증금</Label>
                                    <Input
                                        className="flex text-right"
                                        type="text"
                                        placeholder="10,000"
                                        value={tradeRentDepositSub}
                                        onChange={(e) => onTradeRentDepositSubChange?.(formatNumberInput(e.target.value))}
                                    />
                                    <Label className="text-base w-1/4">만원</Label>
                                </div>

                                <div className="flex w-full items-center space-x-2 p-1">
                                    <Label className="flex w-full text-sm  text-right justify-center text-gray-500">
                                        {numberToKorean(tradeRentDepositSub.replace(/,/g, ""))}
                                    </Label>
                                </div>
                            </div>

                            <div className="flex flex-col w-1/2">
                                <div className="flex w-full items-center space-x-2 p-1">
                                    <Label className="text-base w-1/2 text-center">조정 월세</Label>
                                    <Input
                                        className="flex text-right"
                                        type="text"
                                        placeholder="100"
                                        value={tradeRentSub}
                                        onChange={(e) => onTradeRentSubChange?.(formatNumberInput(e.target.value))}
                                    />
                                    <Label className="text-base w-1/4">만원</Label>

                                    {isVATApplicable && (
                                        <>
                                            <Checkbox
                                                id={`rentsubvat-checkbox`}
                                                checked={tradeRentSubVAT}
                                                onCheckedChange={() => onTradeRentSubVATChange(!tradeRentSubVAT)}
                                            />
                                            <Label
                                                htmlFor={`rentsubvat-checkbox`}
                                                className="w-1/2 text-base"
                                            >
                                                VAT별도
                                            </Label>
                                        </>
                                    )}
                                </div>

                                <div className="flex w-full items-center space-x-2 p-1">
                                    <Label className="flex w-full text-sm  text-right justify-center text-gray-500">
                                        {numberToKorean(tradeRentSub.replace(/,/g, ""))}
                                    </Label>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export { TradeInfoSection };

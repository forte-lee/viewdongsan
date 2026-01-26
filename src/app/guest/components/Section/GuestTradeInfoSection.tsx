import { Button, Label, Input, Checkbox } from "@/components/ui";

interface Props {
    type: string | undefined;

    selectedTradeType?: string[]; 
    onTradeTypeSelect: (tradeType: string) => void; 

    tradePriceCheck: boolean;
    tradeDepositCheck: boolean;
    tradeRentCheck: boolean;

    tradePriceMin: string; 
    tradePriceMax: string; 
    tradeDepositMin: string;
    tradeDepositMax: string;
    tradeRentMin: string; 
    tradeRentMax: string; 
    tradeRentDepositMin: string;
    tradeRentDepositMax: string;

    tradePossibleCash: string;    
    tradePremium: string;

    onTradePriceCheckChange: (tradePriceCheck: boolean) => void;
    onTradeDepositCheckChange: (tradeDepositCheck: boolean) => void;
    onTradeRentCheckChange: (tradeRentCheck: boolean) => void;

    onTradePriceMinChange: (tradePriceMin: string) => void; 
    onTradePriceMaxChange: (tradePriceMax: string) => void; 
    onTradeDepositMinChange: (tradeDepositMin: string) => void;
    onTradeDepositMaxChange: (tradeDepositMax: string) => void;
    onTradeRentMinChange: (tradeRentMin: string) => void;
    onTradeRentMaxChange: (tradeRentMax: string) => void;
    onTradeRentDepositMinChange: (tradeRentDepositMin: string) => void;
    onTradeRentDepositMaxChange: (tradeRentDepositMax: string) => void;

    onTradePossibleCashChange: (tradePossibleCash: string) => void;
    onTradePremiumChange: (tradePremium: string) => void;
}

function GuestTradeInfoSection({
    type,
    selectedTradeType = [],
    onTradeTypeSelect,

    tradePriceCheck,
    tradeDepositCheck, 
    tradeRentCheck,

    tradePriceMin = "",
    tradePriceMax = "",
    tradeDepositMin = "",
    tradeDepositMax = "",
    tradeRentMin = "",
    tradeRentMax = "",
    tradeRentDepositMin = "",
    tradeRentDepositMax = "",

    tradePossibleCash = "",
    tradePremium = "",

    onTradePriceCheckChange,
    onTradeDepositCheckChange,
    onTradeRentCheckChange,

    onTradePriceMinChange,
    onTradePriceMaxChange,
    onTradeDepositMinChange,
    onTradeDepositMaxChange,
    onTradeRentMinChange,
    onTradeRentMaxChange,
    onTradeRentDepositMinChange,
    onTradeRentDepositMaxChange,

    onTradePossibleCashChange,
    onTradePremiumChange,

}: Props) {
    const tradeTypes = (() => {
        switch (type) {
            case "주거":
                return ["매매", "전세", "월세"];
            case "상가/사무실/산업":
                return ["매매", "월세"];
            case "토지":
                return ["매매"];
            case "건물":
                return ["매매", "월세"];            
            default:
                return ["매매", "전세", "월세"];
        }
    })();

    return (
        <div className="flex flex-col w-full pt-3">
            {/* 거래종류 섹션 */}
            <div className="flex flex-row p-1 items-center">
                <div className="flex flex-col w-[30px]">

                </div>
                <div className="flex flex-col w-[100px]">
                    <Label className="text-base p-1 text-left">거래종류</Label>
                </div>            
                <div className="flex flex-row gap-3">
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
            </div>

            <div className="flex flex-row w-full p-1 pt-3">
                <div className="flex flex-row items-center">
                    <div className="flex flex-col w-[30px]">
                    </div>
                    <div className="flex flex-col w-[100px]">
                        <Label className="text-base p-1 text-left">가용현금</Label>
                    </div>      
                    <div className="flex flex-row gap-3 items-center">
                        <Input
                            className="flex text-right w-[150px]"
                            type="number"
                            placeholder=""
                            value={tradePossibleCash}
                            onChange={(e) => onTradePossibleCashChange(e.target.value)}
                        />
                        <Label className="text-base w-[60px]">만원</Label>
                    </div>
                </div>
                {type?.includes("상가/사무실/산업" || "건물") && (
                    <div className="flex flex-row items-center">
                    <div className="flex flex-col w-[30px]">
                    </div>
                    <div className="flex flex-col w-[80px]">
                        <Label className="text-base p-1 text-center">권리금</Label>
                    </div>      
                    <div className="flex flex-row gap-3 items-center">
                        <Input
                            className="flex text-right w-[150px]"
                            type="number"
                            placeholder=""
                            value={tradePremium}
                            onChange={(e) => onTradePremiumChange(e.target.value)}
                        />
                        <Label className="text-base w-[60px]">만원</Label>
                    </div>
                </div>
                )}                
            </div>

            {/* 거래 금액 섹션 */}
            {selectedTradeType.includes("매매") && (
                <div className="flex flex-row w-full p-1 pt-3">
                    <div className="flex flex-row items-center">
                        <div className="flex flex-col w-[30px]">
                            <Label
                                htmlFor={`price-checkbox`}
                                className="text-xs"                            
                            >
                            </Label>
                            <Checkbox
                                id={`price-checkbox`}
                                checked={tradePriceCheck}
                                onCheckedChange={() => onTradePriceCheckChange(!tradePriceCheck)}
                            />
                        </div>
                        <div className="flex flex-col w-[100px]">
                            <Label className="text-base p-1 text-left">매매</Label>
                        </div>        
                        <div className="flex flex-row gap-3 items-center">
                            <Input
                                className="flex text-right w-[150px]"
                                type="number"
                                placeholder=""
                                value={tradePriceMin}
                                onChange={(e) => onTradePriceMinChange(e.target.value)}
                            />
                            <Label className="text-base w-[20px] text-center">~</Label>
                            <Input
                                className="flex text-right w-[150px]"
                                type="number"
                                placeholder=""
                                value={tradePriceMax}
                                onChange={(e) => onTradePriceMaxChange(e.target.value)}
                            />
                            <Label className="text-base w-[60px]">만원</Label>
                        </div>
                    </div>                    
                </div>
            )}

            {selectedTradeType.includes("전세") && (
                <div className="flex flex-row w-full p-1 pt-3">
                    <div className="flex flex-row items-center">
                        <div className="flex flex-col w-[30px]">
                            <Label
                                htmlFor={`deposit-checkbox`}
                                className="text-xs"                            
                            >
                            </Label>
                            <Checkbox
                                id={`deposit-checkbox`}
                                checked={tradeDepositCheck}
                                onCheckedChange={() => onTradeDepositCheckChange(!tradeDepositCheck)}
                            />
                        </div>
                        <div className="flex flex-col w-[100px]">
                            <Label className="text-base p-1 text-left">전세</Label>
                        </div>        
                        <div className="flex flex-row gap-3 items-center">
                            <Input
                                className="flex text-right w-[150px]"
                                type="number"
                                placeholder=""
                                value={tradeDepositMin}
                                onChange={(e) => onTradeDepositMinChange(e.target.value)}
                            />
                            <Label className="text-base w-[20px] text-center">~</Label>
                            <Input
                                className="flex text-right w-[150px]"
                                type="number"
                                placeholder=""
                                value={tradeDepositMax}
                                onChange={(e) => onTradeDepositMaxChange(e.target.value)}
                            />
                            <Label className="text-base w-[60px]">만원</Label>
                        </div>
                    </div>                    
                </div>
            )}

            {selectedTradeType.includes("월세") && (
                <div className="flex flex-col">                    
                    <div className="flex flex-row w-full p-1 pt-3">
                        <div className="flex flex-row items-center">
                            <div className="flex flex-col w-[30px]">
                                <Label
                                    htmlFor={`rent-checkbox`}
                                    className="text-xs"                            
                                >
                                </Label>
                                <Checkbox
                                    id={`rent-checkbox`}
                                    checked={tradeRentCheck}
                                    onCheckedChange={() => onTradeRentCheckChange(!tradeRentCheck)}
                                />
                            </div>
                            <div className="flex flex-col w-[100px]">
                                <Label className="text-base p-1 text-left">월세보증금</Label>
                            </div>        
                            <div className="flex flex-row gap-3 items-center">
                                <Input
                                    className="flex text-right w-[150px]"
                                    type="number"
                                    placeholder=""
                                    value={tradeRentDepositMin}
                                    onChange={(e) => onTradeRentDepositMinChange(e.target.value)}
                                />
                                <Label className="text-base w-[20px] text-center">~</Label>
                                <Input
                                    className="flex text-right w-[150px]"
                                    type="number"
                                    placeholder=""
                                    value={tradeRentDepositMax}
                                    onChange={(e) => onTradeRentDepositMaxChange(e.target.value)}
                                />
                                <Label className="text-base w-[60px]">만원</Label>
                            </div> 
                        </div>                       
                    </div>  
                    <div className="flex flex-row w-full p-1 pt-3">
                        <div className="flex flex-row items-center">
                            <div className="flex flex-col w-[30px]">
                            </div>
                            <div className="flex flex-col w-[100px]">
                                <Label className="text-base p-1 text-left">월세</Label>
                            </div>        
                            <div className="flex flex-row gap-3 items-center">
                                <Input
                                    className="flex text-right w-[150px]"
                                    type="number"
                                    placeholder=""
                                    value={tradeRentMin}
                                    onChange={(e) => onTradeRentMinChange(e.target.value)}
                                />
                                <Label className="text-base w-[20px] text-center">~</Label>
                                <Input
                                    className="flex text-right w-[150px]"
                                    type="number"
                                    placeholder=""
                                    value={tradeRentMax}
                                    onChange={(e) => onTradeRentMaxChange(e.target.value)}
                                />
                                <Label className="text-base w-[60px]">만원</Label>
                            </div> 
                        </div>                       
                    </div>   
                </div>            
            )}
        </div>
    );
}

export { GuestTradeInfoSection };

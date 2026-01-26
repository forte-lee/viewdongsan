import { RequiredMark } from "@/components/common/etc/RequiredMark";
import { Button, Input, Label } from "@/components/ui";

interface ParkingSectionProps {
    propertytype: string | undefined;
    parking_total: string;         //총 주차수
    parking_method?: string[];        //주차방식
    parking_method_memo: string;         //주차방식 메모
    parking_available: string;     //주차가능여부
    parking_number: string;        //주차대수
    parking_cost: string;          //주차비
    parking_memo: string;          //비고

    onParkingTotalChange: (parking_total: string) => void;
    onParkingMethodChange: (parking_method: string) => void;
    onParkingMethodMemoChange: (parking_method_memo: string) => void;
    onParkingAvailableChange: (parking_available: string) => void;
    onParkingNumberChange: (parking_number: string) => void;
    onParkingCostChange: (parking_cost: string) => void;
    onParkingMemoChange: (parking_memo: string) => void;
}

function ParkingSection({ propertytype, parking_total, parking_method, parking_method_memo, parking_available, parking_number, parking_cost, parking_memo,
    onParkingTotalChange, onParkingMethodChange, onParkingMethodMemoChange, onParkingAvailableChange, onParkingNumberChange, onParkingCostChange, onParkingMemoChange,
}: ParkingSectionProps) {
    const methods = ["자주식", "기계식"];
    const isavailable = ["가능", "불가", "협의"];

    const memoPlaceholder = (() => {
        switch (propertytype) {
            case "아파트":
                return "지정주차, 관리실확인필요 등";
            case "오피스텔":
                return "선착순, 지정주차, 관리실확인필요 등";
            case "공동주택(아파트 외)":
                return "선착순, 지정주차, 관리실확인필요 등";
            case "단독주택(임대)":
                return "선착순, 지정주차, 확인필요 등";
            case "상업/업무/공업용":
                return "선착순, 지정주차, 확인필요 등";
            case "건물":
                return "-";
            case "토지":
                return "-";
            default:
                return "확인필요";
        }
    })();

    return (
        <div className="flex-col p-3">
            <div className="flex pb-3">
                <Label className="text-xl font-bold gap-4">주차
                <span className="ml-2 px-1.5 py-0.5 rounded bg-red-600 text-white text-sm font-semibold">필수</span>
                </Label>
            </div>

            <div className="flex flex-col w-full justify-start p-1">
                <div className="flex w-1/2 items-center space-x-2 p-1">
                    <Label className="text-base w-1/3 text-left">주차가능여부<RequiredMark/>
                    </Label>
                    <div className="w-1/2 flex gap-3 p-1">
                        {isavailable.map((data) => (
                            <Button
                                key={data}
                                variant="outline"
                                className={`
                                    ${"p-5 text-sm border-solid text-black border-[#ddd] bg-[#f9f9f9] hover:bg-blue-100 cursor-pointer"} 
                                    ${parking_available === data ? "bg-[#007bff] text-white border-[#0056b3] hover:bg-[#007bff] hover:text-white]" : ""
                                        }`}
                                onClick={() => onParkingAvailableChange(data)}
                            >
                            {data}
                        </Button>
                        ))}
                    </div>
                </div>    

                        
                <div className="flex flex-row w-full items-center">
                    <div className="flex w-1/2 items-center space-x-2 p-1">
                        <Label className="text-base w-1/3 text-left">주차방식<RequiredMark/></Label>
                        <div className="w-1/2 flex gap-3 p-1">
                            {methods.map((data) => (
                                <Button
                                    key={data}
                                    variant="outline"
                                    className={`
                                        ${"p-5 text-sm border-solid text-black border-[#ddd] bg-[#f9f9f9] hover:bg-blue-100 cursor-pointer"} 
                                        ${parking_method?.includes(data) ? "bg-[#007bff] text-white border-[#0056b3] hover:bg-[#007bff] hover:text-white]" : ""
                                            }`}
                                    onClick={() => onParkingMethodChange(data)}
                                >
                                    {data}
                                </Button>
                            ))}
                        </div>                    
                    </div>
                    <div className="flex w-1/2 items-center space-x-2 p-1">
                        <Input
                            className="text-base w-1/3 text-left"
                            type="text"
                            placeholder="비고"
                            value={parking_method_memo}
                            onChange={(e) => onParkingMethodMemoChange(e.target.value || "")} 
                        />
                    </div>
                </div>
                
                <div className="flex flex-row">
                    <div className="flex w-1/2 items-center justify-start space-x-2 p-1">
                        <div className="flex flex-row w-1/3">
                            <Label className="text-base text-left">총주차</Label>
                            {propertytype == "건물" && (
                                <RequiredMark/>
                            )}                            
                        </div>
                        
                        <div className="w-1/3 flex gap-3 p-1">
                            <Input
                                className="flex font-bold text-right"
                                type="text"
                                placeholder="20"
                                value={parking_total}
                                onChange={(e) => {
                                    const numericValue = e.target.value.replace(/[^0-9]/g, ""); // 숫자만 허용
                                    const formattedValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ","); // 천 단위 콤마 추가
                                    onParkingTotalChange(formattedValue);
                                }}
                            />  
                        </div>
                    </div>        
                    <div className="flex w-1/2 items-center p-1">
                        <Input 
                            className="w-full font-bold text-left" 
                            type="text"
                            placeholder={memoPlaceholder}
                            value={parking_memo}
                            onChange={(e) => onParkingMemoChange(e.target.value)}
                            /> 
                    </div>  
                                          
                </div>
                

                <div className="flex flex-row">
                    <div className="flex w-1/2 items-center justify-start space-x-2 p-1">
                        <Label className="text-base w-1/3 text-left">주차가능대수</Label>
                        <div className="w-1/3 flex gap-3 p-1">
                            <Input
                                className="font-bold text-right"
                                type="text"
                                placeholder="1"
                                value={parking_number}
                                onChange={(e) => {
                                    const numericValue = e.target.value.replace(/[^0-9]/g, ""); // 숫자만 허용
                                    const formattedValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ","); // 천 단위 콤마 추가
                                    onParkingNumberChange(formattedValue);
                                }}
                            />  
                        </div>                                         
                    </div>    
                    <div className="flex w-1/3 items-center justify-start space-x-2 p-1">
                        <Label className="text-base w-1/2 text-left">주차비</Label>
                        <Input
                            className="w-full font-bold text-right"
                            type="text"
                            placeholder="20,000"
                            value={parking_cost}
                            onChange={(e) => {
                                const numericValue = e.target.value.replace(/[^0-9]/g, ""); // 숫자만 허용
                                const formattedValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ","); // 천 단위 콤마 추가
                                onParkingCostChange(formattedValue);
                            }}
                        />  
                        <Label className="text-base w-1/6 text-right">원</Label>
                    </div> 
                    
                           
                </div>    
            </div>
        </div>
    )
}

export { ParkingSection }
import { Button, Checkbox, Input, Label } from "@/components/ui";
import { numberToKoreanWon } from "@/utils/numberToKoreanWon";

interface AdminCostSectionProps {
    propertytype: string | undefined;
    adminCost: string;
    adminCostVAT: boolean;
    adminCostSelf: boolean;
    adminCostInclude: string[];
    adminCostMemo: string;
    onAdminCostChange: (adminCost: string) => void;
    onAdminCostVATToggle: (adminCostVAT: boolean) => void;
    onAdminCostSelfToggle: (adminCostSelf: boolean) => void;
    onAdminCostIncludeToggle: (adminCostInclude: string) => void;
    onAdminCostMemoChange: (adminCostMemo: string) => void;
}


function AdminCostSection({ propertytype, adminCost, adminCostVAT, adminCostSelf, adminCostInclude, adminCostMemo, onAdminCostChange, onAdminCostVATToggle, onAdminCostSelfToggle, onAdminCostIncludeToggle, onAdminCostMemoChange }: AdminCostSectionProps) {
    const includeCosts = ["수도", "전기", "가스", "기타"];
    const isVATApplicable = ["오피스텔", "상업/업무/공업용", "건물"].includes(propertytype || "");
    const isSelfApplicable = ["아파트", "오피스텔", "공동주택(아파트 외)", "상업/업무/공업용"].includes(propertytype || "");

    return (
        <div className="flex-col p-3">
            <div className="flex pb-3">
                <Label className="text-xl font-bold gap-4">관리비
                    <span className="ml-2 px-1.5 py-0.5 rounded bg-red-600 text-white text-sm font-semibold">필수</span>
                </Label>
            </div>
            <div className="flex flex-row w-full items-center space-x-2 p-2 gap-3">
                <div className="flex flex-col w-1/2">
                    <div className="flex flex-row items-center">
                        <Input
                            className="w-2/3 font-bold text-right"
                            type="text"
                            placeholder="10"
                            value={adminCost}
                            onChange={(e) => {
                                const numericValue = e.target.value.replace(/[^0-9]/g, ""); // 숫자만 허용
                                const formattedValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ","); // 천 단위 콤마 추가
                                onAdminCostChange(formattedValue);
                            }}
                        />
                        <Label className="w-1/3 text-base text-left ml-2">원</Label>
                    </div>

                    <div className="flex w-1/2 items-center space-x-2 p-1">
                        <Label className="flex w-full text-right text-sm justify-center text-gray-500">
                            {numberToKoreanWon(adminCost.replace(/,/g, ""))}
                        </Label>
                    </div>
                </div>

                <div className="flex flex-col w-1/3 items-start gap-2">
                    {isSelfApplicable && (
                        <div className="flex flex-row items-center gap-2">
                            <Checkbox
                                id={`self-checkbox`}
                                checked={adminCostSelf}
                                onCheckedChange={() => onAdminCostSelfToggle(!adminCostSelf)}
                            />
                            <Label
                                htmlFor={`self-checkbox`}
                                className="text-base"
                            >
                                내규
                            </Label>
                        </div>
                    )}
                    {isVATApplicable && (
                        <div className="flex flex-row items-center gap-2">
                            <Checkbox
                                id={`vat-checkbox`}
                                checked={adminCostVAT}
                                onCheckedChange={() => onAdminCostVATToggle(!adminCostVAT)}
                            />
                            <Label
                                htmlFor={`vat-checkbox`}
                                className="text-base"
                            >
                                VAT별도
                            </Label>
                        </div>
                    )}
                </div>

                <div className="flex flex-row w-1/2 gap-3">
                    {includeCosts.map((include_cost) => (
                        <Button
                            key={include_cost}
                            variant="outline"
                            className={`
                            ${"p-5 text-sm border-solid text-black border-[#ddd] bg-[#f9f9f9] hover:bg-blue-100 cursor-pointer"} 
                            ${adminCostInclude.includes(include_cost) ? "bg-[#007bff] text-white border-[#0056b3] hover:bg-[#007bff] hover:text-white]" : ""
                                }`}
                            onClick={() => onAdminCostIncludeToggle(include_cost)}
                        >
                            {include_cost}
                        </Button>
                    ))}
                </div>

                <Input
                    className="w-1/3 font-bold text-left"
                    type="text"
                    placeholder="비고"
                    value={adminCostMemo}
                    onChange={(e) => onAdminCostMemoChange(e.target.value || "-")}
                />

            </div>
        </div>
    )
}

export { AdminCostSection }
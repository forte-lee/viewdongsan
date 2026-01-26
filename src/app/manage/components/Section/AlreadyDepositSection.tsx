import { Button, Input, Label, LabelDatePicker } from "@/components/ui";
import { formatNumberInput } from "@/utils/formatNumberInput";
import { numberToKorean } from "@/utils/numberToKorean";
import { numberToKoreanWon } from "@/utils/numberToKoreanWon";
import { RequiredMark } from "@/components/common/etc/RequiredMark";

interface AlreadyDepositSectionProps {
    propertytype: string | undefined;
    alreadyTenant: string;        //전임차인
    alreadyTenantMemo: string;        //전임차인
    alreadyEndDate: Date | undefined;        //만기일
    alreadyRenewRequest: string; //갱신청구
    alreadyRenewRequestMemo: string; //갱신청구
    alreadyDeposit: string;        //기보증금
    alreadyRent: string;           //월세
    alreadyAdminCost: string;     //관리비
    alreadyPremium: string;         //권리금
    alreadyPremiumMemo: string;     //권리금비고
    alreadyJobType: string;         //업종
    alreadyJobWant: string;         //선호업종

    onAlreadyTenantChange: (alreadyTenant: string) => void;
    onAlreadyTenantMemoChange: (alreadyTenant: string) => void;
    onAlreadyEndDateChange: (alreadyEndDate: Date | undefined) => void;
    onAlreadyRenewRequestChange: (alreadyRenewRequest: string) => void;
    onAlreadyRenewRequestMemoChange: (alreadyRenewRequest: string) => void;
    onAlreadyDepositChange: (alreadyDeposit: string) => void;
    onAlreadyRentChange: (alreadyRent: string) => void;
    onAlreadyAdminCostChange: (alreadyAdminCost: string) => void;
    onAlreadyPremiumChange: (alreadyPremium: string) => void;
    onAlreadyPremiumMemoChange: (alreadyPremiumMemo: string) => void;
    onAlreadyJobType: (alreadyJobType: string) => void;
    onAlreadyJobWant: (alreadyJobWant: string) => void;
}


function AlreadyDepositSection(
    { propertytype, alreadyTenant, alreadyTenantMemo, alreadyEndDate, alreadyRenewRequest, alreadyRenewRequestMemo,
        alreadyDeposit, alreadyRent, alreadyAdminCost, alreadyPremium, alreadyPremiumMemo, alreadyJobType, alreadyJobWant,
        onAlreadyTenantChange, onAlreadyTenantMemoChange, onAlreadyEndDateChange, onAlreadyRenewRequestChange, onAlreadyRenewRequestMemoChange,
        onAlreadyDepositChange, onAlreadyRentChange, onAlreadyAdminCostChange, onAlreadyPremiumChange,
        onAlreadyPremiumMemoChange, onAlreadyJobType, onAlreadyJobWant
    }: AlreadyDepositSectionProps) {

    const tenant = ["있음", "없음"];
    const renewrequest = ["있음", "없음"];

    const isOffice = ["상업/업무/공업용"].includes(propertytype || "");


    return (
        <div className="flex-col p-3">
            <div className="flex pb-3">
                <label className="text-xl font-bold gap-4">
                    기보증금
                    {isOffice && (
                        <span className="ml-2 px-1.5 py-0.5 rounded bg-red-600 text-white text-sm font-semibold">필수</span>
                    )}
                </label>
            </div>

            {/* 현임차인 */}
            <div className="flex flex-row w-full items-center">
                <div className="flex flex-row w-full">
                    <div className="flex flex-row w-full items-center p-1 gap-3">
                        <Label className="text-base w-1/2">현임차인유무</Label>
                        <div className="flex gap-3">
                            {tenant.map((Tenant) => (
                                <Button
                                    variant="outline"
                                    key={Tenant}
                                    className={`
                                            ${"p-5 text-sm border-solid text-black border-[#ddd] bg-[#f9f9f9] hover:bg-blue-100 cursor-pointer"} 
                                            ${alreadyTenant === Tenant ? "bg-[#007bff] text-white border-[#0056b3] hover:bg-[#007bff] hover:text-white]" : ""
                                        }`}
                                    onClick={() => onAlreadyTenantChange(Tenant)}
                                >
                                    {Tenant}
                                </Button>
                            ))}
                        </div>
                        <Input
                            className="w-1/3 font-bold text-left"
                            type="text"
                            placeholder="비고"
                            value={alreadyTenantMemo}
                            onChange={(e) => onAlreadyTenantMemoChange(e.target.value || "-")}
                        />
                    </div>
                    <div className="flex flex-row w-full items-center p-1 gap-3">
                        <Label className="text-base w-1/2 text-right">만기일</Label>
                        <LabelDatePicker label="" value={alreadyEndDate} onChange={onAlreadyEndDateChange} />
                    </div>
                </div>
            </div>

            {/* 갱신청구 */}
            <div className="flex flex-row w-1/2 items-center pt-1">
                <div className="flex flex-row w-full">
                    {isOffice ? (
                        <div className="flex flex-col w-full items-center p-1 gap-3">
                            <div className="flex flex-row items-center w-full">
                                <div className="w-1/2">
                                    <Label className="text-base">현재업종
                                    <RequiredMark/></Label>
                                </div>

                                <div className="flex gap-3 w-full">
                                    <Input
                                        className="font-bold text-left w-full"
                                        type="text"
                                        placeholder="현재업종"
                                        value={alreadyJobType}
                                        onChange={(e) => onAlreadyJobType(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-row items-center w-full">
                                <Label className="text-base w-1/2">비선호업종
                                <RequiredMark/></Label>
                                <div className="flex gap-3 w-full">
                                    <Input
                                        className="font-bold text-left w-full"
                                        type="text"
                                        placeholder="비선호업종"
                                        value={alreadyJobWant}
                                        onChange={(e) => onAlreadyJobWant(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-row w-full items-center space-x-2 p-1">
                            <Label className="text-base w-1/2">갱신청구</Label>
                            <div className="flex gap-3">
                                {renewrequest.map((data) => (
                                    <Button
                                        variant="outline"
                                        key={data}
                                        className={`
                                                ${"p-5 text-sm border-solid text-black border-[#ddd] bg-[#f9f9f9] hover:bg-blue-100 cursor-pointer"} 
                                                ${alreadyRenewRequest === data ? "bg-[#007bff] text-white border-[#0056b3] hover:bg-[#007bff] hover:text-white]" : ""
                                            }`}
                                        onClick={() => onAlreadyRenewRequestChange(data)}
                                    >
                                        {data}
                                    </Button>
                                ))}
                            </div>
                            <Input
                                className="w-1/3 font-bold text-left"
                                type="text"
                                placeholder="비고"
                                value={alreadyRenewRequestMemo}
                                onChange={(e) => onAlreadyRenewRequestMemoChange(e.target.value || "-")}
                            />
                        </div>
                    )}
                </div>
            </div>


            {/* 기보증금/월세/관리비 */}
            <div className="flex flex-row w-full items-center justify-center pt-1">
                <div className="flex flex-col w-1/2" >
                    <div className="flex flex-row items-center justify-start gap-6 pl-1">
                        <Label className="text-base w-1/3 text-left">보증금</Label>

                        <Input
                            className="w-1/3 font-bold text-right"
                            type="text"
                            placeholder="10,000"
                            value={alreadyDeposit}
                            onChange={(e) => onAlreadyDepositChange?.(formatNumberInput(e.target.value))}
                        />
                        <Label className="text-base w-1/4 text-left">만원</Label>

                    </div>

                    <div className="flex flex-row items-center justify-start gap-3 p-1">
                        <Label className="flex w-full text-sm text-right justify-center text-gray-500">
                            {numberToKorean(alreadyDeposit.replace(/,/g, ""))}
                        </Label>
                    </div>
                </div>

                <div className="flex flex-col w-1/3" >
                    <div className="flex flex-row items-center justify-start gap-3 p-1">
                        <Label className="text-base w-1/3 text-right">월세</Label>
                        <Input
                            className="w-1/2 font-bold text-right"
                            type="text"
                            placeholder="10"
                            value={alreadyRent}
                            onChange={(e) => onAlreadyRentChange?.(formatNumberInput(e.target.value))}
                        />
                        <Label className="text-base w-1/4 text-left">만원</Label>
                    </div>
                    <div className="flex flex-row items-center justify-start gap-3 p-1">
                        <Label className="flex w-full text-sm text-right justify-center text-gray-500">
                            {numberToKorean(alreadyRent.replace(/,/g, ""))}
                        </Label>
                    </div>
                </div>
                <div className="flex flex-col w-1/3" >
                    <div className="flex flex-row items-center justify-start gap-3 p-1">
                        <Label className="text-base w-1/3 text-right">관리비</Label>
                        <Input
                            className="w-1/2 font-bold text-right"
                            type="text"
                            placeholder="10,000"
                            value={alreadyAdminCost}
                            onChange={(e) => onAlreadyAdminCostChange?.(formatNumberInput(e.target.value))}
                        />
                        <Label className="text-base w-1/4 text-left">원</Label>
                    </div>

                    <div className="flex flex-row items-center justify-start gap-3 p-1">
                        <Label className="flex w-full text-right text-sm justify-center text-gray-500">
                            {numberToKoreanWon(alreadyAdminCost.replace(/,/g, ""))}
                        </Label>
                    </div>
                </div>
            </div>


            {/* 권리금 */}
            {isOffice && (
                <div className="flex flex-row w-full items-center justify-center">
                    <div className="flex flex-col w-1/2" >
                        <div className="flex flex-row items-center justify-start gap-6 pl-1">
                            <Label className="text-base w-1/3 text-left">권리금<RequiredMark/></Label>
                            <Input
                                className="w-1/3 font-bold text-right"
                                type="text"
                                placeholder="10,000"
                                value={alreadyPremium}
                                onChange={(e) => onAlreadyPremiumChange?.(formatNumberInput(e.target.value))}
                            />
                            <Label className="text-base w-1/4 text-left">만원</Label>
                        </div>
                        <div className="flex flex-row items-center justify-start gap-3 p-1">
                            <Label className="flex w-full text-sm text-right justify-center text-gray-500">
                                {numberToKorean(alreadyPremium.replace(/,/g, ""))}
                            </Label>
                        </div>
                    </div>

                    <div className="flex flex-row w-2/3 items-center">
                        <Input
                            className="w-full font-bold text-left"
                            type="text"
                            placeholder="권리금 포함 내역"
                            value={alreadyPremiumMemo}
                            onChange={(e) => onAlreadyPremiumMemoChange(e.target.value || "-")}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export { AlreadyDepositSection };
import { RequiredMark } from "@/components/common/etc/RequiredMark";
import { Button, Input, Label, LabelDatePicker, Separator } from "@/components/ui";

interface BuildingDepositSectionProps {
    buildingTotalTenant: string;  //임차인 수
    buildingTotalDeposit: string; //총보증금
    buildingTotalRent: string;    //총 월세
    buildingTotalAdmincost: string;   //총 관리비
    buildingTotalCost: string;        //총 비용
    buildingTotalRate: string;         //총수익률
    buildingRooms: string[];           //호실
    buildingDeposits: string[];        //보증금
    buildingRents: string[];           //월세
    buildingAdmincosts: string[];      //관리비
    buildingMemos: string[];            //비고
    buildingEndDates: Date[];           //만기일
    buildingJobs: string[];             //업종    

    onBuildingTotalTenantChange: (buildingTotalTenant: string) => void;
    onBuildingTotalDepositChange: (buildingTotalDeposit: string) => void;
    onBuildingTotalRentChange: (buildingTotalRent: string) => void;
    onBuildingTotalAdmincostChange: (buildingTotalAdmincost: string) => void;
    onBuildingTotalCostChange: (buildingTotalCost: string) => void;
    onBuildingTotalRateChange: (buildingTotalRate: string) => void;
    onBuildingRoomsChange: (buildingRooms: string[]) => void;
    onBuildingDepositsChange: (buildingDeposits: string[]) => void;
    onBuildingRentsChange: (buildingRents: string[]) => void;
    onBuildingAdmincostsChange: (buildingAdmincosts: string[]) => void;
    onBuildingMemosChange: (buildingMemos: string[]) => void;
    onBuildingEndDatesChange: (buildingEndDates: Date[]) => void;
    onBuildingJobsChange: (buildingJobs: string[]) => void;
}

function BuildingDepositSection({ buildingTotalTenant, buildingTotalDeposit, buildingTotalRent, buildingTotalAdmincost, buildingTotalCost, buildingTotalRate,
    buildingRooms, buildingDeposits, buildingRents, buildingAdmincosts, buildingMemos, buildingEndDates, buildingJobs,
    onBuildingTotalTenantChange, onBuildingTotalDepositChange, onBuildingTotalRentChange, onBuildingTotalAdmincostChange, onBuildingTotalCostChange,
    onBuildingTotalRateChange, onBuildingRoomsChange, onBuildingDepositsChange, onBuildingRentsChange,
    onBuildingAdmincostsChange, onBuildingMemosChange, onBuildingEndDatesChange, onBuildingJobsChange }: BuildingDepositSectionProps,
) {

    //룸정보 추가
    const handleAddRoom = () => {
        onBuildingRoomsChange([...buildingRooms, ""]);
        onBuildingDepositsChange([...buildingDeposits, ""]);
        onBuildingRentsChange([...buildingRents, ""]);
        onBuildingAdmincostsChange([...buildingAdmincosts, ""]);
        onBuildingMemosChange([...buildingMemos, ""]);
        onBuildingEndDatesChange([...buildingEndDates, new Date()]);
        onBuildingJobsChange([...buildingJobs, ""]);
    }

    const handleRemoveRoom = (index: number) => {
        const updatedBuildingRooms = buildingRooms.filter((_, i) => i !== index);
        const updatedBuildingDeposits = buildingDeposits.filter((_, i) => i !== index);
        const updatedBuildingRents = buildingRents.filter((_, i) => i !== index);
        const updatedBuildingAdmincosts = buildingAdmincosts.filter((_, i) => i !== index);
        const updatedBuildingMemos = buildingMemos.filter((_, i) => i !== index);
        const updatedBuildingEndDates = buildingEndDates.filter((_, i) => i !== index);
        const updatedBuildingJobs = buildingJobs.filter((_, i) => i !== index);

        onBuildingRoomsChange(updatedBuildingRooms);
        onBuildingDepositsChange(updatedBuildingDeposits);
        onBuildingRentsChange(updatedBuildingRents);
        onBuildingAdmincostsChange(updatedBuildingAdmincosts);
        onBuildingMemosChange(updatedBuildingMemos);
        onBuildingEndDatesChange(updatedBuildingEndDates);
        onBuildingJobsChange(updatedBuildingJobs);
    }


    const handleRoomsChange = (index: number, value: string) => {
        const updatedBuildingRooms = [...buildingRooms];
        updatedBuildingRooms[index] = value;
        onBuildingRoomsChange(updatedBuildingRooms);
    };

    const handleDepositsChange = (index: number, value: string) => {
        const updatedBuildingDeposits = [...buildingDeposits];
        updatedBuildingDeposits[index] = value;
        onBuildingDepositsChange(updatedBuildingDeposits);
    };
    const handleRentsChange = (index: number, value: string) => {
        const updatedBuildingRents = [...buildingRents];
        updatedBuildingRents[index] = value;
        onBuildingRentsChange(updatedBuildingRents);
    };
    const handleAdmincostsChange = (index: number, value: string) => {
        const updatedBuildingAdmincosts = [...buildingAdmincosts];
        updatedBuildingAdmincosts[index] = value;
        onBuildingAdmincostsChange(updatedBuildingAdmincosts);
    };
    const handleMemosChange = (index: number, value: string) => {
        const updatedBuildingMemos = [...buildingMemos];
        updatedBuildingMemos[index] = value;
        onBuildingMemosChange(updatedBuildingMemos);
    };
    const handleEndDatesChange = (index: number, value: Date) => {
        const updatedBuildingEndDates = [...buildingEndDates];
        updatedBuildingEndDates[index] = value;
        onBuildingEndDatesChange(updatedBuildingEndDates);
    };
    const handleJobsChange = (index: number, value: string) => {
        const updatedBuildingJobs = [...buildingJobs];
        updatedBuildingJobs[index] = value;
        onBuildingJobsChange(updatedBuildingJobs);
    };


    return (
        <div className="flex-col p-3">
            <div className="flex pb-3">
                <Label className="text-xl font-bold gap-4">기보증금</Label>
                <span className="ml-2 px-1.5 py-0.5 rounded bg-red-600 text-white text-sm font-semibold">필수</span>
            </div>

            <div className="flex flex-row w-full items-center space-x-2 p-1">
                <div className="flex flex-row w-1/3 items-center space-x-2">
                    <Label className="text-base w-1/3 text-left">임차인수<RequiredMark/></Label>                    
                    <Input
                        className="w-1/2 font-bold text-right"
                        type="text"
                        placeholder="0"
                        value={buildingTotalTenant}
                        onChange={(e) => {
                            const numericValue = e.target.value.replace(/[^0-9]/g, ""); // 숫자만 허용
                            const formattedValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ","); // 천 단위 콤마 추가
                            onBuildingTotalTenantChange(formattedValue);
                        }}
                    />
                    <Label className="text-base w-1/6 text-left">명</Label>
                </div>

                <div className="flex flex-row w-1/3 items-center space-x-2 p-1">
                    <Label className="text-base w-1/3 text-right">총보증금<RequiredMark/></Label>
                    <Input
                        className="w-1/2 font-bold text-right"
                        type="text"
                        placeholder="1,000,000"
                        value={buildingTotalDeposit}
                        onChange={(e) => {
                            const numericValue = e.target.value.replace(/[^0-9]/g, ""); // 숫자만 허용
                            const formattedValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ","); // 천 단위 콤마 추가
                            onBuildingTotalDepositChange(formattedValue);
                        }}
                    />
                    <Label className="text-base w-1/6 text-left">만원</Label>
                </div>

                <div className="flex flex-row w-1/3 items-center space-x-2 p-1">
                    <Label className="text-base w-1/3 text-right">총월세<RequiredMark/></Label>
                    <Input
                        className="w-1/2 font-bold text-right"
                        type="text"
                        placeholder="10,000"
                        value={buildingTotalRent}
                        onChange={(e) => {
                            const numericValue = e.target.value.replace(/[^0-9]/g, ""); // 숫자만 허용
                            const formattedValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ","); // 천 단위 콤마 추가
                            onBuildingTotalRentChange(formattedValue);
                        }}
                    />
                    <Label className="text-base w-1/6 text-left">만원</Label>
                </div>
            </div>

            <div className="flex flex-row w-full items-center space-x-2 p-1">
                <div className="flex flex-row w-1/3 items-center space-x-2">
                    <Label className="text-base w-1/3 text-left">총관리비<RequiredMark/></Label>
                    <Input
                        className="w-1/2 font-bold text-right"
                        type="text"
                        placeholder="1,000"
                        value={buildingTotalAdmincost}
                        onChange={(e) => {
                            const numericValue = e.target.value.replace(/[^0-9]/g, ""); // 숫자만 허용
                            const formattedValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ","); // 천 단위 콤마 추가
                            onBuildingTotalAdmincostChange(formattedValue);
                        }}
                    />
                    <Label className="text-base w-1/6 text-left">만원</Label>
                </div>

                <div className="flex flex-row w-1/3 items-center space-x-2 p-1">
                    <Label className="text-base w-1/3 text-right">총비용</Label>                    
                    <Input
                        className="w-1/2 font-bold text-right"
                        type="text"
                        placeholder="10,000"
                        value={buildingTotalCost}
                        onChange={(e) => {
                            const numericValue = e.target.value.replace(/[^0-9]/g, ""); // 숫자만 허용
                            const formattedValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ","); // 천 단위 콤마 추가
                            onBuildingTotalCostChange(formattedValue);
                        }}
                    />
                    <Label className="text-base w-1/6 text-left">만원</Label>
                </div>

                <div className="flex flex-row w-1/3 items-center space-x-2 p-1">
                    <Label className="text-base w-1/3 text-right">수익률</Label>
                    <Input
                        className="w-1/2 font-bold text-right"
                        type="text"
                        placeholder="10"
                        value={buildingTotalRate}
                        onChange={(e) => {
                            const numericValue = e.target.value.replace(/[^0-9]/g, ""); // 숫자만 허용
                            const formattedValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ","); // 천 단위 콤마 추가
                            onBuildingTotalRateChange(formattedValue);
                        }}
                    />
                    <Label className="text-base w-1/6 text-left">%</Label>
                </div>
            </div>

            <Separator className="mt-4 mb-4"></Separator>

            <div className="flex flex-row items-center w-full p-1">
                <div className="flex flex-row w-full items-center justify-center space-x-2 p-1">
                    <div className="flex w-[12%] justify-center">
                        <Label className="flex text-center">호수</Label>
                    </div>
                    <div className="flex w-[12%] justify-center">
                        <Label className="flex  text-right">보증금</Label>
                    </div>
                    <div className="flex w-[12%] justify-center">
                        <Label className="flex  text-right">월세</Label>
                    </div>
                    <div className="flex w-[12%] justify-center">
                        <Label className="flex  text-right">관리비</Label>
                    </div>
                    <div className="flex w-[12%] justify-center">
                        <Label className="flex  text-right">업종</Label>
                    </div>
                    <div className="flex w-[20%] justify-center">
                        <Label className="flex  text-right">만기일</Label>
                    </div>
                    <div className="flex w-[15%] justify-center">
                        <Label className="flex  text-right">비고</Label>
                    </div>
                    <div className="flex w-[5%] justify-center">
                        <Label className="flex  text-right"></Label>
                    </div>
                </div>
            </div>

            {buildingRooms.map((room, index) => (
                <div key={index} className="flex flex-row items-center w-full">
                    <div className="flex flex-row w-full items-center space-x-2 p-1">
                        <Input
                            className="flex w-[12%] text-xs"
                            type="text"
                            value={room}
                            onChange={(e) => handleRoomsChange(index, e.target.value)}
                        />
                        <Input
                            className="flex w-[12%] text-xs"
                            type="text"
                            value={buildingDeposits[index] || ""}
                            onChange={(e) => handleDepositsChange(index, e.target.value)}
                        />
                        <Input
                            className="flex w-[12%] text-xs"
                            type="text"
                            value={buildingRents[index] || ""}
                            onChange={(e) => handleRentsChange(index, e.target.value)}
                        />
                        <Input
                            className="flex w-[12%] text-xs"
                            type="text"
                            value={buildingAdmincosts[index] || ""}
                            onChange={(e) => handleAdmincostsChange(index, e.target.value)}
                        />
                        <Input
                            className="flex w-[12%] text-xs"
                            type="text"
                            value={buildingJobs[index] || ""}
                            onChange={(e) => handleJobsChange(index, e.target.value)}
                        />
                        
                        <div className="flex flex-row w-[20%]" >
                            <LabelDatePicker
                                label=""
                                value={buildingEndDates[index] || undefined}
                                onChange={(date) => handleEndDatesChange(index, date || new Date())}
                            />
                        </div>
                        {/* <Input
                            className="flex text-xs"
                            type="date"
                            value={buildingEndDates[index] || ""}
                            onChange={(e) => handleEndDatesChange(index, e.target.value)}
                        /> */}
                        <Input
                            className="flex w-[15%] text-xs"
                            type="text"
                            value={buildingMemos[index] || ""}
                            onChange={(e) => handleMemosChange(index, e.target.value)}
                        />
                        <div className="flex w-[5%] text-xs">
                            <Button
                                variant="outline"
                                size="sm"
                                className="p-2 bg-red-600 text-white hover:bg-red-700 rounded"
                                onClick={() => handleRemoveRoom(index)}
                            >
                                삭제
                            </Button>
                        </div>
                    </div>
                </div>
            ))}
            <div className="flex flex-col justify-center items-center w-full p-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="w-10 p-2 bg-green-600 text-white hover:bg-green-700 rounded"
                    onClick={handleAddRoom}
                >
                    +
                </Button>                
            </div>
            
            <Separator className="mt-4 mb-4"></Separator>
        </div>
    )
}

export { BuildingDepositSection }
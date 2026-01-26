import { Input, Label } from "@/components/ui";
import { formatDecimalInput } from "@/utils/formatDecimalInput";
import { useMemo } from "react";
import { RequiredMark } from "@/components/common/etc/RequiredMark";

interface AreaSectionProps {
    propertytype: string | undefined;
    areaGround: string;           //대지면적
    areaGrossfloor: string;       //연명적
    areaSupply: string;           //공급면적
    areaExclusive: string;        //전용면적
    areaType: string;             //타입
    areaReference: string;        //참고면적
    arealand_Share: string;       //대지지분
    onAreaGroundChange: (Ground: string) => void;
    onAreaGrossFloorChange: (Grossfloor: string) => void;
    onAreaSupplyChange: (Supply: string) => void;
    onAreaTypeChange: (Type: string) => void;
    onAreaExclusiveChange: (Exclusive: string) => void;
    onAreaReferenceChange: (Reference: string) => void;
    onAreaLandShareChange: (land_Share: string) => void;
}

function AreaSection({ propertytype, areaGround, areaGrossfloor, areaSupply, areaExclusive, areaType, areaReference, arealand_Share,
    onAreaGroundChange, onAreaGrossFloorChange, onAreaSupplyChange, onAreaExclusiveChange, onAreaTypeChange, onAreaReferenceChange, onAreaLandShareChange
}: AreaSectionProps) {
    const isLand = ["토지"].includes(propertytype || "");
    const isGround = ["단독주택(임대)", "상업/업무/공업용", "건물"].includes(propertytype || "");
    const isGrossFloor = ["단독주택(임대)", "상업/업무/공업용", "건물"].includes(propertytype || "");
    const isSupply = ["아파트", "오피스텔", "공동주택(아파트 외)", "단독주택(임대)", "상업/업무/공업용"].includes(propertytype || "");
    const islandShare = ["아파트", "오피스텔", "공동주택(아파트 외)"].includes(propertytype || "");
    const isType = ["상업/업무/공업용", "단독주택(임대)"].includes(propertytype || "");

    // 모든 hooks는 조건부 렌더링 전에 호출되어야 함
    const areaGroundPyeong = useMemo(() => {
        const plainValue = areaGround.replace(/,/g, "");
        const numericValue = parseFloat(plainValue);
        if (isNaN(numericValue)) return "0 평";
        return `${(numericValue / 3.3).toFixed(2)} 평`;
    }, [areaGround]);

    const areaGrossfloorPyeong = useMemo(() => {
        const plainValue = areaGrossfloor.replace(/,/g, "");
        const numericValue = parseFloat(plainValue);
        if (isNaN(numericValue)) return "0 평";
        return `${(numericValue / 3.3).toFixed(2)} 평`;
    }, [areaGrossfloor]);

    const areaSupplyPyeong = useMemo(() => {
        const plainValue = areaSupply.replace(/,/g, "");
        const numericValue = parseFloat(plainValue);
        if (isNaN(numericValue)) return "0 평";
        return `${(numericValue / 3.3).toFixed(2)} 평`;
    }, [areaSupply]);

    const areaExclusivePyeong = useMemo(() => {
        const plainValue = areaExclusive.replace(/,/g, "");
        const numericValue = parseFloat(plainValue);
        if (isNaN(numericValue)) return "0 평";
        return `${(numericValue / 3.3).toFixed(2)} 평`;
    }, [areaExclusive]);

    const arealandSharePyeong = useMemo(() => {
        const plainValue = arealand_Share.replace(/,/g, "");
        const numericValue = parseFloat(plainValue);
        if (isNaN(numericValue)) return "0 평";
        return `${(numericValue / 3.3).toFixed(2)} 평`;
    }, [arealand_Share]);

    return (
        <div className="flex-col p-3">
            <div className="flex pb-3">
                <Label className="text-xl font-bold gap-4">면적정보</Label>
                <span className="ml-2 px-1.5 py-0.5 rounded bg-red-600 text-white text-sm font-semibold">필수</span>
            </div>
            {isLand && (
                <div className="flex flex-row w-2/3 items-center space-x-2 p-1">
                    <div className="flex flex-row w-1/4 items-center">
                        <Label className="text-base text-left">면적<RequiredMark/></Label>
                    </div>
                    
                    <Input
                        className="w-1/3 font-bold text-right"
                        type="text"
                        placeholder="0"
                        value={areaGround}
                        onChange={(e) => onAreaGroundChange(formatDecimalInput(e.target.value))}
                    />
                    <Label className="text-base w-1/12">㎡</Label>
                    <span className="text-sm text-gray-500 text-right w-1/6">
                        {useMemo(() => {
                            const plainValue = areaGround.replace(/,/g, "");
                            const numericValue = parseFloat(plainValue);
                            if (isNaN(numericValue)) return "0 평";
                            return `${(numericValue / 3.3).toFixed(2)} 평`;
                        }, [areaGround])}
                    </span>
                </div>
            )}

            {isGround && (
                <div className="flex flex-row w-2/3 items-center space-x-2 p-1">
                    <div className="flex flex-row w-1/4 items-center">
                        <Label className="text-base text-left">대지면적</Label>
                        {!isSupply && (
                            <RequiredMark/>
                        )}
                    </div>
                    
                    <Input
                        className="w-1/3 font-bold text-right"
                        type="text"
                        placeholder="0"
                        value={areaGround}
                        onChange={(e) => onAreaGroundChange(formatDecimalInput(e.target.value))}
                    />
                    <Label className="text-base w-1/12">㎡</Label>
                    <span className="text-sm text-gray-500 text-right w-1/6">
                        {areaGroundPyeong}
                    </span>
                </div>
            )}

            {isGrossFloor && (
                <div className="flex flex-row w-2/3 items-center space-x-2 p-1">
                    <div className="flex flex-row w-1/4 items-center">
                        <Label className="text-base text-left">연면적</Label>
                        {!isSupply && (
                            <RequiredMark/>
                        )}
                    </div>
                    <Input
                        className="w-1/3 font-bold text-right"
                        type="text"
                        placeholder="0"
                        value={areaGrossfloor}
                        onChange={(e) => onAreaGrossFloorChange(formatDecimalInput(e.target.value))}
                    />
                    <Label className="text-base w-1/12">㎡</Label>

                    <span className="text-sm text-gray-500 text-right w-1/6">
                        {areaGrossfloorPyeong}
                    </span>
                </div>
            )}


            {isSupply && (
                <>
                    {/* 참고면적 */}
                    <div className="flex flex-row w-2/3 items-center space-x-2 p-1">
                        <div className="flex flex-row w-1/4 items-center">
                            <Label className="text-base text-left">참고면적<RequiredMark/></Label>
                        </div>
                        <Input
                            className="w-1/3 font-bold text-right"
                            type="text"
                            placeholder="0"
                            value={areaReference}
                            onChange={(e) => onAreaReferenceChange(formatDecimalInput(e.target.value))}
                        />
                        <Label className="text-base text-red-600 font-bold w-1/12">평</Label>
                    </div>
                    <div className="flex flex-row w-2/3 items-center space-x-2 p-1">
                        <Label className="text-base w-1/4 text-left">공급면적</Label>
                        <Input
                            className="w-1/3 font-bold text-right"
                            type="text"
                            placeholder="0"
                            value={areaSupply}
                            onChange={(e) => onAreaSupplyChange(formatDecimalInput(e.target.value))}
                        />
                        <Label className="text-base w-1/12">㎡</Label>
                        <span className="text-sm text-gray-500 text-right w-1/6">
                            {areaSupplyPyeong}
                        </span>
                    </div>

                    {/* 전용면적 */}
                    <div className="flex flex-row">
                        <div className="flex flex-row w-2/3 items-center space-x-2 p-1">
                            <Label className="text-base w-1/4 text-left">전용면적</Label>
                            <Input
                                className="w-1/3 font-bold text-right"
                                type="text"
                                placeholder="0"
                                value={areaExclusive}
                                onChange={(e) => onAreaExclusiveChange(formatDecimalInput(e.target.value))}
                            />
                            <Label className="text-base w-1/12">㎡</Label>
                            <span className="text-sm text-gray-500 text-right w-1/6">
                                {areaExclusivePyeong}
                            </span>
                        </div>
                        {!isType &&(
                            <div className="flex flex-row w-1/3 items-center  space-x-2 p-1">
                                <Label className="text-base w-1/4 text-center">타입</Label>
                                <Input
                                    className="w-1/3 font-bold text-right"
                                    type="text"
                                    placeholder="A"
                                    value={areaType}
                                    onChange={(e) => onAreaTypeChange(e.target.value)}
                                />
                            </div>
                        )}
                    </div>                    
                </>

            )}


            {/* 대지지분 */}
            {islandShare && (
                <div className="flex flex-row w-2/3 items-center space-x-2 p-1">
                    <Label className="text-base w-1/4 text-left">대지지분</Label>
                    <Input
                        className="w-1/3 font-bold text-right"
                        type="text"
                        placeholder="0"
                        value={arealand_Share}
                        onChange={(e) => onAreaLandShareChange(formatDecimalInput(e.target.value))}
                    />
                    <Label className="text-base w-1/12">㎡</Label>
                    <span className="text-sm text-gray-500 text-right w-1/6">
                        {arealandSharePyeong}
                    </span>
                </div>
            )}
        </div>
    )
}

export { AreaSection };
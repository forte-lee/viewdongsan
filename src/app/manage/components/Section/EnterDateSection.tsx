import { Button, Checkbox, Input, Label, LabelDatePicker } from "@/components/ui";

interface EnterDateSectionProps {
    propertytype: string | undefined;
    enterDate: Date | undefined;      //입주가능일
    enterIsDiscuss: boolean;
    enterIsNow: boolean;
    enterIsHasi: boolean;

    onEnterDateChange: (enterDate: Date | undefined) => void;
    onEnterDateIsDiscussToggle: (enterIsDiscuss: boolean) => void;
    onEnterDateIsNowToggle: (enterIsNow: boolean) => void;
    onEnterDateIsHasiToggle: (enterIsHasi: boolean) => void;
}

function EnterDateSection(
    { propertytype, enterDate, enterIsDiscuss, enterIsNow, enterIsHasi, 
        onEnterDateChange, onEnterDateIsDiscussToggle, onEnterDateIsNowToggle, onEnterDateIsHasiToggle}: EnterDateSectionProps) {

    const enterdatename = (() => {
        switch (propertytype) {
            case "토지":
                return "거래가능일";
            default:
                return "입주가능일";
        }
    })();
            
    return (
        <div className="flex-col p-3">
            <div className="flex pb-3">
                <label className="text-xl font-bold gap-4">
                    입주예정일
                </label>
                <span className="ml-2 px-1.5 py-0.5 rounded bg-red-600 text-white text-sm font-semibold">필수</span>
            </div>           

            {/* 입주가능일 */}
            <div className="flex flex-row w-full items-center gap-3 p-2">
                <div className="flex flex-row w-full items-center justify-between space-x-2 p-1">
                    <div className="flex flex-row items-center w-1/2">                        
                        <Label className="text-base text-left">{enterdatename}</Label>
                        <LabelDatePicker label="" value={enterDate} onChange={onEnterDateChange} />                        
                    </div>
                    <div className="flex flex-row w-1/6 items-center gap-2">
                        <Checkbox
                                id={`self-checkbox`}
                                checked={enterIsDiscuss}
                                onCheckedChange={() => onEnterDateIsDiscussToggle(!enterIsDiscuss)}
                            />
                        <Label htmlFor={`self-checkbox`} className="text-base">협의</Label>
                    </div>
                    <div className="flex flex-row w-1/6 items-center gap-2">
                        <Checkbox
                                id={`self-checkbox`}
                                checked={enterIsNow}
                                onCheckedChange={() => onEnterDateIsNowToggle(!enterIsNow)}
                            />
                        <Label htmlFor={`self-checkbox`} className="text-base">즉시</Label>
                    </div>
                    <div className="flex flex-row w-1/6 items-center gap-2">
                        <Checkbox
                                id={`self-checkbox`}
                                checked={enterIsHasi}
                                onCheckedChange={() => onEnterDateIsHasiToggle(!enterIsHasi)}
                            />
                        <Label htmlFor={`self-checkbox`} className="text-base">하시</Label>
                    </div>
                </div>
            </div>
        </div>
    );
}

export { EnterDateSection };
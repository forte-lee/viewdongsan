import { Checkbox, Label } from "@/components/ui";
import { PopupDatePicker } from "@/components/ui/date-picker/PopupDatePicker";

interface Props {
    enterDateCheck: boolean;
    enterDate: Date | undefined;      //입주가능일
    enterIsDiscuss: boolean;
    enterIsNow: boolean;

    onEnterDateCheckChange: (enterDateCheck: boolean) => void;
    onEnterDateChange: (enterDate: Date | undefined) => void;
    onEnterDateIsDiscussToggle: (enterIsDiscuss: boolean) => void;
    onEnterDateIsNowToggle: (enterIsNow: boolean) => void;
}


function GuestEnterDateSection(
    { enterDateCheck, enterDate, enterIsDiscuss, enterIsNow, 
        onEnterDateCheckChange, onEnterDateChange, onEnterDateIsDiscussToggle, onEnterDateIsNowToggle}: Props) {

    return (
        <div className="flex flex-row p-1 items-center pt-3">
            <div className="flex flex-col w-[30px]">
                <Label
                    htmlFor={`enterdate-checkbox`}
                    className="text-xs"                            
                >
                </Label>
                <Checkbox
                    id={`enterdate-checkbox`}
                    checked={enterDateCheck}
                    onCheckedChange={() => onEnterDateCheckChange(!enterDateCheck)}
                />
            </div>
            <div className="flex flex-col w-[100px]">
                <Label className="text-base p-1 text-left">입주가능일</Label>
            </div>
            <div className="flex flex-col w-[200px] items-center">
                <PopupDatePicker label="" value={enterDate} onChange={onEnterDateChange} />                        
            </div>
            <div className="flex flex-row w-[100px] items-center gap-2 pl-5">
                <Checkbox
                        id={`self-checkbox`}
                        checked={enterIsDiscuss}
                        onCheckedChange={() => onEnterDateIsDiscussToggle(!enterIsDiscuss)}
                    />
                <Label htmlFor={`self-checkbox`} className="text-base">협의</Label>
            </div>
            <div className="flex flex-row w-[100px] items-center gap-2">
                <Checkbox
                        id={`self-checkbox`}
                        checked={enterIsNow}
                        onCheckedChange={() => onEnterDateIsNowToggle(!enterIsNow)}
                    />
                <Label htmlFor={`self-checkbox`} className="text-base">즉시</Label>
            </div>                    
        </div>
    );
}

export { GuestEnterDateSection };
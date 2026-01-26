'use client';

import { addYears } from "date-fns";

import { Popover, PopoverTrigger } from "@/components/ui";
import DatePicker from "react-datepicker";

interface Props {
    label: string;
    isReadOnly?: boolean;
    value: Date | undefined;
    onChange: (date: Date | undefined) => void;
}

function LabelDatePicker({ label, isReadOnly, value, onChange }: Props) {
    
    // 최대 10년 후 날짜 계산
    const maxFutureDate = addYears(new Date(), 10);

    return (
        <div className="max-w-64 flex items-center gap-3">
            <span className="text-sm font-medium leading-none text-[#6d6d6d]">{label}</span>
            {/* Shadcn UI - Calendar */}
            <Popover>
                <PopoverTrigger asChild>
                    <DatePicker     
                        locale="ko" // 한국어 로캘 적용
                        selected={value}
                        onChange={(date: Date | null) =>
                            onChange(date || undefined)
                        }
                        dateFormat="yyyy-MM-dd" // 날짜 형식
                        placeholderText="(직접 입력 시)2024-08-08"
                        className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        maxDate={maxFutureDate} // 최대 선택 가능 날짜
                        popperPlacement="bottom-start" // 달력 팝업 위치 설정
                        showYearDropdown
                        showMonthDropdown
                        dropdownMode="select" // 연도와 월 선택을 드롭다운으로 표시
                    />
                    {/* <Button
                        variant={"outline"}
                        className={cn(
                            "w-[200px] justify-start text-left font-normal",
                            !value && "text-muted-foreground"
                        )}
                        disabled={isReadOnly} // "readOnly" 모드일 때 버튼 비활성화
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {value ? format(value, "yyyy-MM-dd") : <span>날짜를 선택하세요.</span>}
                    </Button> */}
                </PopoverTrigger>
                {/* {!isReadOnly && (

                    <PopoverContent className="w-auto p-0">                        
                        <Calendar
                            mode="single"
                            selected={value}
                            onSelect={onChange}
                            initialFocus                                                        
                        />
                        
                    </PopoverContent>
                )} */}
            </Popover>
        </div>
    )
}

export { LabelDatePicker };
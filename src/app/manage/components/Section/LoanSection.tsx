import { Input, Label } from '@/components/ui';
import { formatNumberInput } from '@/utils/formatNumberInput';
import { numberToKorean } from '@/utils/numberToKorean';
import React from 'react'

interface LoanSectionProps {
    loan_held: string;                 //기대출
    loan_availability: string;         //대출가능여부

    onLoanHeldChange: (loan_held: string) => void;
    onLoanAvailabilityChange: (loan_availability: string) => void;
}

function LoanSection({ loan_held, onLoanHeldChange }: LoanSectionProps) {
    // const available = ["일반", "HUG", "LH", "버팀목", "기타"];
    return (
        <div className="flex-col p-3">
            <div className="flex pb-3">
                <Label className="text-xl font-bold gap-4">융자</Label>
            </div>
            <div className="flex flex-row w-full items-center p-1">
                <div className="w-1/2">
                    <div className="flex flex-row items-center space-x-2 p-1">
                        <Label className="text-base w-1/4 text-center">융자</Label>
                        <Input
                            className="w-full font-bold text-right"
                            type="text"
                            placeholder="20,000"
                            value={loan_held}
                            onChange={(e) => onLoanHeldChange?.(formatNumberInput(e.target.value))}
                        />  
                        <Label className="text-base w-1/4 text-left">원</Label>
                    </div>
                    <div className="flex items-center space-x-2 p-1">
                        <Label className="flex w-full text-sm text-right justify-center text-gray-500">
                            {numberToKorean(loan_held.replace(/,/g, ""))}
                        </Label>
                    </div>
                </div>
            </div>
        </div>
    )
}

export { LoanSection }
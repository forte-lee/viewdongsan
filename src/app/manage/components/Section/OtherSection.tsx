import { Label, Textarea } from '@/components/ui';
import React, { useRef, useEffect } from 'react';

interface OtherSectionProps {
    propertytype: string | undefined;
    other_information: string; // 기타사항
    onOtherInformationChange: (other_information: string) => void;
}

function OtherSection({ propertytype, other_information, onOtherInformationChange }: OtherSectionProps) {
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    // 입력 내용에 따라 자동으로 높이 조절
    useEffect(() => {
        if (textAreaRef.current) {
            textAreaRef.current.style.height = "auto"; // 높이 초기화
            textAreaRef.current.style.height = textAreaRef.current.scrollHeight + "px"; // 내용에 맞게 높이 조절
        }
    }, [other_information]);

    const memoPlaceholder = (() => {
        switch (propertytype) {
            case "아파트":
                return "커뮤니티, 리모델링, 재개발, 명도, 실거주 등";
            case "오피스텔":
                return "전입신고 안하는 조건, 사업자만, 어메니티 등";
            case "공동주택(아파트 외)":
                return "쪼갠호실, 전입불가, 대출여부, 명도여부 등";
            case "단독주택(임대)":
                return "전입불가, 대출여부, 리모델링 등";
            case "상업/업무/공업용":
                return "렌트프리, 인테리어, 전대여부, 철거 등";
            case "건물":
                return "진입도로유무, 렌트프리, 전대여부, 수익률, 명도 등";
            case "토지":
                return "현재용도, 가능한 행위(건축물 등), 평단가, 도시계획 등";
            default:
                return "확인필요";
        }
    })();

    return (
        <div className="flex-col p-3">
            {/* 제목 */}
            <div className="flex pb-3">
                <Label className="text-xl font-bold gap-4">특이사항(외부노출)</Label>                
                <span className="ml-2 px-1.5 py-0.5 rounded bg-red-600 text-white text-sm font-semibold">필수</span>
            </div>  

            {/* 자동 높이 조절이 되는 shadcn-ui Textarea */}
            <Textarea
                ref={textAreaRef}
                className="w-full font-bold text-left p-2 border border-gray-300 rounded-md resize-none overflow-hidden"
                placeholder={memoPlaceholder}
                value={other_information}
                onChange={(e) => onOtherInformationChange(e.target.value)}
                rows={1} // 최소 한 줄
            />
        </div>
    );
}

export { OtherSection };

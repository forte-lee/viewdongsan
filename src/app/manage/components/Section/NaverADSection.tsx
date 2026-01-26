import { Input, Label } from '@/components/ui';

interface NaverADSectionProps {
    naver_ad_number: string;           //네이버 광고
    onNaverADNumberChange: (naver_ad_number: string) => void;
}

function NaverADSection({ naver_ad_number, onNaverADNumberChange }: NaverADSectionProps) {
    return (
        <div className="flex-col p-3">
            <div className="flex pb-3">
                <Label className="text-xl font-bold gap-4">광고</Label>
            </div>
            <div className="flex flex-row w-full items-center p-1">
                <div className="flex flex-row w-1/2 items-center space-x-2 p-1">
                    <Label className="text-base w-1/2 text-left">네이버 광고번호</Label>
                    
                    <Input
                        className="w-1/2 font-bold text-right"
                        type="text"
                        placeholder="광고번호"
                        value={naver_ad_number}
                        onChange={(e) => {
                            const numericValue = e.target.value.replace(/[^0-9]/g, ""); // 숫자만 허용
                            onNaverADNumberChange(numericValue);
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

export { NaverADSection }
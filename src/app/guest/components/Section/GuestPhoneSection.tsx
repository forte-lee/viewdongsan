import { Button, Input, Label } from '@/components/ui'

interface Props {
    phones: string[];
    onPhoneChange: (phones: string[]) => void;
}

function GuestPhoneSection({ phones, onPhoneChange }: Props) {

    // 전화번호 입력을 세 부분으로 분리하여 업데이트하는 함수
    const handlePhoneSegmentChange = (index: number, segmentIndex: number, value: string) => {
        // 숫자만 허용
        const numericValue = value.replace(/\D/g, "");

        // 현재 전화번호를 분할하여 저장
        const phoneParts = phones[index]?.split("-") || ["", "", ""];

        // 만약 입력 필드가 비었을 경우 기본적으로 빈 문자열 유지 (값이 자동 이동하는 문제 방지)
        if (numericValue === "") {
            phoneParts[segmentIndex] = "";
        } else {
            phoneParts[segmentIndex] = numericValue;
        }

        // 기존 전화번호 유지 (하이픈 포함)
        const updatedPhones = [...phones];
        updatedPhones[index] = phoneParts.join("-"); // 값이 이동하지 않도록 변경
        onPhoneChange(updatedPhones);
    };

    const handleAddPhone = () => {
        onPhoneChange([...phones, "--"]); // 공백 입력 방지
    };

    const handleRemovePhone = (index: number) => {
        const updatedPhones = phones.filter((_, i) => i !== index);

        onPhoneChange(updatedPhones);
    };

    return (
        <div className="flex flex-row p-1 items-center pt-3">
            <div className="flex flex-col w-[30px]">

            </div>
            <div className="flex flex-col w-[100px]">
                <Label className="text-base p-1 text-left">연락처</Label>
            </div>
            <div className= "flex flex-col">
                {phones.map((phone, index) => {
                    const phoneParts = phone ? phone.split("-") : ["", "", ""];

                    return (
                        <div key={index} className="flex items-center w-full max-w-2xl space-x-2 mb-4">
                            {/* 전화번호 입력 필드를 3개로 분할 */}
                            <Input
                                type="text"
                                placeholder="010"
                                maxLength={3}
                                value={phoneParts[0] || ""}
                                onChange={(e) => handlePhoneSegmentChange(index, 0, e.target.value)}
                                className="w-16 text-center"
                            />
                            <span>-</span>
                            <Input
                                type="text"
                                placeholder="1234"
                                maxLength={4}
                                value={phoneParts[1] || ""}
                                onChange={(e) => handlePhoneSegmentChange(index, 1, e.target.value)}
                                className="w-20 text-center"
                            />
                            <span>-</span>
                            <Input
                                type="text"
                                placeholder="5678"
                                maxLength={4}
                                value={phoneParts[2] || ""}
                                onChange={(e) => handlePhoneSegmentChange(index, 2, e.target.value)}
                                className="w-20 text-center"
                            />
                            {/* 삭제 버튼 */}
                            <Button
                                variant="outline"
                                size="sm"
                                className="p-2 bg-red-600 text-white hover:bg-red-700 rounded"
                                onClick={() => handleRemovePhone(index)}
                            >
                                삭제
                            </Button>
                        </div>
                    );
                })}
                
                {/* 추가 버튼 */}
                <Button
                    variant="outline"
                    size="sm"
                    className="w-10 p-2 bg-green-600 text-white hover:bg-green-700 rounded"
                    onClick={handleAddPhone}
                >
                    +
                </Button>
            </div>
        </div>
    )
}

export { GuestPhoneSection }
import { Button, Input, Label } from "@/components/ui";

interface PhoneSectionProps {
    phones: string[]; // 연락처 배열
    phoneOwners: string[]; // 연락처 주인 배열
    phoneTelecom: string[]; // 연락처 통신사 배열
    onPhoneChange: (phones: string[]) => void; // 연락처 업데이트 핸들러
    onPhoneOwnerSelect: (phoneOwners: string[]) => void; // 연락처 주인 업데이트 핸들러
    onPhoneTelecomChange: (phoneTelecom: string[]) => void; // 연락처 통신사 업데이트 핸들러
}

function PhoneSection({
    phones,
    phoneOwners,
    phoneTelecom,
    onPhoneChange,
    onPhoneOwnerSelect,
    onPhoneTelecomChange,
}: PhoneSectionProps) {
    const availablePhoneOwners = ["소유자", "가족", "관리자", "임차인", "기타"];

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
        onPhoneOwnerSelect([...phoneOwners, ""]);
        onPhoneTelecomChange([...phoneTelecom, ""]);
    };

    const handleRemovePhone = (index: number) => {
        const updatedPhones = phones.filter((_, i) => i !== index);
        const updatedPhoneOwners = phoneOwners.filter((_, i) => i !== index);
        const updatedPhoneTelecom = phoneTelecom.filter((_, i) => i !== index);

        onPhoneChange(updatedPhones);
        onPhoneOwnerSelect(updatedPhoneOwners);
        onPhoneTelecomChange(updatedPhoneTelecom);
    };

    const handlePhoneTelecomChange = (index: number, value: string) => {
        const updatedPhoneTelecom = [...phoneTelecom];
        updatedPhoneTelecom[index] = value;
        onPhoneTelecomChange(updatedPhoneTelecom);
    };

    const handlePhoneOwnerSelect = (index: number, owner: string) => {
        const updatedPhoneOwners = [...phoneOwners];
        updatedPhoneOwners[index] = owner;
        onPhoneOwnerSelect(updatedPhoneOwners);
    };

    return (
        <div className="flex-col p-3">
            <div className="flex pb-3">
                <Label className="text-xl font-bold gap-4">연락처
                <span className="ml-2 px-1.5 py-0.5 rounded bg-red-600 text-white text-sm font-semibold">필수</span>
                </Label>
            </div>
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

                        {/* 통신사 입력 */}
                        <Input
                            type="text"
                            placeholder="통신사(선택입력)"
                            value={phoneTelecom[index] || ""}
                            onChange={(e) => handlePhoneTelecomChange(index, e.target.value)}
                            className="w-28"
                        />

                        {/* 연락처 주인 선택 버튼 */}
                        <div className="flex gap-2">
                            {availablePhoneOwners.map((owner) => (
                                <Button
                                    variant="outline"
                                    key={`${index}-${owner}`}
                                    className={`p-2 text-sm border-solid text-black border-[#ddd] bg-[#f9f9f9] hover:bg-blue-100 cursor-pointer ${
                                        phoneOwners[index] === owner
                                            ? "bg-[#007bff] text-white border-[#0056b3] hover:bg-[#007bff] hover:text-white]"
                                            : ""
                                    }`}
                                    onClick={() => handlePhoneOwnerSelect(index, owner)}
                                >
                                    {owner}
                                </Button>
                            ))}
                        </div>

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
    );
}

export { PhoneSection };

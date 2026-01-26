import { Button, Input, Label } from "@/components/ui";

interface ManagerSectionProps{
    selectedManager: string;
    managerMemo: string;
    onManagerSelect: (manager: string) => void;
    onManagerMemoChange: (manager_memo: string) => void;
}

function ManagerSection({selectedManager, managerMemo, onManagerSelect, onManagerMemoChange} : ManagerSectionProps) {
    const managers = ["일반매물", "개인매물", "타부동산"]

    return (
        <div className="flex-col p-3">
            <div className="flex pb-3">
                <Label className="text-xl font-bold gap-4">관리처
                <span className="ml-2 px-1.5 py-0.5 rounded bg-red-600 text-white text-sm font-semibold">필수</span>
                </Label>
            </div>
            <div className="flex gap-3">
                {managers.map((manager) => (
                    <Button
                        key={manager}
                        variant="outline"
                        className={`
                            ${"p-5 text-sm border-solid text-black border-[#ddd] bg-[#f9f9f9] hover:bg-blue-100 cursor-pointer"} 
                            ${selectedManager === manager ? "bg-[#007bff] text-white border-[#0056b3] hover:bg-[#007bff] hover:text-white]" : ""
                                }`}
                        onClick={() => onManagerSelect(manager)}
                    >
                        {manager}
                    </Button>
                ))}
                <Input
                        className="w-1/4 font-bold text-left"
                        type="text"
                        placeholder="비고"
                        value={managerMemo}
                        onChange={(e) => onManagerMemoChange(e.target.value)}
                    />
            </div>
        </div>
    )
}

export { ManagerSection }
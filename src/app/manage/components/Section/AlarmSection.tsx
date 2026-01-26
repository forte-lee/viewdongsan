import { Button, Label } from "@/components/ui";

interface AlarmSectionProps {
    selectedAlarm: string;
    onAlarmSelect: (alarm: string) => void;
}

function AlarmSection({ selectedAlarm, onAlarmSelect }: AlarmSectionProps) {
    const alarms = ["없음", "1", "3", "5", "7", "10", "15", "20", "30"];

    return (
        <div className="flex-col p-3">
            <div className="flex pb-3">
                <Label className="text-xl font-bold gap-4">알람주기</Label>
            </div>
            <div className="flex gap-3">
                {alarms.map((alarm) => (
                    <Button
                        key={alarm}
                        variant="outline"
                        className={`
                            ${"p-5 text-sm border-solid text-black border-[#ddd] bg-[#f9f9f9] hover:bg-blue-100 cursor-pointer"} 
                            ${selectedAlarm === alarm ? "bg-[#007bff] text-white border-[#0056b3] hover:bg-[#007bff] hover:text-white]" : ""
                                }`}
                        onClick={() => onAlarmSelect(alarm)}
                    >
                        {alarm}
                    </Button>
                ))}
            </div>
        </div>
    )
}

export { AlarmSection } 
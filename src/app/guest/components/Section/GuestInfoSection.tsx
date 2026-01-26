import { Button, Input, Label } from '@/components/ui'

interface Props {
    name: string;
    sex: string;
    onNameChange: (name: string) => void;
    onSexChange: (name: string) => void;
}

function GuestInfoSection({ name, sex, onNameChange, onSexChange }: Props) {
    const sexs = ["남", "여"];

    return (        
        <div className="flex flex-row p-1 items-center">
            <div className="flex flex-col w-[30px]">

            </div>
            <div className="flex flex-col w-[100px]">
                <Label className="text-base p-1 text-left">이름</Label>
            </div>
            <div className="flex w-[110px] gap-3 items-center">
                <Input
                    className="w-full text-left"
                    type="text"
                    placeholder="-"
                    value={name}
                    onChange={(e) => onNameChange(e.target.value)}
                />
            </div>
            <div className="flex flex-row w-[220px] items-center space-x-2 p-1">
                <Label className="text-base w-[70px] gap-4 text-center">성별</Label>
                {sexs.map((data) => (
                    <Button
                        key={data}
                        variant="outline"
                        className={`
                    ${"p-5 text-sm border-solid text-black border-[#ddd] bg-[#f9f9f9] hover:bg-blue-100 cursor-pointer"} 
                    ${sex === data ? "bg-[#007bff] text-white border-[#0056b3] hover:bg-[#007bff] hover:text-white]" : ""
                            }`}
                        onClick={() => onSexChange(data)}
                    >
                        {data}
                    </Button>
                ))}
            </div>
        </div>
    )
}

export { GuestInfoSection }
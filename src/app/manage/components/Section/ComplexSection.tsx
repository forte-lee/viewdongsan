import { Input, Label } from "@/components/ui";

interface ComplexSectionProps {    
    propertytype: string | undefined;
    complex_name: string;
    onComplexNameChange: (complex_name: string) => void;
}

function ComplexSection({ propertytype, complex_name, onComplexNameChange }: ComplexSectionProps) {
    
    const isBuilding = ["아파트", "오피스텔"].includes(propertytype || "");

    return (
        <div className="flex-col p-3">
            <div className="flex pb-3">
                <Label className="text-xl font-bold gap-4">단지명</Label>
                {isBuilding && (                    
                    <span className="ml-2 px-1.5 py-0.5 rounded bg-red-600 text-white text-sm font-semibold">필수</span>
                )}
            </div>            
            <div className="flex w-full items-center space-x-2 p-1">
                <Input
                    type="text"
                    placeholder="띄어쓰기 없이 단지명을 입력하세요."
                    value={complex_name}
                    onChange={(e) => onComplexNameChange(e.target.value)}
                />
            </div>
        </div>
    )
}

export { ComplexSection }
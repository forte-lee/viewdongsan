import { Button } from "@/components/ui";
import { Copy } from "lucide-react";

interface CopyableFieldProps {
    label: string;
    value?: string | number | null;
}

export function CopyableField({ label, value }: CopyableFieldProps) {
    const displayValue = value && value !== "" ? value : "-";

    const handleCopy = async () => {
        const text = String(value ?? "");
        if (typeof navigator !== "undefined" && navigator.clipboard) {
            try {
                await navigator.clipboard.writeText(text);
                alert(`${label} 복사 완료!`);
            } catch (err) {
                console.error("Clipboard API 실패:", err);
            }
        } else {
            alert("⚠️ Clipboard API를 사용할 수 없는 환경입니다. (http://localhost 또는 HTTPS에서 실행하세요)");
        }
    };



    return (
        <div className="flex items-center border rounded-md overflow-hidden">
            {/* 라벨 */}
            <div className="w-32 bg-gray-100 text-gray-700 font-semibold text-sm px-3 py-2">
                {label}
            </div>

            {/* 값 */}
            <div className="flex-1 text-sm px-3 py-2">{displayValue}</div>

            {/* 버튼 (오른쪽 끝) */}
            {/* <div className="px-2">
                <Button
                    onClick={handleCopy}
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                >
                    <Copy className="w-3 h-3 mr-1" />
                    복사
                </Button>
            </div> */}
        </div>
    );
}

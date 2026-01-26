import { Label } from "@radix-ui/react-label";

interface RequiredMarkProps {
    text?: string;   // 기본값은 [*]
    colorClass?: string; // Tailwind 색상 클래스 변경 가능
}

export function RequiredMark({
    text = "[필수]",
    colorClass = "text-red-600",
}: RequiredMarkProps) {
    return (
        <Label className={`text-base font-bold text-left ${colorClass}`}>
            {text}
        </Label>
    );
}

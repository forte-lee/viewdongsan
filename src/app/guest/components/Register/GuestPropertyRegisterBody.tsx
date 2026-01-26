import { Separator } from "@/components/ui";
import { ReactNode } from "react";

interface Props {
    children: ReactNode; // ✅ children 속성 타입 정의
}

function GuestPropertyRegisterBody({ children }: Props) {
    return (
        <div>
            {/* 바디 부분 */}
            <div className="flex w-full h-full pr-4 pl-4 overflow-auto max-h-[75vh]">
                <div className="flex w-full flex-col justify-start">
                    {children}

                    <div className="m-4"></div>
                    <Separator className="w-full m-2"></Separator>
                    <div className="m-2"></div>
                </div>
            </div>
        </div>
    );
}

export { GuestPropertyRegisterBody };

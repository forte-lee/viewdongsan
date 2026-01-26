import { useState, useRef, useEffect } from "react";
import { Button, Textarea } from "@/components/ui";
import { Property } from "@/types";
import { supabase } from "@/utils/supabase/client";

interface PropertyCardSecretMemoProps {
    property: Property;
}

function PropertyCardSecretMemo({ property }: PropertyCardSecretMemoProps) {
    const [secretMemo, setSecretMemo] = useState(property.data.secret_memo || "");
    const [isEditing, setIsEditing] = useState(false);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textAreaRef.current) {
            textAreaRef.current.style.height = "auto";
            textAreaRef.current.style.height = textAreaRef.current.scrollHeight + "px";
        }
    }, [secretMemo]);

    const updateSecretMemo = async () => {
        await supabase
            .from("property")
            .update({ data: { ...property.data, secret_memo: secretMemo } })
            .eq("id", property.id);
    };

    const handleEditToggle = () => {
        if (isEditing) updateSecretMemo();
        setIsEditing(!isEditing);
    };

    return (
        <div className="w-full flex items-center justify-between gap-2 mt-1 flex-shrink-0">
            {/* 비밀메모 입력칸 */}
            <div className="flex-1 min-w-0 w-full">
                {isEditing ? (
                    <Textarea
                        ref={textAreaRef}
                        className="w-full font-bold text-left p-2 border border-gray-300 rounded-md resize-none overflow-hidden h-6 text-xs"
                        placeholder="비밀메모를 입력하세요."
                        value={secretMemo}
                        onChange={(e) => setSecretMemo(e.target.value)}
                        rows={1}
                    />
                ) : (
                    <div
                        className="w-full h-6 text-gray-700 text-xs pl-1 pb-1 bg-gray-100 border border-gray-300 rounded-md cursor-default flex items-center truncate"
                        title={secretMemo || "비밀메모를 입력하세요."}
                    >
                        {secretMemo.split("\n")[0] || "비밀메모를 입력하세요."}
                    </div>
                )}
            </div>

            {/* 편집 버튼 */}
            <Button
                variant="outline"
                className="flex-shrink-0 text-xs w-10 h-6"
                onClick={handleEditToggle}
            >
                {isEditing ? "완료" : "편집"}
            </Button>
        </div>
    );
}

export { PropertyCardSecretMemo };

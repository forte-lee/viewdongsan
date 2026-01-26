import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui";
import { useDeleteGuestProperty } from "@/hooks/supabase/guestproperty/useDeleteGuestProperty";


interface Props {
    children: React.ReactNode;
    Id: number;
    onDelete: () => void;       //삭제 후 호출할 콜백
}

function DeleteGuestPropertyPopup({ children, Id, onDelete }: Props) {
    // const router = useRouter(); // TODO: 리다이렉트 기능 구현 시 사용
    const deleteGuestProperty = useDeleteGuestProperty(Number(Id));
    // const { isChecking, user } = useAuthCheck(); // TODO: 로그인 상태 및 사용자 정보 확인

    const handleDelete = async () => {
        const success = await deleteGuestProperty();
        if (success) {
            onDelete();
        }
    };
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>해당 매물을 정말로 삭제하시겠습니까? </AlertDialogTitle>
                    <AlertDialogDescription>
                        이 작업이 실행되면 다시 취소할 수 없습니다. <br />
                        삭제가 진행되면 해당 매물은 영구적으로 삭제됩니다.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-500">삭제</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}


export { DeleteGuestPropertyPopup };
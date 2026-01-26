import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui";
import { useDeleteProperty } from "@/hooks/apis";
import { useAtomValue } from "jotai";
import { employeesAtom } from "@/store/atoms";


interface DeletePopupProps {
    children: React.ReactNode;
    propertyId: number;
    onDelete: () => void;       //삭제 후 호출할 콜백
}

function DeletePopup({ children, propertyId, onDelete }: DeletePopupProps) {
    const router = useRouter();
    const deleteProperty = useDeleteProperty(Number(propertyId));
    // const { isChecking, user } = useAuthCheck(); // TODO: 로그인 상태 및 사용자 정보 확인
    const employees = useAtomValue(employeesAtom);
    
    // 현재 사용자의 employee_id 찾기 (UUID 우선)
    const currentEmployeeId = (() => {
        if (user?.id) {
            const employee = employees.find(emp => emp.supabase_user_id === user.id);
            if (employee) return employee.id;
        }
        return null;
    })();

    const handleDelete = async () => {
        const success = await deleteProperty();
        if (success) {
            onDelete();
            if (currentEmployeeId !== null) {
                router.push(`/manage/mylist?employeeId=${currentEmployeeId}`);
            }
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


export { DeletePopup };
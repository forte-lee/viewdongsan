"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { Employee } from "@/types";
import { Loader2 } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { Button, Input } from "@/components/ui";
import { toast } from "@/hooks/use-toast";
import CompanyListPopup from "./components/CompanyListPopup";
import { createEmployeeOnSignup } from "@/hooks/supabase/manager/useCreateEmployeeOnSignup";

interface CompanyInfo {
    company_name: string | null;
    company_phone: string | null;
    company_address: string | null;
    company_address_sub: string | null;
}

function MyInfoPage() {
    const [user, setUser] = useState<User | null>(null);
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [company, setCompany] = useState<CompanyInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCompanyPopup, setShowCompanyPopup] = useState(false);
    
    // 편집 가능한 필드들
    const [editName, setEditName] = useState("");
    const [editPhone, setEditPhone] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    useEffect(() => {
        const fetchUserInfo = async () => {
            // 저장 중이면 데이터를 다시 가져오지 않음 (덮어쓰기 방지)
            if (isSaving) {
                console.log("⏸️ 저장 중이므로 데이터 재로드 스킵");
                return;
            }
            
            console.log("🔄 사용자 정보 가져오기 시작", { isInitialLoad, isSaving });
            try {
                // 세션 확인
                const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
                
                if (sessionError || !sessionData?.session?.user) {
                    setError("로그인이 필요합니다.");
                    setLoading(false);
                    return;
                }

                const currentUser = sessionData.session.user;
                setUser(currentUser);

                const email = currentUser.user_metadata?.email || currentUser.email;
                if (!email) {
                    setError("이메일 정보를 찾을 수 없습니다.");
                    setLoading(false);
                    return;
                }

                // 1. employee 정보 가져오기 (kakao_email 우선, supabase_user_id 폴백)
                let employeeData: (Employee & Record<string, unknown>) | null = null;
                let employeeError: { message?: string } | null = null;

                const { data: byEmail, error: errByEmail } = await supabase
                    .from("employee")
                    .select("*")
                    .eq("kakao_email", email)
                    .maybeSingle();

                if (errByEmail) {
                    employeeError = errByEmail;
                } else if (byEmail) {
                    employeeData = byEmail;
                }

                if (!employeeData && currentUser.id && !employeeError) {
                    const { data: byUserId, error: errByUserId } = await supabase
                        .from("employee")
                        .select("*")
                        .eq("supabase_user_id", currentUser.id)
                        .maybeSingle();

                    if (errByUserId) {
                        employeeError = errByUserId;
                    } else if (byUserId) {
                        employeeData = byUserId;
                    }
                }

                if (!employeeData && !employeeError) {
                    // 2. employee가 없으면 생성 시도 (회원가입 직후 타이밍 이슈 대비)
                    try {
                        await createEmployeeOnSignup(currentUser);
                        const { data: afterCreate, error: errAfterCreate } = await supabase
                            .from("employee")
                            .select("*")
                            .eq("supabase_user_id", currentUser.id)
                            .maybeSingle();
                        if (!errAfterCreate && afterCreate) employeeData = afterCreate;
                    } catch (createErr) {
                        console.error("❌ employee 생성 시도 실패:", createErr);
                    }
                }

                if (employeeError) {
                    console.error("❌ 직원 정보 조회 실패:", employeeError);
                    setError("직원 정보를 가져오는 데 실패했습니다.");
                    setLoading(false);
                    return;
                }

                if (!employeeData) {
                    setError("직원 정보를 찾을 수 없습니다.");
                    setLoading(false);
                    return;
                }

                setEmployee(employeeData as Employee);
                // 편집 필드 초기화
                setEditName(employeeData.name || "");
                setEditPhone((employeeData as Employee & { phone?: string }).phone || "");
                setEditEmail(employeeData.email || "");

                // 2. company 정보 가져오기
                if (employeeData.company_id) {
                    const { data: companyData, error: companyError } = await supabase
                        .from("company")
                        .select("company_name, company_phone, company_address, company_address_sub")
                        .eq("id", employeeData.company_id)
                        .maybeSingle();

                    if (companyError) {
                        console.error("❌ 회사 정보 조회 실패:", companyError);
                        // 회사 정보 조회 실패해도 에러로 처리하지 않고 계속 진행
                        setCompany(null);
                    } else if (companyData) {
                        setCompany({
                            company_name: companyData.company_name || null,
                            company_phone: companyData.company_phone || null,
                            company_address: companyData.company_address || null,
                            company_address_sub: companyData.company_address_sub || null,
                        });
                    } else {
                        setCompany(null);
                    }
                } else {
                    setCompany(null);
                }

                // 모든 데이터 로드 완료
                setLoading(false);
                setIsInitialLoad(false);
            } catch (err) {
                console.error("❌ 오류 발생:", err);
                setError("정보를 가져오는 중 오류가 발생했습니다.");
                setLoading(false);
            }
        };

        fetchUserInfo();

        // 인증 상태 변경 감지
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user) {
                setUser(session.user);
            } else {
                setUser(null);
                setError("로그인이 필요합니다.");
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []); // 마운트 시에만 실행

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <p className="text-gray-600">정보를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-red-600 text-lg font-semibold">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
                <h1 className="text-3xl font-bold mb-8 text-gray-800">내 정보</h1>

                {/* 가입정보 */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">
                        가입정보
                    </h2>
                    <div className="space-y-3 pl-4">
                        <div className="flex items-start">
                            <span className="font-medium text-gray-600 w-32">카카오 이름:</span>
                            <span className="text-gray-800">
                                {employee?.kakao_name || "정보 없음"}
                            </span>
                        </div>
                        <div className="flex items-start">
                            <span className="font-medium text-gray-600 w-32">카카오 이메일:</span>
                            <span className="text-gray-800">
                                {employee?.kakao_email || "정보 없음"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 소속부동산정보 */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-700 border-b pb-2 flex-1">
                            소속부동산정보
                        </h2>
                        {(!employee?.company_id || !company || !company.company_name) && (
                            <Button
                                variant="secondary"
                                className="bg-blue-600 text-white hover:bg-blue-700 ml-4"
                                onClick={() => setShowCompanyPopup(true)}
                            >
                                신청
                            </Button>
                        )}
                    </div>
                    <div className="space-y-3 pl-4">
                        <div className="flex items-start">
                            <span className="font-medium text-gray-600 w-32">부동산명:</span>
                            <span className="text-gray-800">
                                {company?.company_name || "정보 없음"}
                            </span>
                        </div>
                        <div className="flex items-start">
                            <span className="font-medium text-gray-600 w-32">부동산 연락처:</span>
                            <span className="text-gray-800">
                                {company?.company_phone || "정보 없음"}
                            </span>
                        </div>
                        <div className="flex items-start">
                            <span className="font-medium text-gray-600 w-32">부동산 주소:</span>
                            <span className="text-gray-800">
                                {company?.company_address && company?.company_address_sub
                                    ? `${company.company_address} ${company.company_address_sub}`
                                    : company?.company_address || company?.company_address_sub || "정보 없음"}
                            </span>
                        </div>
                        <div className="flex items-start">
                            <span className="font-medium text-gray-600 w-32">직급:</span>
                            <span className={employee?.position === "승인대기" ? "text-red-600 font-semibold" : "text-gray-800"}>
                                {employee?.position || "정보 없음"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 개인정보 */}
                <div>
                    <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">
                        개인정보
                    </h2>
                    <div className="space-y-3 pl-4">
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-600 w-32">이름:</span>
                            <Input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="flex-1 max-w-xs"
                                placeholder="이름을 입력하세요"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-600 w-32">연락처:</span>
                            <Input
                                type="text"
                                value={editPhone}
                                onChange={(e) => setEditPhone(e.target.value)}
                                className="flex-1 max-w-xs"
                                placeholder="연락처를 입력하세요"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-600 w-32">이메일:</span>
                            <Input
                                type="email"
                                value={editEmail}
                                onChange={(e) => setEditEmail(e.target.value)}
                                className="flex-1 max-w-xs"
                                placeholder="이메일을 입력하세요"
                            />
                        </div>
                        <div className="flex justify-end mt-4">
                            <Button
                                variant="secondary"
                                className="bg-blue-600 text-white hover:bg-blue-700"
                                onClick={async () => {
                                    if (!employee?.id || !user?.user_metadata?.email) {
                                        toast({
                                            variant: "destructive",
                                            title: "오류",
                                            description: "사용자 정보를 찾을 수 없습니다.",
                                        });
                                        return;
                                    }

                                    setIsSaving(true);
                                    try {
                                        console.log("📝 업데이트 시도:", {
                                            id: employee.id,
                                            name: editName,
                                            phone: editPhone,
                                            email: editEmail,
                                        });

                                        // 1. 업데이트 실행
                                        const { data: updateData, error: updateError, count } = await supabase
                                            .from("employee")
                                            .update({
                                                name: editName,
                                                phone: editPhone,
                                                email: editEmail,
                                            })
                                            .eq("id", employee.id)
                                            .select()
                                            .single();

                                        if (updateError) {
                                            console.error("❌ 정보 수정 실패:", updateError);
                                            console.error("❌ 에러 상세:", {
                                                code: updateError.code,
                                                message: updateError.message,
                                                details: updateError.details,
                                                hint: updateError.hint,
                                            });
                                            toast({
                                                variant: "destructive",
                                                title: "수정 실패",
                                                description: updateError.message || "정보 수정에 실패했습니다.",
                                            });
                                            setIsSaving(false);
                                            return;
                                        }

                                        // count가 0이면 업데이트된 행이 없다는 의미 (RLS 정책 문제 가능성)
                                        if (count !== null && count === 0) {
                                            console.error("❌ 업데이트된 행이 없음 (count: 0) - RLS 정책 문제일 수 있음");
                                            toast({
                                                variant: "destructive",
                                                title: "수정 실패",
                                                description: "업데이트 권한이 없습니다. RLS 정책을 확인해주세요.",
                                            });
                                            setIsSaving(false);
                                            return;
                                        }

                                        if (!updateData) {
                                            console.error("❌ 업데이트된 데이터 없음");
                                            toast({
                                                variant: "destructive",
                                                title: "수정 실패",
                                                description: "업데이트된 데이터를 받아오지 못했습니다.",
                                            });
                                            setIsSaving(false);
                                            return;
                                        }

                                        console.log("✅ 업데이트 응답 데이터:", updateData);
                                        
                                        // 업데이트 응답 데이터와 입력한 값 비교
                                        const responseMatches = 
                                            updateData.name === editName &&
                                            updateData.email === editEmail &&
                                            ((updateData as Employee & { phone?: string }).phone || "") === editPhone;
                                        
                                        console.log("📊 업데이트 응답 비교:", {
                                            입력한값: { name: editName, phone: editPhone, email: editEmail },
                                            응답값: { name: updateData.name, phone: (updateData as Employee & { phone?: string }).phone, email: updateData.email },
                                            일치여부: responseMatches,
                                        });

                                        // 업데이트 응답이 입력한 값과 다르면 에러
                                        if (!responseMatches) {
                                            console.error("❌ 업데이트 응답이 입력한 값과 다름 - RLS 정책 문제 가능성");
                                            toast({
                                                variant: "destructive",
                                                title: "저장 실패",
                                                description: `업데이트 응답이 예상과 다릅니다. RLS 정책을 확인해주세요. (이메일: ${updateData.email} vs 입력: ${editEmail})`,
                                            });
                                            setIsSaving(false);
                                            return;
                                        }

                                        // 2. 실제로 DB에 저장되었는지 확인하기 위해 다시 조회 (캐시 무시)
                                        await new Promise(resolve => setTimeout(resolve, 300));
                                        
                                        const { data: verifyData, error: verifyError } = await supabase
                                            .from("employee")
                                            .select("*")
                                            .eq("id", employee.id)
                                            .single();

                                        if (verifyError) {
                                            console.error("❌ 검증 조회 실패:", verifyError);
                                            // 조회 실패해도 업데이트 응답이 정상이면 성공으로 처리
                                            console.warn("⚠️ 재조회 실패했지만 업데이트 응답은 정상이므로 성공 처리");
                                            setEmployee(updateData as Employee);
                                            setEditName(updateData.name || "");
                                            setEditPhone((updateData as Employee & { phone?: string }).phone || "");
                                            setEditEmail(updateData.email || "");
                                            
                                            toast({
                                                title: "수정 완료",
                                                description: "개인정보가 성공적으로 수정되었습니다.",
                                            });
                                            setIsSaving(false);
                                            return;
                                        }

                                        console.log("🔍 DB에서 조회한 실제 데이터:", verifyData);
                                        console.log("📊 최종 비교:", {
                                            입력한값: { name: editName, phone: editPhone, email: editEmail },
                                            업데이트응답: { name: updateData.name, phone: (updateData as Employee & { phone?: string }).phone, email: updateData.email },
                                            DB조회값: {
                                                name: verifyData.name,
                                                phone: (verifyData as Employee & { phone?: string }).phone,
                                                email: verifyData.email,
                                            },
                                        });

                                        // 3. DB 조회 값과 입력한 값 비교 (약간의 차이는 허용 - DB 트리거 등으로 인한 변경 가능)
                                        const dbMatches = 
                                            verifyData.name === editName &&
                                            verifyData.email === editEmail &&
                                            ((verifyData as Employee & { phone?: string }).phone || "") === editPhone;

                                        if (!dbMatches) {
                                                console.warn("⚠️ DB 조회 값이 입력한 값과 약간 다름 (트리거 등으로 인한 변경 가능):", {
                                                입력한값: { name: editName, phone: editPhone, email: editEmail },
                                                DB조회값: {
                                                    name: verifyData.name,
                                                    phone: (verifyData as Employee & { phone?: string }).phone,
                                                    email: verifyData.email,
                                                },
                                            });
                                            
                                            // 업데이트 응답이 정상이면 성공으로 처리 (DB 조회는 캐시 문제일 수 있음)
                                            if (responseMatches) {
                                                console.log("✅ 업데이트 응답이 정상이므로 성공 처리");
                                                setEmployee(updateData as Employee);
                                                setEditName(updateData.name || "");
                                                setEditPhone((updateData as Employee & { phone?: string }).phone || "");
                                                setEditEmail(updateData.email || "");
                                                
                                                toast({
                                                    title: "수정 완료",
                                                    description: "개인정보가 성공적으로 수정되었습니다.",
                                                });
                                                setIsSaving(false);
                                                return;
                                            }
                                        }

                                        // 4. 모든 검증 통과 - 로컬 상태 업데이트
                                        setEmployee(verifyData as Employee);
                                        
                                        // 5. 입력 필드도 업데이트된 데이터로 갱신
                                        setEditName(verifyData.name || "");
                                        setEditPhone((verifyData as Employee & { phone?: string }).phone || "");
                                        setEditEmail(verifyData.email || "");
                                        
                                        console.log("✅ 저장 완료 및 상태 업데이트");
                                        
                                        toast({
                                            title: "수정 완료",
                                            description: "개인정보가 성공적으로 수정되었습니다.",
                                        });
                                    } catch (err) {
                                        console.error("❌ 오류 발생:", err);
                                        toast({
                                            variant: "destructive",
                                            title: "오류 발생",
                                            description: "정보 수정 중 오류가 발생했습니다.",
                                        });
                                    } finally {
                                        setIsSaving(false);
                                    }
                                }}
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        저장 중...
                                    </>
                                ) : (
                                    "저장"
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 부동산 목록 팝업 */}
            {showCompanyPopup && (
                <CompanyListPopup
                    user={user}
                    onClose={() => setShowCompanyPopup(false)}
                    onSuccess={() => {
                        // 페이지 새로고침하여 업데이트된 정보 표시
                        window.location.reload();
                    }}
                />
            )}
        </div>
    );
}

export default MyInfoPage;

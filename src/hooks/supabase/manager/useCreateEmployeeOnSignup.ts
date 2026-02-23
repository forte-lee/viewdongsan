"use client";

import { supabase } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { toast } from "@/hooks/use-toast";

// INSERT 실패 최소화: 동일 사용자에 대한 중복 호출 방지 (60초 쿨다운)
const processedCache = new Map<string, number>();
const CACHE_TTL_MS = 60_000;
const duplicateToastShown = new Set<string>(); // 이메일 중복 toast 중복 표시 방지

function wasProcessedRecently(userId: string): boolean {
    const ts = processedCache.get(userId);
    if (!ts) return false;
    if (Date.now() - ts > CACHE_TTL_MS) {
        processedCache.delete(userId);
        return false;
    }
    return true;
}

function markProcessed(userId: string) {
    processedCache.set(userId, Date.now());
}

/**
 * 카카오 회원가입/로그인 시 employee 테이블에 자동으로 저장하거나 업데이트하는 함수
 * Supabase user.id (UUID)를 기준으로 사용자를 식별하여 카카오 이메일 변경 시에도 안전하게 처리합니다.
 * @param user - Supabase User 객체
 */
export async function createEmployeeOnSignup(user: User) {
    try {
        // 🔒 INSERT 실패 최소화: 최근 60초 내 처리된 사용자는 빠른 조회만 수행 (중복 호출 방지)
        if (wasProcessedRecently(user.id)) {
            const { data } = await supabase
                .from("employee")
                .select("id")
                .eq("supabase_user_id", user.id)
                .maybeSingle();
            if (data) return data;
            // 조회 실패 시 정상 흐름 진행 (캐시 만료 등)
        }

        // 카카오에서 받은 정보 추출 (없으면 UUID 기반 placeholder - 무조건 등록 보장)
        const currentEmail =
            user.email || user.user_metadata?.email || `${user.id}@auth-placeholder.local`;

        const supabaseUserId = user.id; // Supabase user.id (UUID) - 변경되지 않는 고유 식별자
        const kakaoName = user.user_metadata?.full_name || user.user_metadata?.name || "";
        const kakaoEmail = user.user_metadata?.email || user.email || "";
        const phone = user.user_metadata?.phone_number || null;

        // 1️⃣ Supabase user.id (UUID)로 employee 찾기 (가장 안전하고 정확한 방법)
        const { data: existingEmployeeByUserId, error: checkError } = await supabase
            .from("employee")
            .select("id, kakao_email, email, supabase_user_id, kakao_name")
            .eq("supabase_user_id", supabaseUserId)
            .maybeSingle();

        if (checkError) {
            console.warn("⚠️ employee 조회 실패, 신규 등록 시도:", checkError);
            // 조회 실패해도 INSERT 시도 (RLS 등으로 조회만 막힌 경우 대비)
        }

        // 2️⃣ UUID로 찾은 경우 (checkError 시 existingEmployeeByUserId는 null) - 이메일이 변경되었을 수 있으므로 업데이트
        if (existingEmployeeByUserId) {
            // 중요: email, name, phone 필드는 사용자가 수정한 값을 유지해야 하므로 업데이트하지 않음
            // kakao_email, kakao_name만 업데이트 (카카오 로그인 정보 동기화)
            const existingKakaoName = (existingEmployeeByUserId as { kakao_name?: string | null }).kakao_name;
            const { error: updateError } = await supabase
                .from("employee")
                .update({
                    kakao_email: currentEmail,
                    kakao_name: kakaoName || existingKakaoName || null,
                    // email: currentEmail, // ❌ 제거: 사용자가 수정한 이메일을 덮어쓰지 않음
                    // name: kakaoName, // ❌ 제거: 사용자가 수정한 이름을 덮어쓰지 않음
                    // phone: phone, // ❌ 제거: 사용자가 수정한 연락처를 덮어쓰지 않음
                    supabase_user_id: supabaseUserId, // UUID도 업데이트 (혹시 모를 경우 대비)
                } as Record<string, unknown>)
                .eq("id", existingEmployeeByUserId.id);

            if (updateError) {
                console.error("❌ employee 정보 업데이트 실패:", updateError);
            } else {
                markProcessed(supabaseUserId);
                console.log("✅ employee 정보 업데이트 완료 (UUID 기반):", existingEmployeeByUserId.id);
            }
            return;
        }

        // 3️⃣ UUID로 찾지 못한 경우, 기존 이메일로 찾기 (마이그레이션을 위한 폴백)
        // kakao_email 우선, 없으면 email 컬럼도 검사 (이메일 중복 시 INSERT 실패 방지)
        let usePlaceholderEmail = false; // 이메일이 다른 직원에게 등록된 경우 placeholder로 신규 등록
        let existingEmployeeByEmail = (await supabase
            .from("employee")
            .select("id, kakao_email, email, supabase_user_id, kakao_name")
            .eq("kakao_email", currentEmail)
            .maybeSingle()).data;

        if (!existingEmployeeByEmail) {
            const { data: byEmailColumn } = await supabase
                .from("employee")
                .select("id, kakao_email, email, supabase_user_id, kakao_name")
                .eq("email", currentEmail)
                .maybeSingle();
            existingEmployeeByEmail = byEmailColumn;
        }

        if (existingEmployeeByEmail) {
            const existingSupabaseUserId = (existingEmployeeByEmail as { supabase_user_id?: string | null })
                .supabase_user_id;

            // ⚠️ 덮어쓰기 방지: 같은 사람(동일 supabase_user_id)인 경우에만 업데이트
            // - 다른 사용자가 이미 연결됨: 업데이트 금지
            // - supabase_user_id가 NULL: 수동 등록된 다른 직원일 수 있으므로 업데이트 금지
            if (existingSupabaseUserId === supabaseUserId) {
                // 기존 employee에 UUID 추가 (같은 사람 - 카카오 정보 동기화)
                const existingKakaoNameByEmail = (existingEmployeeByEmail as { kakao_name?: string | null }).kakao_name;
                const { error: updateError } = await supabase
                    .from("employee")
                    .update({
                        supabase_user_id: supabaseUserId,
                        kakao_email: currentEmail,
                        kakao_name: kakaoName || existingKakaoNameByEmail || null,
                    } as Record<string, unknown>)
                    .eq("id", existingEmployeeByEmail.id);

                if (updateError) {
                    console.error("❌ employee UUID 추가 실패:", updateError);
                } else {
                    markProcessed(supabaseUserId);
                    console.log("✅ 기존 employee에 UUID 추가 완료:", existingEmployeeByEmail.id);
                }
                return;
            }

            // 이메일이 이미 다른 직원에게 등록됨 - placeholder 이메일로 신규 등록 (덮어쓰기 방지 + 무조건 등록)
            usePlaceholderEmail = true;
            console.warn(
                "⚠️ 이 이메일은 이미 다른 직원으로 등록되어 있습니다. placeholder 이메일로 신규 등록합니다.",
                { existingSupabaseUserId, currentUserId: supabaseUserId }
            );
        }

        // 4️⃣ 기존 employee를 찾지 못한 경우, 새로 생성
        // 🔒 INSERT 전 race check: 동시 요청으로 다른 탭/요청이 이미 생성했을 수 있음
        const { data: raceCheck } = await supabase
            .from("employee")
            .select("id")
            .eq("supabase_user_id", supabaseUserId)
            .maybeSingle();
        if (raceCheck) {
            markProcessed(supabaseUserId);
            return raceCheck;
        }

        // 이메일이 다른 직원에게 등록된 경우: email은 placeholder, kakao_email에 실제 이메일 보존 (myinfo에서 수정 가능)
        const emailForInsert = usePlaceholderEmail ? `${supabaseUserId}@auth-placeholder.local` : currentEmail;
        const { data, error } = await supabase
            .from("employee")
            .insert([
                {
                    supabase_user_id: supabaseUserId, // UUID 저장
                    kakao_name: kakaoName || null,
                    kakao_email: kakaoEmail || null, // 실제 카카오 이메일 보존
                    email: emailForInsert,
                    name: kakaoName || "이름 없음",
                    company_id: null, // 기본값: null (관리자가 나중에 회사 할당)
                    position: "", // 기본값: 빈 문자열 (나중에 관리자가 설정)
                    manager: "", // 기본값: 빈 문자열 (나중에 관리자가 설정)
                    phone: phone || null,
                    created_at: new Date(),
                },
            ])
            .select();

        if (error) {
            console.error("❌ employee 생성 실패:", error);
            const errMsg = String(error.message || "");
            const isDuplicate =
                (error as { code?: string }).code === "23505" ||
                errMsg.includes("duplicate key") ||
                errMsg.includes("23505");

            // 🔒 중복 에러 시: 다른 요청이 이미 생성했을 수 있음 → 조회 후 반환 (재시도로 시퀀스 낭비 방지)
            if (isDuplicate) {
                const { data: existingByUid } = await supabase
                    .from("employee")
                    .select("id")
                    .eq("supabase_user_id", supabaseUserId)
                    .maybeSingle();
                if (existingByUid) {
                    markProcessed(supabaseUserId);
                    return existingByUid;
                }
            }

            // 이메일 중복(employee_email_key) 시 기존 레코드 연결 또는 placeholder 재시도
            if (isDuplicate) {
                const { data: existingByEmail } = await supabase
                    .from("employee")
                    .select("id, supabase_user_id")
                    .eq("email", currentEmail)
                    .maybeSingle();

                if (existingByEmail) {
                    const existingUid = (existingByEmail as { supabase_user_id?: string | null }).supabase_user_id;
                    // 다른 사람의 레코드: placeholder 이메일로 신규 등록 (덮어쓰기 방지 + 무조건 등록)
                    if (existingUid !== supabaseUserId) {
                        const placeholderEmail = `${supabaseUserId}@auth-placeholder.local`;
                        const { data: retryData, error: retryError } = await supabase
                            .from("employee")
                            .insert([
                                {
                                    supabase_user_id: supabaseUserId,
                                    kakao_name: kakaoName || null,
                                    kakao_email: kakaoEmail || null,
                                    email: placeholderEmail,
                                    name: kakaoName || "이름 없음",
                                    company_id: null,
                                    position: "",
                                    manager: "",
                                    phone: phone || null,
                                    created_at: new Date(),
                                },
                            ])
                            .select();

                        if (!retryError && retryData?.[0]) {
                            markProcessed(supabaseUserId);
                            console.log("✅ 이메일 중복 - placeholder로 신규 등록 완료:", retryData[0]);
                            return retryData[0];
                        }
                        console.error("❌ placeholder로 신규 등록 실패:", retryError);
                    } else {
                        // 같은 사람: 기존 레코드에 UUID 연결
                        const { error: updateErr } = await supabase
                            .from("employee")
                            .update({
                                supabase_user_id: supabaseUserId,
                                kakao_email: currentEmail,
                                kakao_name: kakaoName || null,
                            } as Record<string, unknown>)
                            .eq("id", existingByEmail.id);

                        if (!updateErr) {
                            markProcessed(supabaseUserId);
                            console.log("✅ 이메일 중복 - 기존 employee에 UUID 연결 완료:", existingByEmail.id);
                            return existingByEmail;
                        }
                    }
                }
                // 이메일 중복으로 생성/연결 불가 - throw 대신 toast 후 반환 (콘솔 오류 스팸 방지)
                if (!duplicateToastShown.has(supabaseUserId)) {
                    duplicateToastShown.add(supabaseUserId);
                    toast({
                        variant: "destructive",
                        title: "직원 등록 안내",
                        description: "이미 등록된 이메일입니다. 해당 이메일로 직원 정보가 존재합니다. 관리자에게 문의해 주세요.",
                    });
                }
                markProcessed(supabaseUserId); // 동일 사용자 재호출 방지
                return;
            }
            throw error;
        }

        if (data && data.length > 0) {
            markProcessed(supabaseUserId);
            console.log("✅ employee 자동 생성 완료:", data[0]);
            return data[0];
        }
    } catch (error) {
        console.error("❌ createEmployeeOnSignup 오류:", error);
        throw error;
    }
}

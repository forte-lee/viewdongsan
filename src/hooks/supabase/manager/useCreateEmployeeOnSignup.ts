"use client";

import { supabase } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

/**
 * 카카오 회원가입/로그인 시 employee 테이블에 자동으로 저장하거나 업데이트하는 함수
 * Supabase user.id (UUID)를 기준으로 사용자를 식별하여 카카오 이메일 변경 시에도 안전하게 처리합니다.
 * @param user - Supabase User 객체
 */
export async function createEmployeeOnSignup(user: User) {
    try {
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
                console.log("✅ employee 정보 업데이트 완료 (UUID 기반):", existingEmployeeByUserId.id);
            }
            return;
        }

        // 3️⃣ UUID로 찾지 못한 경우, 기존 이메일로 찾기 (마이그레이션을 위한 폴백)
        // kakao_email 우선, 없으면 email 컬럼도 검사 (이메일 중복 시 INSERT 실패 방지)
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
            // 기존 employee에 UUID 추가
            // 중요: email, name, phone 필드는 사용자가 수정한 값을 유지해야 하므로 업데이트하지 않음
            const existingKakaoNameByEmail = (existingEmployeeByEmail as { kakao_name?: string | null }).kakao_name;
            const { error: updateError } = await supabase
                .from("employee")
                .update({
                    supabase_user_id: supabaseUserId,
                    kakao_email: currentEmail,
                    kakao_name: kakaoName || existingKakaoNameByEmail || null,
                    // email: currentEmail, // ❌ 제거: 사용자가 수정한 이메일을 덮어쓰지 않음
                    // name: kakaoName, // ❌ 제거: 사용자가 수정한 이름을 덮어쓰지 않음
                    // phone: phone, // ❌ 제거: 사용자가 수정한 연락처를 덮어쓰지 않음
                } as Record<string, unknown>)
                .eq("id", existingEmployeeByEmail.id);

            if (updateError) {
                console.error("❌ employee UUID 추가 실패:", updateError);
            } else {
                console.log("✅ 기존 employee에 UUID 추가 완료:", existingEmployeeByEmail.id);
            }
            return;
        }

        // 4️⃣ 기존 employee를 찾지 못한 경우, 새로 생성
        // employee 테이블에 저장
        // supabase_user_id: UUID 저장 (가장 중요한 식별자)
        // kakao_name, kakao_email: 카카오 정보 저장
        // name, email: 카카오 정보 기반으로 저장 (기존대로 유지)
        // 주의: company_id는 null로 설정 (관리자가 나중에 할당)
        const { data, error } = await supabase
            .from("employee")
            .insert([
                {
                    supabase_user_id: supabaseUserId, // UUID 저장
                    kakao_name: kakaoName || null,
                    kakao_email: kakaoEmail || null,
                    email: currentEmail,
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
            // 이메일 중복(23505) 시 기존 레코드에 UUID 연결 시도 (무조건 등록 보장)
            const errMsg = String(error.message || "");
            const isDuplicateEmail =
                (error as { code?: string }).code === "23505" ||
                errMsg.includes("employee_email_key") ||
                errMsg.includes("duplicate key") ||
                errMsg.includes("23505");

            if (isDuplicateEmail) {
                const { data: existingByEmail } = await supabase
                    .from("employee")
                    .select("id")
                    .eq("email", currentEmail)
                    .maybeSingle();

                if (existingByEmail) {
                    const { error: updateErr } = await supabase
                        .from("employee")
                        .update({
                            supabase_user_id: supabaseUserId,
                            kakao_email: currentEmail,
                            kakao_name: kakaoName || null,
                        } as Record<string, unknown>)
                        .eq("id", existingByEmail.id);

                    if (!updateErr) {
                        console.log("✅ 이메일 중복 - 기존 employee에 UUID 연결 완료:", existingByEmail.id);
                        return existingByEmail;
                    }
                }
                // 업데이트 실패 시 사용자 알림을 위해 throw (toast 표시)
                const userError = new Error(
                    "이미 등록된 이메일입니다. 해당 이메일로 직원 정보가 존재합니다. 관리자에게 문의해 주세요."
                ) as Error & { code?: string };
                userError.code = "EMPLOYEE_EMAIL_DUPLICATE";
                throw userError;
            }
            throw error;
        }

        if (data && data.length > 0) {
            console.log("✅ employee 자동 생성 완료:", data[0]);
            return data[0];
        }
    } catch (error) {
        console.error("❌ createEmployeeOnSignup 오류:", error);
        throw error;
    }
}

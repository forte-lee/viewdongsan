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
        // 카카오에서 받은 정보 추출
        const currentEmail = user.email || user.user_metadata?.email;
        if (!currentEmail) {
            console.warn("⚠️ 이메일 정보가 없어 employee 생성 불가");
            return;
        }

        const supabaseUserId = user.id; // Supabase user.id (UUID) - 변경되지 않는 고유 식별자
        const kakaoName = user.user_metadata?.full_name || user.user_metadata?.name || "";
        const kakaoEmail = user.user_metadata?.email || user.email || "";
        const phone = user.user_metadata?.phone_number || null;

        // 1️⃣ Supabase user.id (UUID)로 employee 찾기 (가장 안전하고 정확한 방법)
        const { data: existingEmployeeByUserId, error: checkError } = await supabase
            .from("employee")
            .select("id, kakao_email, email, supabase_user_id")
            .eq("supabase_user_id", supabaseUserId)
            .maybeSingle();

        if (checkError) {
            console.error("❌ employee 조회 실패:", checkError);
            return;
        }

        // 2️⃣ UUID로 찾은 경우 - 이메일이 변경되었을 수 있으므로 업데이트
        if (existingEmployeeByUserId) {
            // 중요: email, name, phone 필드는 사용자가 수정한 값을 유지해야 하므로 업데이트하지 않음
            // kakao_email, kakao_name만 업데이트 (카카오 로그인 정보 동기화)
            const { error: updateError } = await supabase
                .from("employee")
                .update({
                    kakao_email: currentEmail,
                    kakao_name: kakaoName || existingEmployeeByUserId.kakao_name,
                    // email: currentEmail, // ❌ 제거: 사용자가 수정한 이메일을 덮어쓰지 않음
                    // name: kakaoName, // ❌ 제거: 사용자가 수정한 이름을 덮어쓰지 않음
                    // phone: phone, // ❌ 제거: 사용자가 수정한 연락처를 덮어쓰지 않음
                    supabase_user_id: supabaseUserId, // UUID도 업데이트 (혹시 모를 경우 대비)
                })
                .eq("id", existingEmployeeByUserId.id);

            if (updateError) {
                console.error("❌ employee 정보 업데이트 실패:", updateError);
            } else {
                console.log("✅ employee 정보 업데이트 완료 (UUID 기반):", existingEmployeeByUserId.id);
            }
            return;
        }

        // 3️⃣ UUID로 찾지 못한 경우, 기존 이메일로 찾기 (마이그레이션을 위한 폴백)
        // 기존 employee에 supabase_user_id를 추가하기 위함
        const { data: existingEmployeeByEmail } = await supabase
            .from("employee")
            .select("id, kakao_email, email, supabase_user_id")
            .eq("kakao_email", currentEmail)
            .maybeSingle();

        if (existingEmployeeByEmail) {
            // 기존 employee에 UUID 추가
            // 중요: email, name, phone 필드는 사용자가 수정한 값을 유지해야 하므로 업데이트하지 않음
            const { error: updateError } = await supabase
                .from("employee")
                .update({
                    supabase_user_id: supabaseUserId,
                    kakao_email: currentEmail,
                    kakao_name: kakaoName || existingEmployeeByEmail.kakao_name,
                    // email: currentEmail, // ❌ 제거: 사용자가 수정한 이메일을 덮어쓰지 않음
                    // name: kakaoName, // ❌ 제거: 사용자가 수정한 이름을 덮어쓰지 않음
                    // phone: phone, // ❌ 제거: 사용자가 수정한 연락처를 덮어쓰지 않음
                })
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
            // company_id가 필수이고 null을 허용하지 않는 경우 에러 발생 가능
            // 이 경우 DB 스키마를 수정하거나 기본 회사 ID를 설정해야 합니다
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

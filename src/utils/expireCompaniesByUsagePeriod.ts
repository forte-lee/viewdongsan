import { supabase } from "@/utils/supabase/client";

/** 오늘 날짜 (YYYY-MM-DD, 사용자 로컬 시간 기준) */
function getTodayLocal(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

/**
 * 사용기간 종료일이 지난 회사를 미승인/미등록으로 자동 변경
 * 1) RPC 함수 호출 시도, 2) 실패 시 클라이언트에서 ID별 업데이트
 */
export async function expireCompaniesByUsagePeriod(): Promise<void> {
    const today = getTodayLocal();

    try {
        const { error } = await supabase.rpc("expire_companies_by_usage_period");
        if (!error) return;
    } catch {
        // RPC 실패 시 아래 직접 업데이트로 폴백
    }

    // RPC 실패 시: 만료된 회사 조회 후 ID별 업데이트 (RLS 호환)
    try {
        const { data: expired } = await supabase
            .from("company")
            .select("id")
            .not("usage_period_end_at", "is", null)
            .lt("usage_period_end_at", today)
            .or("is_registration_approved.eq.true,is_map_visible.eq.true");

        if (expired?.length) {
            for (const { id } of expired) {
                await supabase
                    .from("company")
                    .update({
                        is_registration_approved: false,
                        is_map_visible: false,
                        registration_approved_at: null,
                        map_visible_at: null,
                    })
                    .eq("id", id);
            }
        }
    } catch {
        // 업데이트 실패 시 무시
    }
}

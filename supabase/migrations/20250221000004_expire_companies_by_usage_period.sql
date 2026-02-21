-- 사용기간 종료일이 지난 회사를 자동으로 미승인/미등록 처리하는 함수
-- usage_period_end_at < 오늘 날짜인 회사의 부동산 등록 승인, 협력업체 등록을 해제

CREATE OR REPLACE FUNCTION public.expire_companies_by_usage_period()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    updated_count integer;
BEGIN
    UPDATE public.company
    SET
        is_registration_approved = false,
        is_map_visible = false,
        registration_approved_at = null,
        map_visible_at = null
    WHERE
        usage_period_end_at IS NOT NULL
        AND usage_period_end_at < CURRENT_DATE
        AND (is_registration_approved = true OR is_map_visible = true);

    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$;

COMMENT ON FUNCTION public.expire_companies_by_usage_period() IS '사용기간 종료일이 지난 회사를 미승인/미등록으로 자동 변경';

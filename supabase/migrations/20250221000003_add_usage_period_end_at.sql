-- company 테이블에 사용기간 종료일 컬럼 추가
-- 슈퍼관리자가 협력업체의 사용기간 종료일을 설정

ALTER TABLE public.company
ADD COLUMN IF NOT EXISTS usage_period_end_at date DEFAULT NULL;

COMMENT ON COLUMN public.company.usage_period_end_at IS '사용기간 종료일 (협력업체)';

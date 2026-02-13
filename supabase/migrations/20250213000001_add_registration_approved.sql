-- company 테이블에 부동산 등록 승인여부 열 추가
-- true: 승인됨, false: 미승인 (기본값)

ALTER TABLE public.company
ADD COLUMN IF NOT EXISTS is_registration_approved boolean DEFAULT false;

COMMENT ON COLUMN public.company.is_registration_approved IS '부동산 등록 승인여부';

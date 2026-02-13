-- company 테이블에 대표자 연락처 열 추가
-- 가맹 신청 시 필수 입력 항목

ALTER TABLE public.company
ADD COLUMN IF NOT EXISTS representative_phone text;

COMMENT ON COLUMN public.company.representative_phone IS '대표자 연락처';

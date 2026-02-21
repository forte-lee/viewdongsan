-- company 테이블에 부동산 등록 승인일, 지도 노출일자 컬럼 추가

ALTER TABLE public.company
ADD COLUMN IF NOT EXISTS registration_approved_at timestamptz DEFAULT NULL;

ALTER TABLE public.company
ADD COLUMN IF NOT EXISTS map_visible_at timestamptz DEFAULT NULL;

COMMENT ON COLUMN public.company.registration_approved_at IS '부동산 등록 승인 일시';
COMMENT ON COLUMN public.company.map_visible_at IS '지도 노출 설정 일시';

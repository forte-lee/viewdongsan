-- company 테이블에 company_data, representative_name 열 추가
-- company_data: 사업자등록증, 중개업등록증, 외부사진, 중개등록번호를 JSONB로 저장
-- representative_name: 대표자 이름

ALTER TABLE public.company
ADD COLUMN IF NOT EXISTS company_data jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS representative_name text;

-- company_data JSON 구조 예시:
-- {
--   "business_registration": "url",      -- 사업자등록증 (이미지 URL)
--   "broker_license": "url",             -- 중개업등록증 (이미지 URL)
--   "exterior_photos": ["url1", "url2"], -- 외부사진 (이미지 URL 배열)
--   "broker_registration_number": ""     -- 중개등록번호 (문자열)
-- }

COMMENT ON COLUMN public.company.company_data IS '사업자등록증, 중개업등록증, 외부사진, 중개등록번호 등 회사 증빙 자료';
COMMENT ON COLUMN public.company.representative_name IS '대표자 이름';

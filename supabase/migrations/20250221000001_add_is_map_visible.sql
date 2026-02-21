-- company 테이블에 외부 페이지 지도 노출 여부 열 추가
-- true: 지도에 표시, false: 지도에 미표시 (기본값)
-- is_registration_approved와 별도로 슈퍼관리자가 지도 노출을 개별 제어

ALTER TABLE public.company
ADD COLUMN IF NOT EXISTS is_map_visible boolean DEFAULT false;

COMMENT ON COLUMN public.company.is_map_visible IS '외부 페이지 지도 노출 여부 (슈퍼관리자 제어)';

-- company 테이블에 중개등록번호 별도 열 추가
-- 기존 company_data JSONB 내 broker_registration_number를 별도 컬럼으로 분리

ALTER TABLE public.company
ADD COLUMN IF NOT EXISTS broker_registration_number text;

COMMENT ON COLUMN public.company.broker_registration_number IS '중개등록번호';

-- 기존 company_data에 broker_registration_number가 있는 경우 새 컬럼으로 이전
UPDATE public.company
SET broker_registration_number = company_data->>'broker_registration_number'
WHERE company_data ? 'broker_registration_number'
  AND (broker_registration_number IS NULL OR broker_registration_number = '');

-- company_data에서 broker_registration_number 키 제거 (데이터 정리)
UPDATE public.company
SET company_data = company_data - 'broker_registration_number'
WHERE company_data ? 'broker_registration_number';

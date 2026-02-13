# company 테이블 마이그레이션

## 추가되는 열

1. **company_data** (jsonb)  
   - 사업자등록증, 중개업등록증, 외부사진, 중개등록번호 저장
   - JSON 예시:
   ```json
   {
     "business_registration": "https://...",
     "broker_license": "https://...",
     "exterior_photos": ["https://...", "https://..."],
     "broker_registration_number": "123-45-67890"
   }
   ```

2. **representative_name** (text)  
   - 대표자 이름

3. **is_registration_approved** (boolean)  
   - 부동산 등록 승인여부 (true: 승인됨, false: 미승인, 기본값: false)

## 실행 방법

### Supabase SQL Editor에서 실행

1. Supabase 대시보드 → SQL Editor
2. 다음 마이그레이션 파일들을 순서대로 실행:
   - `migrations/20250213000000_add_company_data_and_representative_name.sql`
   - `migrations/20250213000001_add_registration_approved.sql`

### Table Editor에서 수동 추가

1. **company_data**: 새 열 추가 → 이름 `company_data`, 타입 `jsonb`, 기본값 `'{}'::jsonb`
2. **representative_name**: 새 열 추가 → 이름 `representative_name`, 타입 `text`
3. **is_registration_approved**: 새 열 추가 → 이름 `is_registration_approved`, 타입 `boolean`, 기본값 `false`

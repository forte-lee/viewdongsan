-- uploads 버킷의 company 폴더에 대한 업로드 허용
-- 기존 정책이 images 폴더만 허용하는 경우, company 폴더 추가 업로드용 정책

CREATE POLICY "Allow authenticated uploads to company folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'uploads'
  AND (storage.foldername(name))[1] = 'company'
);

-- SELECT, UPDATE, DELETE도 company 폴더에 필요할 수 있음 (파일 수정/삭제 시)
CREATE POLICY "Allow authenticated select company folder"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'uploads'
  AND (storage.foldername(name))[1] = 'company'
);

CREATE POLICY "Allow authenticated update company folder"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'uploads'
  AND (storage.foldername(name))[1] = 'company'
);

CREATE POLICY "Allow authenticated delete company folder"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'uploads'
  AND (storage.foldername(name))[1] = 'company'
);

-- 매물 삭제 시 property_delete에 항목이 2개씩 생성되는 문제 해결
-- 원인: property 테이블에 사용자 정의 ON DELETE 트리거가 있고, 앱 코드에서도 삽입하여 중복 발생
-- 해결: 사용자 정의 DELETE 트리거만 제거 (시스템 FK 트리거는 제외)

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tgname
        FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        WHERE c.relname = 'property'
        AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
        AND (t.tgtype & 16) = 16  -- DELETE 트리거만
        AND NOT t.tgisinternal    -- 시스템 트리거(FK 등) 제외
    )
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.property', r.tgname);
        RAISE NOTICE 'Dropped trigger: %', r.tgname;
    END LOOP;
END $$;

-- expire_companies_by_usage_period 함수 실행 권한 부여
-- anon, authenticated, service_role에서 RPC 호출 가능하도록

GRANT EXECUTE ON FUNCTION public.expire_companies_by_usage_period() TO anon;
GRANT EXECUTE ON FUNCTION public.expire_companies_by_usage_period() TO authenticated;
GRANT EXECUTE ON FUNCTION public.expire_companies_by_usage_period() TO service_role;

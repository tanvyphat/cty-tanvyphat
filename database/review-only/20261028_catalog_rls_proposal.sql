-- REVIEW ONLY. Requires explicit Production approval; never auto-apply.
-- Captured production role grants/policies 2026-10-28.
-- Run in a maintenance transaction after service role rotation and Preview smoke tests.
BEGIN;

-- All read-only catalog data remains public. Only app_metadata.role=admin may write.
DO $$
DECLARE tab text;
BEGIN
  FOREACH tab IN ARRAY ARRAY['products','categories','branches','product_units'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tab);
    EXECUTE format('REVOKE ALL PRIVILEGES ON TABLE public.%I FROM anon, authenticated', tab);
    EXECUTE format('GRANT SELECT ON TABLE public.%I TO anon, authenticated', tab);
    EXECUTE format('GRANT INSERT, UPDATE, DELETE ON TABLE public.%I TO authenticated', tab);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO anon, authenticated USING (true)', tab || '_catalog_read', tab);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK ((auth.jwt() -> ''app_metadata'' ->> ''role'') = ''admin'')', tab || '_admin_insert', tab);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING ((auth.jwt() -> ''app_metadata'' ->> ''role'') = ''admin'') WITH CHECK ((auth.jwt() -> ''app_metadata'' ->> ''role'') = ''admin'')', tab || '_admin_update', tab);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING ((auth.jwt() -> ''app_metadata'' ->> ''role'') = ''admin'')', tab || '_admin_delete', tab);
  END LOOP;
END $$;

-- Legacy order/checkout/customer payment data must not be available through Data API.
DO $$
DECLARE tab text;
BEGIN
  FOREACH tab IN ARRAY ARRAY['cart_sessions','fb_customers','order_items','pending_payments'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tab);
    EXECUTE format('REVOKE ALL PRIVILEGES ON TABLE public.%I FROM anon, authenticated', tab);
  END LOOP;
END $$;
REVOKE ALL PRIVILEGES ON TABLE public.orders FROM anon, authenticated;
DROP POLICY IF EXISTS anyone_insert_orders ON public.orders;
DROP POLICY IF EXISTS users_select_own_orders ON public.orders;

-- Authenticated users are NOT automatically admins. The old policy allowed
-- every signed-in account to alter news.
DROP POLICY IF EXISTS "admin write" ON public.news;
REVOKE ALL PRIVILEGES ON TABLE public.news FROM anon, authenticated;
GRANT SELECT ON TABLE public.news TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.news TO authenticated;
CREATE POLICY news_admin_insert ON public.news FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY news_admin_update ON public.news FOR UPDATE TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY news_admin_delete ON public.news FOR DELETE TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Keep Auth signup trigger and private profile access working.
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
REVOKE ALL PRIVILEGES ON TABLE public.profiles FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.profiles TO authenticated;
CREATE POLICY profiles_select_self ON public.profiles FOR SELECT TO authenticated
  USING (id = (SELECT auth.uid()));
CREATE POLICY profiles_insert_self ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = (SELECT auth.uid()));
CREATE POLICY profiles_update_self ON public.profiles FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid())) WITH CHECK (id = (SELECT auth.uid()));

-- SECURITY DEFINER is needed for auth.users -> profiles. Block direct RPC execution;
-- qualified table references in handle_new_user permit empty search_path.
ALTER FUNCTION public.handle_new_user() SET search_path = '';
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
ALTER FUNCTION public.get_random_products(integer) SET search_path = pg_catalog, public;
ALTER FUNCTION public.set_updated_at() SET search_path = pg_catalog, public;
ALTER FUNCTION public.sync_product_min_price() SET search_path = pg_catalog, public;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_product_min_price() FROM PUBLIC, anon, authenticated;

COMMIT;

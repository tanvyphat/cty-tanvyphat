-- EMERGENCY ROLLBACK ONLY. Restores INSECURE production baseline permissions.
-- Use only with explicit approval and active incident/change window.
BEGIN;
DO $$
DECLARE tab text;
BEGIN
  FOREACH tab IN ARRAY ARRAY['products','categories','branches','product_units'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', tab || '_catalog_read', tab);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', tab || '_admin_insert', tab);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', tab || '_admin_update', tab);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', tab || '_admin_delete', tab);
    EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY', tab);
  END LOOP;
  FOREACH tab IN ARRAY ARRAY['cart_sessions','fb_customers','order_items','pending_payments'] LOOP
    EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY', tab);
  END LOOP;
  FOREACH tab IN ARRAY ARRAY['products','categories','branches','product_units',
                             'cart_sessions','fb_customers','order_items','pending_payments'] LOOP
    EXECUTE format('GRANT ALL PRIVILEGES ON TABLE public.%I TO anon, authenticated', tab);
  END LOOP;
END $$;
DROP POLICY IF EXISTS news_admin_insert ON public.news;
DROP POLICY IF EXISTS news_admin_update ON public.news;
DROP POLICY IF EXISTS news_admin_delete ON public.news;
CREATE POLICY "admin write" ON public.news FOR ALL TO authenticated USING (true) WITH CHECK (true);
GRANT ALL PRIVILEGES ON TABLE public.news TO anon, authenticated;
DROP POLICY IF EXISTS profiles_select_self ON public.profiles;
DROP POLICY IF EXISTS profiles_insert_self ON public.profiles;
DROP POLICY IF EXISTS profiles_update_self ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT TO PUBLIC USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO PUBLIC WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO PUBLIC USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
GRANT ALL PRIVILEGES ON TABLE public.profiles, public.orders TO anon, authenticated;
CREATE POLICY anyone_insert_orders ON public.orders FOR INSERT TO PUBLIC WITH CHECK (true);
CREATE POLICY users_select_own_orders ON public.orders FOR SELECT TO PUBLIC USING (user_id = auth.uid());
ALTER FUNCTION public.handle_new_user() RESET search_path;
ALTER FUNCTION public.get_random_products(integer) RESET search_path;
ALTER FUNCTION public.set_updated_at() RESET search_path;
ALTER FUNCTION public.sync_product_min_price() RESET search_path;
GRANT EXECUTE ON FUNCTION public.handle_new_user(), public.set_updated_at(), public.sync_product_min_price() TO PUBLIC, anon, authenticated;
COMMIT;

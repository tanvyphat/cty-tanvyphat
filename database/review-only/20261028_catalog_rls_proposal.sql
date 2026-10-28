-- REVIEW-ONLY migration, NOT APPLIED to Production.
-- Preflight: Confirm three existing auth.users app_metadata.role=admin accounts,
-- 5MB product-images bucket (jpeg/png/webp), and review affected grants/policies.
-- Apply atomically in approved maintenance window with verified Preview admin session.
BEGIN;
-- Privileged objects are never accessible to browser roles, regardless of ownership.

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON public.products FROM anon, authenticated;
GRANT SELECT ON public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;
CREATE POLICY products_catalog_public_select ON public.products
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY products_catalog_admin_insert ON public.products
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY products_catalog_admin_update ON public.products
  FOR UPDATE TO authenticated
  USING ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY products_catalog_admin_delete ON public.products
  FOR DELETE TO authenticated
  USING ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON public.categories FROM anon, authenticated;
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.categories TO authenticated;
CREATE POLICY categories_catalog_public_select ON public.categories
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY categories_catalog_admin_insert ON public.categories
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY categories_catalog_admin_update ON public.categories
  FOR UPDATE TO authenticated
  USING ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY categories_catalog_admin_delete ON public.categories
  FOR DELETE TO authenticated
  USING ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON public.branches FROM anon, authenticated;
GRANT SELECT ON public.branches TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.branches TO authenticated;
CREATE POLICY branches_catalog_public_select ON public.branches
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY branches_catalog_admin_insert ON public.branches
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY branches_catalog_admin_update ON public.branches
  FOR UPDATE TO authenticated
  USING ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY branches_catalog_admin_delete ON public.branches
  FOR DELETE TO authenticated
  USING ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

ALTER TABLE public.product_units ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON public.product_units FROM anon, authenticated;
GRANT SELECT ON public.product_units TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.product_units TO authenticated;
CREATE POLICY product_units_catalog_public_select ON public.product_units
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY product_units_catalog_admin_insert ON public.product_units
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY product_units_catalog_admin_update ON public.product_units
  FOR UPDATE TO authenticated
  USING ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY product_units_catalog_admin_delete ON public.product_units
  FOR DELETE TO authenticated
  USING ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Sequences are independent of table RLS. Anonymous callers must not obtain
-- catalog/admin IDs through sequence nextval; authenticated INSERT needs USAGE.
REVOKE ALL ON SEQUENCE public.branches_id_seq,public.categories_id_seq,
  public.products_id_seq,public.product_units_id_seq,public.news_id_seq
  FROM anon,authenticated;
GRANT USAGE,SELECT ON SEQUENCE public.branches_id_seq,public.categories_id_seq,
  public.products_id_seq,public.product_units_id_seq,public.news_id_seq
  TO authenticated;
-- The legacy order sequence is not used by the catalog.
REVOKE ALL ON SEQUENCE public.order_items_id_seq FROM anon,authenticated;

-- Freeze legacy commerce data, retain all rows and tables.
ALTER TABLE public.cart_sessions ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON public.cart_sessions FROM anon, authenticated;
ALTER TABLE public.fb_customers ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON public.fb_customers FROM anon, authenticated;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON public.order_items FROM anon, authenticated;
ALTER TABLE public.pending_payments ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON public.pending_payments FROM anon, authenticated;

-- Remove unused order-creation policy.
DROP POLICY IF EXISTS anyone_insert_orders ON public.orders;
REVOKE ALL PRIVILEGES ON public.orders FROM anon, authenticated;

-- Existing RLS news policy currently allows any authenticated user to write.
DROP POLICY IF EXISTS "admin write" ON public.news;
REVOKE ALL PRIVILEGES ON public.news FROM anon, authenticated;
GRANT SELECT ON public.news TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.news TO authenticated;
CREATE POLICY news_catalog_admin_insert ON public.news
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY news_catalog_admin_update ON public.news
  FOR UPDATE TO authenticated
  USING ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY news_catalog_admin_delete ON public.news
  FOR DELETE TO authenticated
  USING ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Protect profile data. Existing policies enforce auth.uid()=id and have no
-- user-editable role field. Keep these policies and only narrow SQL grants.
REVOKE ALL PRIVILEGES ON public.profiles FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

-- Public product/news images remain publicly readable via existing SELECT
-- policies; only database-authorized admin identities can write.
DROP POLICY IF EXISTS "admin upload news-media" ON storage.objects;
DROP POLICY IF EXISTS "admin update news-media" ON storage.objects;
DROP POLICY IF EXISTS "admin delete news-media" ON storage.objects;

CREATE POLICY catalog_admin_upload_product_image ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'product-images'
    AND (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    AND lower(storage.extension(name)) = ANY (ARRAY['jpg','jpeg','png','webp'])
    AND name LIKE 'uploads/%'
  );
CREATE POLICY catalog_admin_replace_product_image ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images'
         AND (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK (bucket_id = 'product-images'
              AND (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
              AND lower(storage.extension(name)) = ANY (ARRAY['jpg','jpeg','png','webp']));
CREATE POLICY catalog_admin_remove_product_image ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'product-images'
         AND (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY catalog_admin_upload_news_media ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'news-media'
    AND (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    AND lower(storage.extension(name)) = ANY
      (ARRAY['jpg','jpeg','png','webp','gif','avif','mp4','webm','mov'])
    AND (name LIKE 'images/%' OR name LIKE 'videos/%')
  );
CREATE POLICY catalog_admin_replace_news_media ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'news-media'
         AND (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK (bucket_id = 'news-media'
              AND (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
              AND lower(storage.extension(name)) = ANY
                (ARRAY['jpg','jpeg','png','webp','gif','avif','mp4','webm','mov']));
CREATE POLICY catalog_admin_remove_news_media ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'news-media'
         AND (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Storage service-level upload constraints. Existing product-images bucket
-- already enforces 5 MB/jpeg/png/webp; do not change it.
UPDATE storage.buckets SET
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp','image/gif',
                              'image/avif','video/mp4','video/webm','video/quicktime']
WHERE id = 'news-media';

-- Narrowly scoped Auth account management RPCs. Only these functions need
-- SECURITY DEFINER to access auth.users; they never query/modify catalog rows
-- or bypass catalog RLS. Owner must be trusted migration role.
CREATE OR REPLACE FUNCTION public.catalog_admin_list_users()
RETURNS TABLE (
  id uuid, email text, full_name text, avatar_url text, provider text,
  role text, created_at timestamptz, last_sign_in_at timestamptz
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM auth.users AS a
    WHERE a.id = (SELECT auth.uid())
      AND a.raw_app_meta_data ->> 'role' = 'admin'
  ) THEN
    RAISE EXCEPTION 'Not authorized' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY
    SELECT u.id, u.email::text,
      COALESCE(u.raw_user_meta_data ->> 'full_name',
               u.raw_user_meta_data ->> 'name'),
      u.raw_user_meta_data ->> 'avatar_url',
      COALESCE(u.raw_app_meta_data ->> 'provider', 'email'),
      u.raw_app_meta_data ->> 'role',
      u.created_at, u.last_sign_in_at
    FROM auth.users u ORDER BY u.created_at DESC LIMIT 200;
END;
$$;
REVOKE ALL ON FUNCTION public.catalog_admin_list_users() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.catalog_admin_list_users() TO authenticated;

CREATE OR REPLACE FUNCTION public.catalog_admin_set_user_role(
  target_user_id uuid, new_role text
) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  current_user_id uuid := (SELECT auth.uid());
BEGIN
  -- Serialize role changes (protects the last-admin invariant).
  PERFORM pg_catalog.pg_advisory_xact_lock(7643, 1224);
  IF current_user_id IS NULL OR NOT EXISTS (
    SELECT 1 FROM auth.users a
    WHERE a.id = current_user_id
      AND a.raw_app_meta_data ->> 'role' = 'admin'
  ) THEN
    RAISE EXCEPTION 'Not authorized' USING ERRCODE = '42501';
  END IF;
  IF new_role IS NOT NULL AND new_role <> 'admin' THEN
    RAISE EXCEPTION 'Invalid role' USING ERRCODE = '22023';
  END IF;
  IF current_user_id = target_user_id AND new_role IS NULL THEN
    RAISE EXCEPTION 'Cannot demote self' USING ERRCODE = '42501';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = target_user_id) THEN
    RAISE EXCEPTION 'User not found' USING ERRCODE = 'P0002';
  END IF;
  IF new_role IS NULL AND
    (SELECT count(*) FROM auth.users WHERE raw_app_meta_data ->> 'role' = 'admin') <= 1 THEN
    RAISE EXCEPTION 'Cannot demote last admin' USING ERRCODE = '42501';
  END IF;
  UPDATE auth.users
     SET raw_app_meta_data = CASE WHEN new_role = 'admin'
       THEN jsonb_set(coalesce(raw_app_meta_data,'{}'::jsonb),'{role}',to_jsonb('admin'::text),true)
       ELSE coalesce(raw_app_meta_data,'{}'::jsonb) - 'role' END,
       updated_at = now()
   WHERE id = target_user_id;
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.catalog_admin_set_user_role(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.catalog_admin_set_user_role(uuid, text) TO authenticated;

-- Hardening existing database trigger functions.
ALTER FUNCTION public.handle_new_user() SET search_path = '';
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
ALTER FUNCTION public.sync_product_min_price() SET search_path = pg_catalog, public;
ALTER FUNCTION public.set_updated_at() SET search_path = pg_catalog, public;
ALTER FUNCTION public.get_random_products(integer) SET search_path = pg_catalog, public;
REVOKE EXECUTE ON FUNCTION public.sync_product_min_price() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
-- Unused RPC: restrict direct use. Do not drop legacy function until separately reviewed.
REVOKE EXECUTE ON FUNCTION public.get_random_products(integer) FROM PUBLIC, anon, authenticated;

COMMIT;

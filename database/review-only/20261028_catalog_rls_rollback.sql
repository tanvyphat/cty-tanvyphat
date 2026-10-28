-- EMERGENCY ROLLBACK - DO NOT APPLY WITHOUT EXPLICIT PRODUCTION APPROVAL.
-- Restores the former INSECURE baseline; prefer forward-fixing the policy.
-- Intended ONLY for an approved disaster-recovery maintenance window.
BEGIN;
DROP FUNCTION IF EXISTS public.catalog_admin_set_user_role(uuid, text);
DROP FUNCTION IF EXISTS public.catalog_admin_list_users();

-- Remove policies created by the catalog-only migration.
DROP POLICY IF EXISTS products_catalog_public_select ON public.products;
DROP POLICY IF EXISTS products_catalog_admin_insert ON public.products;
DROP POLICY IF EXISTS products_catalog_admin_update ON public.products;
DROP POLICY IF EXISTS products_catalog_admin_delete ON public.products;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
GRANT ALL PRIVILEGES ON public.products TO anon, authenticated;
DROP POLICY IF EXISTS categories_catalog_public_select ON public.categories;
DROP POLICY IF EXISTS categories_catalog_admin_insert ON public.categories;
DROP POLICY IF EXISTS categories_catalog_admin_update ON public.categories;
DROP POLICY IF EXISTS categories_catalog_admin_delete ON public.categories;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
GRANT ALL PRIVILEGES ON public.categories TO anon, authenticated;
DROP POLICY IF EXISTS branches_catalog_public_select ON public.branches;
DROP POLICY IF EXISTS branches_catalog_admin_insert ON public.branches;
DROP POLICY IF EXISTS branches_catalog_admin_update ON public.branches;
DROP POLICY IF EXISTS branches_catalog_admin_delete ON public.branches;
ALTER TABLE public.branches DISABLE ROW LEVEL SECURITY;
GRANT ALL PRIVILEGES ON public.branches TO anon, authenticated;
DROP POLICY IF EXISTS product_units_catalog_public_select ON public.product_units;
DROP POLICY IF EXISTS product_units_catalog_admin_insert ON public.product_units;
DROP POLICY IF EXISTS product_units_catalog_admin_update ON public.product_units;
DROP POLICY IF EXISTS product_units_catalog_admin_delete ON public.product_units;
ALTER TABLE public.product_units DISABLE ROW LEVEL SECURITY;
GRANT ALL PRIVILEGES ON public.product_units TO anon, authenticated;
ALTER TABLE public.cart_sessions DISABLE ROW LEVEL SECURITY;
GRANT ALL PRIVILEGES ON public.cart_sessions TO anon, authenticated;
ALTER TABLE public.fb_customers DISABLE ROW LEVEL SECURITY;
GRANT ALL PRIVILEGES ON public.fb_customers TO anon, authenticated;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;
GRANT ALL PRIVILEGES ON public.order_items TO anon, authenticated;
ALTER TABLE public.pending_payments DISABLE ROW LEVEL SECURITY;
GRANT ALL PRIVILEGES ON public.pending_payments TO anon, authenticated;

-- Restore legacy sequence grants too (unsafe, by design of this rollback).
GRANT ALL ON SEQUENCE public.branches_id_seq,public.categories_id_seq,
  public.products_id_seq,public.product_units_id_seq,
  public.news_id_seq,public.order_items_id_seq TO anon,authenticated;
-- Restore previously broad news/order privileges. UNSAFE, for recovery only.
DROP POLICY IF EXISTS news_catalog_admin_insert ON public.news;
DROP POLICY IF EXISTS news_catalog_admin_update ON public.news;
DROP POLICY IF EXISTS news_catalog_admin_delete ON public.news;
CREATE POLICY "admin write" ON public.news FOR ALL TO authenticated USING (true) WITH CHECK (true);
GRANT ALL PRIVILEGES ON public.news,public.orders,public.profiles TO anon,authenticated;
CREATE POLICY anyone_insert_orders ON public.orders FOR INSERT TO public WITH CHECK (true);
-- Restore previous Storage rules; users authenticated can write news again (UNSAFE).
DROP POLICY IF EXISTS catalog_admin_upload_product_image ON storage.objects;
DROP POLICY IF EXISTS catalog_admin_replace_product_image ON storage.objects;
DROP POLICY IF EXISTS catalog_admin_remove_product_image ON storage.objects;
DROP POLICY IF EXISTS catalog_admin_upload_news_media ON storage.objects;
DROP POLICY IF EXISTS catalog_admin_replace_news_media ON storage.objects;
DROP POLICY IF EXISTS catalog_admin_remove_news_media ON storage.objects;

CREATE POLICY "admin upload news-media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id='news-media');
CREATE POLICY "admin update news-media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id='news-media');
CREATE POLICY "admin delete news-media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id='news-media');
UPDATE storage.buckets SET file_size_limit = NULL, allowed_mime_types = NULL WHERE id = 'news-media';

ALTER FUNCTION public.handle_new_user() RESET search_path;
ALTER FUNCTION public.sync_product_min_price() RESET search_path;
ALTER FUNCTION public.set_updated_at() RESET search_path;
ALTER FUNCTION public.get_random_products(integer) RESET search_path;
GRANT EXECUTE ON FUNCTION public.handle_new_user(),public.sync_product_min_price(),
  public.set_updated_at(),public.get_random_products(integer) TO PUBLIC,anon,authenticated;
COMMIT;

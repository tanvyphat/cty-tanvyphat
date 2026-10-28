-- REVIEW ONLY — NOT YET APPLIED TO SUPABASE PRODUCTION.
-- Project: Tan-vy-phat (dsgvnlyubkohjiojjmrm)
-- Must be tested against an isolated DB with the same schema and Auth roles first.
-- Existing records, buckets, files and accounts are never deleted by this script.
-- Do NOT execute before explicit production approval and a verified backup.
-- Run in ONE transaction so policy/GRANT changes are atomic.
BEGIN;

-- 1. Catalog: guests and signed-in customers may read, never mutate directly.
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_units ENABLE ROW LEVEL SECURITY;

REVOKE ALL PRIVILEGES ON TABLE
  public.branches, public.categories, public.products, public.product_units
FROM anon, authenticated;

GRANT SELECT ON TABLE
  public.branches, public.categories, public.products, public.product_units
TO anon, authenticated;

CREATE POLICY "catalog_public_read" ON public.branches
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "catalog_public_read" ON public.categories
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "catalog_public_read" ON public.products
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "catalog_public_read" ON public.product_units
  FOR SELECT TO anon, authenticated USING (true);

-- 2. Sensitive server-managed data: only trusted service_role should access.
-- Next.js API routes for pending payments, Facebook customers and cart sessions
-- already use the server-only admin client.
ALTER TABLE public.fb_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

REVOKE ALL PRIVILEGES ON TABLE
  public.fb_customers, public.pending_payments, public.cart_sessions, public.order_items
FROM anon, authenticated;

-- Exception: the authenticated customer order-detail server page embeds
-- order_items through an SSR client. Grant per-order read ONLY.
GRANT SELECT ON TABLE public.order_items TO authenticated;
CREATE POLICY "customers_read_own_order_items" ON public.order_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.orders AS o
      WHERE o.id = order_items.order_id
        AND o.user_id = (SELECT auth.uid())
    )
  );

-- 3. Orders: creation and mutation run through server-only API with service_role.
-- Keep customers' existing RLS SELECT access to their own orders.
DROP POLICY IF EXISTS "anyone_insert_orders" ON public.orders;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.orders FROM anon, authenticated;
REVOKE SELECT ON TABLE public.orders FROM anon;
GRANT SELECT ON TABLE public.orders TO authenticated;

-- 4. News: public read remains; content mutation is handled by admin API using
-- service_role, not by any directly authenticated Supabase client.
DROP POLICY IF EXISTS "admin write" ON public.news;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.news FROM anon, authenticated;

-- 5. Customer profile: deny guest access; keep existing per-user RLS for
-- authenticated SELECT, INSERT and UPDATE.
REVOKE ALL PRIVILEGES ON TABLE public.profiles FROM anon;
REVOKE DELETE ON TABLE public.profiles FROM authenticated;

-- 6. Media: preserve existing public SELECT and public bucket settings.
-- Revoke direct authenticated writes; admin uploads already use service_role.
DROP POLICY IF EXISTS "admin upload news-media" ON storage.objects;
DROP POLICY IF EXISTS "admin update news-media" ON storage.objects;
DROP POLICY IF EXISTS "admin delete news-media" ON storage.objects;

-- 7. Secure existing functions without modifying their logic.
-- These functions resolve public tables; neither anon nor authenticated
-- currently has CREATE privilege on the public schema.
ALTER FUNCTION public.handle_new_user() SET search_path = pg_catalog, public, pg_temp;
ALTER FUNCTION public.sync_product_min_price() SET search_path = pg_catalog, public, pg_temp;
ALTER FUNCTION public.set_updated_at() SET search_path = pg_catalog, public, pg_temp;
ALTER FUNCTION public.get_random_products(integer) SET search_path = pg_catalog, public, pg_temp;

-- The auth.users trigger can keep invoking this function as its owner.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

COMMIT;

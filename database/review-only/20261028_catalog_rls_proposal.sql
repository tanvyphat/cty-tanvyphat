-- REVIEW ONLY: DO NOT EXECUTE AGAINST PRODUCTION WITHOUT APPROVAL.
-- Security audit 2026-10-28: public tables with unrestricted anon/authenticated access.
-- Apply only after confirming all consumers (admin, Facebook/SePay webhooks,
-- external integrations, and the admin role model).
--
-- Suggested migration rollout:
-- 1. Rotate the leaked service_role credential and update all server-side integrations.
-- 2. Confirm catalog readers can use anon SELECT and admin writes use server-side
--    authenticated checks (not client-side role checks alone).
-- 3. During an approved maintenance window, enable RLS, then verify policies.
-- 4. Revoke anon/authenticated write privileges to protect against future policy drift.
--
-- Catalog-only read policies; product descriptions and prices are currently public:
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "catalog_public_read_products" ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "catalog_public_read_categories" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "catalog_public_read_branches" ON public.branches FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "catalog_public_read_units" ON public.product_units FOR SELECT TO anon, authenticated USING (true);

REVOKE INSERT, UPDATE, DELETE, TRUNCATE FROM anon, authenticated ON
  public.products, public.categories, public.branches, public.product_units;

-- Sensitive legacy data: no direct browser access intended. Webhooks are
-- server-side and currently use service role; validate before applying.
ALTER TABLE public.cart_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fb_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_payments ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON public.cart_sessions, public.fb_customers,
  public.order_items, public.pending_payments FROM anon, authenticated;

-- NOTE: Do not apply to admin write paths without a separate authorization
-- strategy. No policy grants client-side catalog writes.

# Supabase hardening — Tân Vy Phát (review and approval required)

> **Status: NOT APPLIED.** This branch contains application authorization fixes and a proposed SQL script only. Neither the SQL nor production configuration has been changed. Never run the SQL on Production without explicit approval and a verified backup.

## Why this change matters

2026-10-28 audit found 8 `public` tables without RLS and with direct CRUD grants to `anon`/`authenticated`: `branches`, `categories`, `products`, `product_units`, `cart_sessions`, `fb_customers`, `pending_payments`, `order_items`. `news` had `authenticated` full-write policy; `orders` had a public insert policy; `news-media` Storage had direct write policies for any signed-in user. All of these are addressed in [supabase-hardening-review-only.sql](./supabase-hardening-review-only.sql).

The SQL is **not an official Supabase migration file**. Before applying, generate a migration through the Supabase CLI (`supabase migration new ...`), review its naming and schema, and test against an isolated database. A Supabase development branch may incur charges; do not create one without cost approval.

## Exact target permissions after the proposed change

| Table / bucket | `anon` | `authenticated` | Trusted `service_role` |
| --- | --- | --- | --- |
| `branches`, `categories`, `products`, `product_units` | SELECT only | SELECT only | Existing operations |
| `fb_customers`, `pending_payments`, `cart_sessions` | No direct table access | No direct table access | Existing operations |
| `order_items` | No access | SELECT only when the associated `orders.user_id = auth.uid()` | Existing operations |
| `orders` | No direct access | SELECT own orders (existing RLS policy) | Existing operations |
| `profiles` | No access | Existing own-profile SELECT/INSERT/UPDATE policies | Existing operations |
| `news` | SELECT | SELECT | All content writes via guarded admin APIs |
| `product-images` | Existing public image reads | Existing public image reads | Existing uploads |
| `news-media` | Existing public image/video reads | Existing public reads; no direct writes | Upload/update/delete via guarded admin API |

Important: PostgreSQL RLS cannot protect a `service_role` query. **Every server route using `getAdminClient()` must separately check authentication and authorization.** This PR adds explicit admin-role checks to admin API routes and admin SSR pages.

## Pre-release steps (in order)

1. Open Supabase project `Tan-vy-phat`; confirm project ref `dsgvnlyubkohjiojjmrm`. Do not accidentally use another connected Supabase project.
2. Confirm a usable database backup and recovery procedure. Do not create a backup by exporting any secrets into this repository.
3. Review all direct Supabase usage against the proposed read/write matrix. Current GitHub code uses `service_role` for privileged writes, while public catalog queries use `anon`.
4. Create an **isolated test database** with the same structure and representative, non-sensitive test data. Supabase development branch costs require prior approval.
5. Generate the real migration with the Supabase CLI; incorporate the reviewed SQL and execute it on the isolated environment first. This file is deliberately a review-only SQL draft, not auto-applied code.
6. Run the validation queries below. Use **anon** credentials for anonymous access tests, a normal (non-admin) authenticated account for customer tests, and a test admin account for admin tests. Do not use the service key to simulate public access.
7. Smoke-test: homepage, products, categories, unit prices, product detail, news, customer profile, own-order list and own-order detail; unauthenticated/admin access; news uploads, product admin editing, order status updates; sign-in, sign-out, token refresh. Do not place real orders or payments during testing.
8. Record rollback and verification outcomes; request explicit authorization before applying to Production. If approved, deploy the code in a reviewed release window and apply the tested SQL with a backup available.
9. After Production changes, rerun Supabase Security and Performance Advisors and inspect Next.js / Supabase logs.

## SQL verification (read-only; safe to run against a test database)

```sql
-- All 11 application tables should have RLS enabled after application.
SELECT c.relname AS table_name, c.relrowsecurity AS rls_enabled
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r'
ORDER BY c.relname;

-- Verify actual effective SQL privileges (NOT just policy presence).
SELECT c.relname AS table_name,
       has_table_privilege('anon', c.oid, 'SELECT') AS anon_select,
       has_table_privilege('anon', c.oid, 'INSERT') AS anon_insert,
       has_table_privilege('anon', c.oid, 'UPDATE') AS anon_update,
       has_table_privilege('anon', c.oid, 'DELETE') AS anon_delete,
       has_table_privilege('authenticated', c.oid, 'SELECT') AS auth_select,
       has_table_privilege('authenticated', c.oid, 'INSERT') AS auth_insert,
       has_table_privilege('authenticated', c.oid, 'UPDATE') AS auth_update,
       has_table_privilege('authenticated', c.oid, 'DELETE') AS auth_delete
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r'
ORDER BY c.relname;

SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check
FROM pg_policies
WHERE (schemaname = 'public' AND tablename IN
  ('products','categories','branches','product_units','orders','order_items',
   'profiles','news','fb_customers','pending_payments','cart_sessions'))
   OR (schemaname = 'storage' AND tablename = 'objects')
ORDER BY schemaname, tablename, policyname;

SELECT p.proname, p.proconfig,
       has_function_privilege('anon', p.oid, 'EXECUTE') AS anon_execute,
       has_function_privilege('authenticated', p.oid, 'EXECUTE') AS auth_execute
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
ORDER BY p.proname;
```

## Items requiring dashboard work / subsequent PR

- **Authentication → Password Security:** enable leaked-password protection if supported by the project's plan. See [Supabase password security](https://supabase.com/docs/guides/auth/password-security).
- **Auth settings:** verify public sign-ups, email confirmation, CAPTCHA, redirect allowlist and rate limits. Don't disable public sign-up until confirming customer account requirements.
- **Admin MFA:** implement authenticator-app enrollment plus an app-side `aal2` gate for privileged routes. Merely enabling MFA in the dashboard doesn't automatically require MFA for admins.
- **Storage news-media:** introduce separate MIME type/size limits after checking supported videos; keep both buckets public for website assets.
- **Order lookup privacy:** `app/api/orders/lookup/route.ts` currently returns address/name/other order details after supplying only a phone number. Introduce verified customer ownership or an OTP/order secret and rate limits before claiming this issue is resolved.
- **Other privileged code:** review other `service_role` usages, webhook verification, CSRF and request validation.
- **Performance:** 6 foreign-key index notices, 4 `auth.uid()` init-plan notices, one unused index notice. Optimize only after security is stable; never drop `pending_payments_status_idx` without workload evidence.

## Recovery

The SQL uses a single `BEGIN`/`COMMIT` transaction: a SQL error before `COMMIT` rolls back that transaction. If behavior breaks *after* commit, restore the tested prior GRANTs/policies/function settings via a separately reviewed rollback migration or use the verified database backup. **Do not blindly disable RLS as a rollback**, and do not delete any rows or Storage objects.

The SQL intentionally contains no table deletion, `TRUNCATE`, or `DELETE` statements.

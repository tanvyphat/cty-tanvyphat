# Tân Vy Phát — Catalog-only engineering guide (2026-10-28)

## Required business model
This is a product catalog, **not** an e-commerce platform. Keep product names,
images, category/branch filters, prices and unit labels, contact-by-phone and
admin product/news/account CRUD. Do not reintroduce cart, checkout, SePay payment,
Facebook order creation, order management or shipping quote endpoints.

## Stack and critical conventions
- Next.js 16.2.0 App Router, React 19, TS, TailwindCSS 4.
- Read `AGENTS.md` and Next 16 `node_modules/next/dist/docs/` before edits.
- `proxy.ts` covers admin/auth routes. Each privileged server API must
  check `user.app_metadata?.role === 'admin'` before using the service key.
- Public catalog queries use the anon/publishable key, never service role.
- `src/lib/supabase/server.ts` is catalog reader, `src/lib/supabase/admin.ts`
  is server-only privileged client.
- Public listing URL canonical parameter is `branch`; `brand` is a legacy alias.
- Product units/prices live in `product_units`; product `min_price` is
  maintained by a database trigger. `products.price` does not exist.
- `products.category` references `categories.slug`; categories belong to
  `branches`. Preserve branch and category ordering and URLs.
- Product detail uses an ISR revalidation period. Cache within React requests;
  avoid unbounded nested product queries.
- Keep web metadata/sitemap and legacy redirects stable.
- Supabase production has 8 public tables without RLS and a historically
  exposed service_role JWT. See `database/review-only/` before making changes.

## Safety
No changes to Production Supabase data/schema/RLS or auth settings without approval.
No credential rotation, force-push/history rewriting, merging or Production deploy.
No direct writes to main. Never echo or commit secrets.
Use a feature branch and test TypeScript, lint, Preview and admin regressions.

# Tân Vy Phát — Company Product Catalog

Website: https://tanvyphat.com · Next.js 16.2, React 19, TypeScript, TailwindCSS 4, Supabase PostgreSQL, Vercel.

## Business scope

This is a **catalog and company information website**, NOT an e-commerce checkout.
Public pages: homepage, searchable/filterable/paginated products, product detail with
units and prices, company information, news and phone/contact links. Admin provides
product, pricing/unit and news management, plus admin accounts.

Cart, online checkout, order creation, SePay/Facebook payment webhooks, shipping
quotation and consumer accounts have been retired. Legacy page URLs redirect to
catalog/contact pages. Historical database tables and rows are NOT deleted.

## Development

```bash
npm ci
npx tsc --noEmit
npm run lint
npm run build
```

Catalog configuration is limited to
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
and `NEXT_PUBLIC_SITE_URL`. See `.env.example` (no credentials).
The Admin UI uses the current Supabase Auth session + RLS. There is **no
service role or secret key** in the website runtime. The RLS/Storage policy
migration and Auth account-management RPC must be approved, applied and
regression-tested **before** deploying this PR to Production.
Never commit real keys or execute the review-only SQL on Production without
explicit approval.

`AGENTS.md` contains mandatory Next.js 16 guidance. Catalog data access lives
in `src/lib/supabase/server.ts`; admin API requests use
`createSSRClient()` with the Admin Auth session. Admin routes must validate a Supabase Auth user
with `user.app_metadata.role === 'admin'` **before** obtaining the service client;
the proxy is not a substitute for endpoint authorization.

## Security/change control

Supabase Production RLS currently requires hardening. Review the SQL proposal,
verification queries, explicit insecure emergency rollback and key-rotation plan
in `database/review-only/`. These files are documentation, not applied migrations.
The historical service-role JWT was committed to the public Git history; deleting
scripts does NOT revoke it. Rotation requires a separately approved coordinated
Supabase/Vercel change window.

No direct push to main, automatic PR merge, Production deployment, Production SQL
execution, production credential rotation, or data removal.

# Production security remediation — approval gate

**Current status:** PUBLIC repository previously contained a Supabase legacy JWT with
`role: service_role` in five seeding/upload scripts. Its existence in Git history
means removing literals on a new branch does NOT revoke it. The RLS migration cannot
make an active service-role JWT safe: service role bypasses RLS.

## Dependencies inspected from the current code
- Admin APIs: /api/admin/products, /api/admin/products/[id],
  /api/admin/products/upload, /api/admin/news, /api/admin/news/[id],
  /api/admin/news/upload, /api/admin/users all use server-side service role,
  guarded by a verified Supabase Auth user with `app_metadata.role=admin`.
- Admin Server Components: product/news list and edit pages, user management
  read server-side data via the same service-role client.
- Five maintenance scripts use SUPABASE_SERVICE_ROLE_KEY environment variable.
  They must not be run without a reviewed dry-run and verified source files.
- Removed legacy Facebook, SePay, checkout, shipping and order handlers have no
  runtime dependencies in the catalog deployment after the new PR code is merged.
- Supabase auth.users trigger `on_auth_user_created` invokes
  `public.handle_new_user()` to create a profile, independent of Vercel's service key.
- Review remaining automation, external integrations, or other deployments before rotation.

## Approved change window steps (do not run automatically)
1. Confirm Vercel Preview passes catalog, admin sign-in, admin image upload,
   product/news create/update/delete in isolated test data. Do not delete historical data.
2. Inventory **all** Vercel environments and other services consuming
   SUPABASE_SERVICE_ROLE_KEY; compare storage buckets and project ID.
3. Prefer Supabase secret API key(s) with scoped management where supported;
   if still using legacy JWT-based service_role, rotate the project's JWT secret
   only after analyzing ALL JWT-bearing clients and integrations. Rotation can
   invalidate old anon/service JWTs and live sessions. Do NOT assume changing a
   Vercel environment variable revokes an exposed legacy JWT.
4. Replace server-side secret values in Vercel Production/Preview/Development
   without putting them in code, PR, shell logs, or issue comments.
5. Redeploy via approved change control (not this PR), verify admin CRUD and Auth,
   then revoke legacy exposed key / rotate JWT signing secret using Supabase's
   supported key management workflow; verify old credential no longer authenticates.
6. Apply approved RLS migration only after fully testing policy behavior and
   checking the Auth trigger. Verify catalog remains readable and non-admin writes
   fail. Check error dashboards for 30-60 minutes.
7. Audit Git history exposure without force-pushing until explicitly authorized;
   history cleanup is secondary to **revoking** the credential.
8. Audit Supabase PostgREST/Postgres logs for suspicious use since the first
   affected commit; rotate any co-exposed credentials.

## Rollback / incident response
- If admin CRUD stops working, check JWT role, server-side environment and RLS
  grants before changing policy; restore last known valid (NEW, uncompromised)
  credentials and redeploy a known-good build through approved change control.
- If customer data is exposed or writes are detected, isolate public Data API
  roles by the approved RLS changes rather than restoring unsafe blanket grants.
- The SQL rollback file explicitly restores the insecure baseline and is for
  LAST-RESORT emergency use with separate approval only.
- Do not restore the compromised credential. Record incident timeline.

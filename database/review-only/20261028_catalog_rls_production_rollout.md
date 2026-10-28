# Production rollout — NOT AUTHORIZED, DO NOT EXECUTE

## Preconditions
- [ ] Create a disposable, non-Production Supabase test project with matching schema.
      Note: project creation may incur cost; explicit budget approval is needed.
- [ ] Apply `20261028_catalog_rls_proposal.sql` **only in test project**;
      run verification SQL, test all user roles, and test Auth signup trigger.
- [ ] Review direct `auth.users` metadata RPC against current Supabase Auth guidance.
      The RPCs are the sole narrowly-privileged exception needed for Admin user
      listing and changing app_metadata roles; they never read/write catalog tables.
- [ ] Verify current Admin identities (at audit: 3 of 8 users) retain rights.
- [ ] Verify Storage bucket constraints match actual upload UI/browser and Vercel limits.
- [ ] Test with at least one authenticated non-admin and one Admin account.
- [ ] Audit all legacy `service_role` dependencies including older external clients,
      then revoke/rotate the exposed key in a separately approved security cutover.
- [ ] Run full unit/integration/regression suite and sign off on Preview.
- [ ] Create backup, pick change window, define restore point and ownership.

## Carefully ordered Production change (separate explicit approval required)
1. Prepare reviewed SQL and backup. Confirm no active pending payments/webhooks.
2. Apply migration atomically through Supabase change-control tooling.
3. Immediately verify anon catalog reads, Admin Auth, product/news CRUD,
   product unit price trigger, Storage uploads (JPEG/PNG/WebP), Auth signup.
4. Deploy the reviewed catalog-only code only after policy verification, with
   the new Publishable Key on Vercel. The code no longer requires service_role
   or sb_secret; remove obsolete env variables only after deployed functions
   no longer depend on them. Production env update/redeploy requires approval.
5. Separately disable/revoke legacy credentials and verify old JWT rejected;
   consider legacy JWT signing-key revocation if still trusted.
6. Monitor HTTP 401/403/500, catalog timeouts, Storage errors and Auth logs.

## Rollback
- Preferred: fix missing RLS policy or Storage permission forward and keep all
  denied data protected. Do NOT restore RLS OFF just to recover Admin access.
- Restoring an older service_role-based production release is NOT a safe rollback
  while its exposed key may still be active.
- `20261028_catalog_rls_rollback.sql` restores dangerous old grants and must
  only run during an additional explicitly approved emergency recovery window.
- No data/buckets/accounts have been deleted as part of preparation.
- Revoke/re-issue affected sessions if auth signing key changes.

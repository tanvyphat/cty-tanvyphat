# INC-2026-10-28 — Supabase legacy service_role incident and approved cutover plan

**STATUS: OPEN / CREDENTIAL NOT REVOKED / APPROVAL REQUIRED.**
This runbook is preparatory documentation. Do **not** execute Production operations without explicit owner approval. Do not copy credentials into tickets, logs, GitHub, screenshots or chats.

## Verified evidence (read-only, 2026-10-28)

- Supabase project `dsgvnlyubkohjiojjmrm`: `ACTIVE_HEALTHY` (PostgreSQL 17).
- Repo `tanvyphat/cty-tanvyphat` is **PUBLIC**. Production still runs `main` commit `a28b823`. Draft PR #12 is *not* deployed to Production.
- `main` contains the **same single** legacy JWT with `role: service_role` in five paths:
  `scripts/seed-thienlong.mjs`, `scripts/push-thienlong-cards.mjs`,
  `scripts/update-thienlong-images.mjs`, `scripts/upload-and-seed.mjs`,
  `scripts/upload-brand-logos.mjs`. Its `iat` date is 2026-03-31 and `exp` date is 2036-03-30.
- Read-only scanning of 125 reachable commits identified these five paths containing JWT-pattern secrets; none found in the PR HEAD; no `sb_secret_` or common GitHub/Stripe/AWS token prefix was identified by this scan. **This is not an exhaustive entropy or historical-object secret audit.**
- Supabase's publishable-key inventory confirms **legacy anon: enabled** and **modern publishable 'default': enabled**. This connector **does not enumerate service_role/secret API keys or signing-key states**, so the existence and current status of a new `sb_secret_` key and the signing-key migration status remain *unverified*.
- Supabase Edge Functions: **0**. Database development branches: **0**. Database: no `pg_cron`, `pg_net`, `http`, or `vault` extension found and no HTTP/webhook-named trigger found. Signup trigger `auth.users -> public.handle_new_user()` is present.
- The Vercel project has `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SITE_URL` variables defined for **Production and Preview**, not Development. Value equivalence to the leaked JWT is **not verified**.
- Production code consumes legacy-named keys for public SSR/browser auth and privileged admin routes; the latter includes products/news CRUD, uploads and Admin user operations. Legacy SePay/Facebook/GHTK Production handlers and corresponding environment keys still exist until catalog-only PR is deployed. Third-party consumers outside this project remain unverified.
- Supabase Security Advisor: **8 public tables with RLS disabled**. A service-role credential bypasses RLS regardless of policy; RLS must be separately fixed but cannot revoke this JWT.

## Official source of truth (as of 2026-10-28)

- [Supabase: API keys and leaked-key replacement](https://supabase.com/docs/guides/getting-started/api-keys).
- [Supabase: Migrate legacy anon/service_role to publishable/secret](https://supabase.com/docs/guides/getting-started/migrating-to-new-api-keys).
- [Supabase: JWT signing keys, migration, rotation and revocation](https://supabase.com/docs/guides/auth/signing-keys).
- [Supabase troubleshooting: rotating legacy secrets](https://supabase.com/kb/troubleshooting/rotating-anon-service-and-jwt-secrets-1Jq6yd).

Legacy JWT-based `service_role` cannot be revoked independently from the legacy JWT secret by generating a second JWT. **Adding a new `sb_secret_` key does NOT disable the leaked key.** New secret keys can be rotated independently after migration. Supabase supports deactivating legacy API keys via **Settings > API Keys**, and migrating to the JWT signing-keys system to ultimately **revoke the legacy signing key**, including its JWT signatures. Do not claim complete revocation until tested.

## Ready-to-run code preparation in PR #12 (NOT Production)

- **Updated catalog-only PR**: the privileged `src/lib/supabase/admin.ts` has been
  removed entirely. Admin APIs/Server Components use `createSSRClient()` with
  the verified user Auth session, plus RLS. The narrow admin-user RPC requires
  separate migration approval because the Supabase Auth Admin API cannot operate
  with a publishable key alone; it touches only `auth.users`, not catalog data.
  It is SECURITY DEFINER with explicit live Admin check from `auth.users`,
  restrictive EXECUTE permissions, no dynamic SQL, and no direct table exposure.
- Public key helper: first use `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, fallback to `NEXT_PUBLIC_SUPABASE_ANON_KEY`; used consistently by browser client, server client, SSR client and Auth proxy.
- No `NEXT_PUBLIC_SUPABASE_SECRET_KEY` and no API keys stored in source.
- The new catalog application does not reference `SUPABASE_SECRET_KEY` or
  `SUPABASE_SERVICE_ROLE_KEY` at runtime; the old **Production main** still does.
  Key fallback descriptions elsewhere in this runbook refer to historical releases.
- Migration RLS/Storage/Auth RPC must be verified on a disposable test project
  **before** any deployment of the new catalog-only code. Without that SQL,
  Admin uploads/role management may fail or public writes remain unprotected.
- Existing Vercel Preview/Production environment names are unchanged.
- Earlier PR removes five contaminated scripts; those scripts remain on public `main` until a separately approved release. Do not execute them.

## Recommended emergency cutover — approval gate

**A. Inventory/prepare:**
1. Freeze direct main writes and unrelated production releases. Use Supabase Dashboard `Project Settings > API Keys` to inspect modern *Secret keys*, legacy-key enabled states and recent-use indicators. Inspect `Auth > JWT Signing Keys` for legacy secret state and session token expiry.
2. Create **a new** managed `sb_secret_` key through Dashboard, preferably a named key dedicated to Vercel. Keep its value only within the Supabase/Vercel secret-management interfaces; do not reveal it to the assistant. New public key already exists.
3. Review all Vercel environments, external CI/jobs/workers/clients and webhook dependencies. Scope here verified only the linked Vercel project, Git repository and Supabase project.

**B. Stage/swap:**
4. Test the modern secret on **Preview** in an isolated change window, using the protected Preview secret manager; test product/news read, upload, admin Auth login and Admin authorization, and verify non-admin is denied.
5. For minimum change risk **without merging the 82-file PR**: the existing Production `main` client can accept a new `sb_secret_` string in the current server-only **`SUPABASE_SERVICE_ROLE_KEY` variable**. Change its **value** through Vercel's protected environment setting, not GitHub; likewise set the existing public `NEXT_PUBLIC_SUPABASE_ANON_KEY` value to the available modern publishable key (name is legacy but behavior is compatible). Redeploy the **same** approved Production commit; validate before deactivating old keys. Alternatively, following separate approval of PR #12, configure `SUPABASE_SECRET_KEY` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and deploy the reviewed PR.
6. Validate the exact **new Production deployment**: homepage/catalog/category/search/product details/images/units/news/contact; Admin sign-in, product/news CRUD and uploads with safe test records, then remove only the test records with approval. Compare Vercel and Supabase errors/latency. Do not use old credentials in production code as fallback after the cutover.

**C. Retire the exposed legacy key:**
7. In Supabase Dashboard `Settings > API Keys`, **disable legacy `service_role` and `anon` API keys** after all clients have moved. This is reversible in Dashboard, but reactivation of the leaked credential would restore risk. Verify old credential rejected through the API gateway, recording status codes *only*.
8. **For complete JWT-signature revocation** inspect whether the legacy JWT secret is still trusted. If it is, follow Supabase `Auth > JWT Signing Keys` migration: import legacy secret, activate a new asymmetric signing key (if not already active), let valid user JWTs expire/refreshed per configured expiry, and then **revoke** the previously-used legacy signing key. In an active incident immediate revocation may be safer but can end existing Admin sessions. Supabase documentation recommends expiry plus a buffer (e.g. 1h15m for one-hour access tokens) when session continuity matters. Never assume simply disabling legacy API keys revokes every JWT signed with that secret.
9. Independently verify the compromised JWT cannot authorize catalog-independent privileged access, using a read-only endpoint and only ephemeral secure secret handling; report **only the HTTP status/outcome**. Verify new secret continues to work. Note potential cached external JWT verification for up to ~20 minutes; Supabase-managed services are designed to enforce revocation immediately.

**D. Clean up:**
10. After proven invalidation, keep PR #12 Draft pending end-to-end Admin QA; then separately approve catalog migration/Prod deployment and RLS migration. Avoid history rewrite without explicit approval. Monitor audit logs for anomalous reads/writes; API-key usage attribution is not proof of no compromise.

## Blast radius, uptime, sessions, rollback

- `sb_secret_` key swap itself should not alter Auth session JWT signing. Changing signing keys and leaving old valid for a grace period minimizes logout; **revoking** old signing key early can invalidate existing Admin access tokens and cause re-login.
- Build-time public keys are included in the browser bundle; **a Vercel environment edit without a redeploy does not update active client JS**. Serverless functions may likewise retain the old env snapshot.
- Safe **reversible** actions: add modern keys, stage variable values, redeploy a known-good commit, temporarily re-enable a legacy API-key (BUT only as last-resort incident response due to exposed risk). **Not trivially reversible:** permanently deleting signing keys, rotating an old JWT secret, deleting named secret keys, purging Git history. Never restore an exposed credential after a verified compromise.
- Downtime duration **cannot be reliably estimated** without dependency and session inventory. Staggered cutover is designed for minimal disruption but no zero-downtime guarantee can be made in advance. Keep active monitoring, rollback deployment and separately secure backup credentials ready.
- If Admin starts failing: roll back deployment/environment to *known-good uncompromised* key, check Auth and RLS compatibility; avoid re-enabling the exposed legacy key. If catalog fails: restore a compatible **modern publishable** key and redeploy; ensure endpoint and RLS verification. If new signing key causes Auth errors: use Dashboard-supported standby/previous-state actions only with explicit change control. NEVER force-push, delete Production rows or loosen RLS as a shortcut.

## Required explicit Production approval

Only proceed when the owner replies exactly:

**TÔI PHÊ DUYỆT THU HỒI KHÓA SUPABASE PRODUCTION THEO PHƯƠNG ÁN ĐÃ TRÌNH BÀY.**

Approval covers the enumerated security cutover steps; any Production schema/RLS, main merge, data deletion, deployment of PR #12 or force-push remains subject to its own approval.

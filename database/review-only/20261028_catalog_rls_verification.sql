-- Safe post-migration read-only checks; execute only after approved migration.
SELECT c.relname AS table_name, c.relrowsecurity AS rls_enabled
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r'
ORDER BY c.relname;
SELECT table_name,grantee,string_agg(privilege_type, ', ' ORDER BY privilege_type) AS privileges
FROM information_schema.role_table_grants
WHERE table_schema='public' AND grantee IN ('anon','authenticated')
GROUP BY table_name,grantee ORDER BY table_name,grantee;
SELECT tablename,policyname,roles,cmd,qual,with_check
FROM pg_policies WHERE schemaname='public' ORDER BY tablename,policyname;
SELECT p.proname,p.prosecdef,p.proconfig,
  has_function_privilege('anon', p.oid, 'EXECUTE') AS anonymous_exec
FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
WHERE n.nspname='public';
-- API acceptance criteria: anonymous SELECT catalog/news succeeds;
-- anonymous INSERT/UPDATE/DELETE catalog/news must fail;
-- authenticated non-admin writes must fail; admin CRUD succeeds; old tables denied;
-- auth.users insertion still creates profiles; product_units triggers maintain min_price.

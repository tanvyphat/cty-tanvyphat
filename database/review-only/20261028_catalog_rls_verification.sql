-- REVIEW ONLY: run after an approved migration; no writes.
SELECT c.relname AS table_name,c.relrowsecurity AS rls_enabled
FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname='public' AND c.relkind='r' ORDER BY c.relname;

SELECT tablename,policyname,roles,cmd,qual,with_check
FROM pg_policies WHERE schemaname IN ('public','storage')
 AND (schemaname='public' OR tablename='objects')
ORDER BY schemaname,tablename,policyname;

SELECT table_name,grantee,string_agg(privilege_type,',' ORDER BY privilege_type) AS privileges
FROM information_schema.role_table_grants
WHERE table_schema='public' AND grantee IN ('anon','authenticated')
GROUP BY table_name,grantee ORDER BY table_name,grantee;

SELECT id,public,file_size_limit,allowed_mime_types FROM storage.buckets
WHERE id IN ('product-images','news-media') ORDER BY id;

SELECT count(*) AS total_users,
       count(*) FILTER (WHERE raw_app_meta_data ->> 'role' = 'admin') AS admin_count
FROM auth.users;

SELECT p.proname,p.prosecdef,p.proconfig,
  has_function_privilege('anon',p.oid,'EXECUTE') AS anon_can_execute,
  has_function_privilege('authenticated',p.oid,'EXECUTE') AS authenticated_can_execute
FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
WHERE n.nspname='public' AND p.proname LIKE 'catalog_admin_%';

-- Staging role test matrix, NOT EXECUTED on Production:
-- anon: SELECT products/categories/branches/product_units/news PASS; write DENIED
-- authenticated non-admin: catalog and media writes DENIED; RPC denied
-- authenticated admin: catalog/news CRUD PASS, storage upload/update/delete PASS
-- Admin role RPC: authenticated non-admin denied; admin can list/promote/demote
-- but cannot demote self or last admin.
-- Auth signup still inserts profiles.
-- Product unit CRUD updates product.min_price trigger.
-- All legacy commerce tables deny anon/authenticated access.

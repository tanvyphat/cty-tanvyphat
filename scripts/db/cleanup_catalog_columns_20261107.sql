-- Lệnh 2: Apply MANUALLY after successful catalog-only preview and backup.
-- Backup selected dropped columns in an unexposed private schema to permit recovery.
begin;
set local lock_timeout = '5s';
set local statement_timeout = '60s';

create schema if not exists catalog_cleanup_backup;
revoke all on schema catalog_cleanup_backup from public, anon, authenticated;
create table catalog_cleanup_backup.products_removed_20261107 as
select id, keyword, min_price from public.products;
create table catalog_cleanup_backup.product_units_removed_20261107 as
select id, product_id, unit_name, price, stock, weight_grams from public.product_units;
revoke all on all tables in schema catalog_cleanup_backup from public, anon, authenticated;

drop trigger if exists trg_sync_product_min_price on public.product_units;
drop function if exists public.sync_product_min_price();

alter table public.product_units
  drop column if exists unit_name,
  drop column if exists price,
  drop column if exists stock,
  drop column if exists weight_grams;

alter table public.products
  drop column if exists keyword,
  drop column if exists min_price;
commit;
-- Keep product_units.id / product_id / sort_order / created_at,
-- products.fb_post_url / featured and all catalog product rows.

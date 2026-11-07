-- Apply manually AFTER the catalog-only deployment is live and AFTER a verified DB backup.
-- Does not touch fb_customers or catalog/admin tables.
begin;
set local lock_timeout = '5s';
set local statement_timeout = '30s';
do $$
begin
 if exists (select 1 from public.order_items limit 1)
 or exists (select 1 from public.pending_payments limit 1)
 or exists (select 1 from public.cart_sessions limit 1)
 or exists (select 1 from public.orders limit 1) then
   raise exception 'Legacy commerce data still present. Export and review before dropping.';
 end if;
end $$;
drop table if exists public.order_items;
drop table if exists public.pending_payments;
drop table if exists public.cart_sessions;
drop table if exists public.orders;
-- Lệnh 2 có migration riêng. Không xóa các cột products từ script dọn đơn hàng cũ.
commit;
-- fb_customers intentionally retained pending data handling and backup.

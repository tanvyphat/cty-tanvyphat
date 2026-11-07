# Tân Vy Phát — Catalog giá sỉ

Website giới thiệu giấy in, văn phòng phẩm, hàng tiêu dùng. Khách xem ảnh, đọc mô tả, tìm kiếm, có thể đăng ký / đăng nhập / đăng xuất tài khoản, và liên hệ điện thoại / Zalo / Facebook. **Không đặt hàng hoặc thanh toán qua website**.

**Giao nhận:** Giao chủ yếu nội thành TP.HCM; khu vực khác chỉ khi thỏa thuận, khách chịu toàn bộ phí vận chuyển.

## Phát triển
- Next.js 16.2, React 19, Supabase, Vercel.
- `npm ci`; `npm run build`.
- Biến môi trường: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`.
- Quản trị sản phẩm/tin tức tại `/admin`. Không commit khóa bí mật.
- Dọn cấu trúc Supabase theo `scripts/db/README.md` sau khi triển khai.

- Bảng `product_units` chỉ còn id, product_id, sort_order, created_at, không dùng cho giá hoặc tồn kho.
- Bảng `products` không còn keyword, min_price; vẫn giữ featured và fb_post_url.
- Supabase Auth: bật Allow new users to sign up và cấu hình email/Google, redirect URLs trong Dashboard nếu cần dùng đăng ký.

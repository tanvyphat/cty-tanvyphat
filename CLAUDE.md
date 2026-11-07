# CTY Tân Vy Phát — Website giới thiệu sản phẩm

- Catalog: duyệt danh mục, tìm kiếm, hình ảnh, mô tả, đơn vị sản phẩm và tin tức.
- CTA: gọi điện, Zalo, Facebook; **không có giỏ hàng, thanh toán trực tuyến, đăng nhập khách hàng, chatbot tạo giỏ hàng**.
- Chỉ giao nội thành TP.HCM theo chính sách chính; giao ngoài khu vực theo thỏa thuận và khách chịu phí vận chuyển.
- Next.js 16.2, React 19, Tailwind v4, Supabase và Vercel.
- Giữ Supabase Auth cho quản trị viên: /admin/dang-nhap, /admin/san-pham, /admin/tin-tuc, /admin/quan-tri-vien.
- Bảng dùng cho catalog: products (giữ cột keyword mã sản phẩm), product_units, categories, branches, news. profiles có thể dùng với admin.

## Quản lý secret
- Không commit Supabase service-role key, mật khẩu, Facebook token hoặc SePay secret vào repo. Dùng environment variables.
- Các secret từng bị đưa lên Git công khai phải **rotate/revoke** riêng. Gỡ file không xóa lịch sử commit.
- Trên Vercel giữ NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SITE_URL.
- Gỡ các biến Facebook webhook, GHTK và SePay sau khi bản catalog-only đã triển khai và các kết nối ngoài đã tắt.

## Dọn database
Đọc scripts/db/README.md và chỉ thực hiện SQL cleanup sau khi production đã chạy phiên bản catalog-only, đã backup và kiểm tra.

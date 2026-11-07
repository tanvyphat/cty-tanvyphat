# Dọn database thương mại điện tử cũ — CHƯA thực thi

Chỉ chạy sau khi code catalog-only đã được triển khai và xác nhận webhook/API thương mại điện tử không còn hoạt động.

1. Sao lưu độc lập production database, kiểm tra khôi phục.
2. Kiểm tra lại số dòng của orders, order_items, pending_payments, cart_sessions. Script SQL sẽ từ chối chạy nếu còn dữ liệu.
3. Chạy cleanup-empty-commerce.sql thủ công (hoặc dưới dạng migration có kiểm duyệt).
4. Giữ nguyên products, product_units, categories, branches, news, profiles.
5. fb_customers có 3 bản ghi khách hàng: **không xóa trong script** vì cần sao lưu và cân nhắc nghĩa vụ lưu trữ/xóa dữ liệu trước.
6. Xóa Meta App Webhooks subscription cho Facebook Page và SePay Webhook trong dashboard nhà cung cấp; sau đó dọn Vercel env cũ.
7. Rotate Supabase service-role key từng bị hardcode trong Git history và cập nhật env mới.

**Giữ products.keyword:** 298/298 sản phẩm đã có mã riêng; không xóa hoặc ghi đè các mã này khi tắt Facebook bot.

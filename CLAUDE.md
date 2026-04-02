# CT Tân Vy Phát — Web Bán Hàng

## Stack

- **Next.js 16.2.0** (App Router) — có breaking changes, đọc kỹ phần dưới
- **React 19**, **TypeScript**, **Tailwind CSS v4**
- **Supabase** (PostgreSQL + Auth) — dùng `@supabase/ssr`
- **Facebook Graph API v21.0** — webhook comment → Messenger reply → checkout

---

## ⚠️ Next.js 16 Breaking Changes

Trước khi viết code, đọc docs trong `node_modules/next/dist/docs/`.

| Thứ | Thay đổi |
|-----|---------|
| `middleware.ts` | **Deprecated** — dùng `proxy.ts` với export `proxy` (không phải `middleware`) |
| `cookies()` | **Async** — phải `await cookies()` |
| `params` trong route handlers | **Promise** — phải `await params` trước khi dùng |

---

## Cấu trúc thư mục

```
app/
  api/
    webhook/facebook/route.ts   # Facebook webhook (GET verify + POST events)
    orders/route.ts             # POST tạo đơn hàng từ checkout form
    admin/
      logout/route.ts
      orders/route.ts           # GET danh sách đơn (filter + phân trang)
      orders/[id]/route.ts      # PATCH cập nhật trạng thái
  dat-hang/[token]/
    page.tsx                    # Trang checkout (server component)
    CheckoutForm.tsx            # Form điền thông tin (client component)
  admin/
    layout.tsx                  # Layout riêng, không có Navbar/Footer
    dang-nhap/page.tsx
    don-hang/page.tsx
    don-hang/[id]/page.tsx
  auth/confirm/route.ts         # PKCE token exchange (password reset)
src/lib/
  supabase/
    server.ts   # getClient(), createSSRClient(), ProductRow type
    admin.ts    # getAdminClient() dùng SERVICE_ROLE_KEY
    browser.ts  # createSupabaseBrowserClient()
  facebook.ts   # verifySignature, sendPrivateReply, sendMessage, builders
proxy.ts        # Route guard cho /admin/* (thay cho middleware.ts)
```

---

## Import path

`@/*` alias trỏ về **project root**, không phải `src/`.

```ts
// ĐÚNG
import { getAdminClient } from '@/src/lib/supabase/admin'
import { sendPrivateReply } from '@/src/lib/facebook'

// SAI
import { getAdminClient } from '@/lib/supabase/admin'
```

---

## Supabase

### Clients

| Client | Dùng khi | File |
|--------|----------|------|
| `getClient()` | Read-only, server component | `src/lib/supabase/server.ts` |
| `createSSRClient()` | Auth session (phải await) | `src/lib/supabase/server.ts` |
| `getAdminClient()` | Ghi DB từ API route | `src/lib/supabase/admin.ts` |
| `createSupabaseBrowserClient()` | Client component | `src/lib/supabase/browser.ts` |

### Database tables

- `products` — thêm cột `keyword TEXT UNIQUE`, `price NUMERIC`, `stock INTEGER`
- `cart_sessions` — token UUID, fb_user_id, product_id, status, expires_at
- `orders` — denormalized (product_name, product_price copy lại lúc đặt)
- `fb_customers` — keyed by PSID, lưu thông tin giao hàng để tự điền lần sau

### Auth (admin panel)

- Dùng Supabase Auth email+password (PKCE flow)
- Tắt public sign-up trong Supabase Dashboard → Authentication → Settings
- Tạo user thủ công: Authentication → Users → Add user → tick "Auto Confirm User"

---

## Facebook Webhook

### Flow

```
User comment keyword → feed webhook → private_replies → button "Thêm vào giỏ hàng"
                                                              ↓ (postback)
                                              tạo cart_session → gửi link /dat-hang/{token}
                                                                          ↓
                                                            user điền form → POST /api/orders
```

### Env vars cần thiết

```
FB_APP_SECRET=           # App → Settings → Basic → App Secret
FB_VERIFY_TOKEN=         # Tự đặt, điền vào cả webhook setup trên Facebook
FB_PAGE_ACCESS_TOKEN=    # Page Access Token với permissions:
                         #   pages_messaging, pages_manage_metadata, pages_read_engagement
```

### Page Access Token

Lấy từ **Graph API Explorer** — chọn đúng Page (không phải User Token). Verify:
```
GET /me?access_token=TOKEN → phải trả về tên Page, không phải tên người dùng
```

### Subscribe Page vào webhook

```powershell
Invoke-RestMethod -Method POST `
  -Uri "https://graph.facebook.com/v21.0/{PAGE_ID}/subscribed_apps" `
  -Body "subscribed_fields=feed,messages,messaging_postbacks&access_token={PAGE_ACCESS_TOKEN}"
```

### Lưu ý private_replies

- `feed` webhook và `messages` webhook là **2 subscription riêng biệt**
- `private_replies` chỉ hoạt động với comment trên **Page post** (không phải User post)
- Trong Development mode: chỉ fire webhook cho user có role trong App (Admin/Developer/Tester)

---

## Admin Panel

- URL: `/admin/don-hang`
- Login: `/admin/dang-nhap`
- Route guard: `proxy.ts` redirect về login nếu chưa auth
- Logout: `POST /api/admin/logout`

---

## Lệnh thường dùng

```bash
npm run dev    # dev server
npm run build  # kiểm tra TypeScript + build
```

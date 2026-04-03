# CT Tân Vy Phát — Web Bán Hàng

## Stack

- **Next.js 16.2.0** (App Router)
- **React 19**, **TypeScript**, **Tailwind CSS v4**
- **Supabase** (PostgreSQL + Auth) — dùng `@supabase/ssr`
- **Facebook Graph API v21.0** — webhook comment → Messenger → giỏ hàng web

---

## ⚠️ Next.js 16 Breaking Changes

| Thứ | Thay đổi |
|-----|---------|
| `middleware.ts` | **Deprecated** — dùng `proxy.ts` với export `proxy` |
| `cookies()` | **Async** — phải `await cookies()` |
| `params` trong route handlers | **Promise** — phải `await params` trước khi dùng |
| Client component dùng `useSearchParams` | Phải bọc trong `<Suspense>` |

---

## Cấu trúc thư mục

```
app/
  api/
    webhook/facebook/route.ts      # Facebook webhook (GET verify + POST events)
    orders/route.ts                # POST tạo đơn hàng từ checkout form
    products/[id]/route.ts         # GET thông tin sản phẩm (dùng cho Facebook cart link)
    products/related/route.ts      # GET sản phẩm liên quan theo category
    admin/
      logout/route.ts
      orders/route.ts              # GET danh sách đơn (filter + phân trang)
      orders/[id]/route.ts         # PATCH cập nhật trạng thái
  gio-hang/
    page.tsx                       # Server component — fetch categories, pass xuống client
    CartClient.tsx                 # Client component — cart UI + carousel sản phẩm liên quan
  thanh-toan/
    page.tsx                       # Client component — checkout form + order summary
  admin/
    layout.tsx                     # Layout riêng, không có Navbar/Footer
    dang-nhap/page.tsx
    don-hang/page.tsx
    don-hang/[id]/page.tsx
  auth/confirm/route.ts            # PKCE token exchange (password reset)
src/
  contexts/
    CartContext.tsx                 # React Context — single source of truth cho cart
  hooks/
    useCart.ts                     # Re-export useCart từ CartContext + useFbUserId
  components/
    AddToCartButton.tsx            # Nút "Thêm vào giỏ" — client component
    CartBadge.tsx                  # Icon giỏ hàng + badge số lượng ở Navbar
    ProductCard.tsx                # Card sản phẩm — hiện AddToCartButton nếu có giá
    FeaturedCarousel.tsx           # Carousel sản phẩm (dùng cho trang chủ + giỏ hàng)
    Navbar.tsx                     # Navbar — chứa CartBadge
  lib/
    supabase/
      server.ts                    # getClient(), createSSRClient(), ProductRow type
      admin.ts                     # getAdminClient() dùng SERVICE_ROLE_KEY
      browser.ts                   # createSupabaseBrowserClient()
    facebook.ts                    # verifySignature, sendMessage, buildCartLinkMessage
proxy.ts                           # Route guard cho /admin/*
```

---

## Import path

`@/*` alias trỏ về **project root**, không phải `src/`.

```ts
// ĐÚNG
import { getAdminClient } from '@/src/lib/supabase/admin'
import { sendMessage } from '@/src/lib/facebook'

// SAI
import { getAdminClient } from '@/lib/supabase/admin'
```

---

## Giỏ hàng (Cart)

### Kiến trúc

- Cart lưu trong **localStorage** (`tvp_cart`) — hoàn toàn client-side
- `CartContext` (`src/contexts/CartContext.tsx`) là single source of truth
- `CartProvider` bọc toàn bộ app trong `app/layout.tsx`
- Khởi tạo với `[]`, hydrate từ localStorage trong `useEffect` — tránh hydration mismatch

### Sử dụng

```ts
import { useCart } from '../hooks/useCart'        // từ client component
// hoặc
import { useCart } from '../contexts/CartContext'  // import trực tiếp

const { items, totalItems, totalPrice, addItem, removeItem, updateQuantity, clearCart } = useCart()
```

### CartItem type

```ts
interface CartItem {
  productId: number
  slug: string
  name: string
  image: string | null
  price: number | null
  quantity: number
}
```

### localStorage keys

| Key | Nội dung |
|-----|---------|
| `tvp_cart` | `CartItem[]` |
| `tvp_fb_user_id` | Facebook PSID (lưu khi vào `/gio-hang?fbid=...`) |

### Facebook cart link

Khi user postback "Thêm vào giỏ hàng" qua Messenger, bot gửi link:
```
/gio-hang?add={product.id}&fbid={psid}
```
Trang giỏ hàng (CartClient) đọc query params, fetch product, `addItem()`, rồi xóa params khỏi URL.

---

## Database tables

| Bảng | Mô tả |
|------|-------|
| `products` | `id, slug, name, description, images, price, stock, category, keyword, featured, fb_post_url` |
| `orders` | `id (UUID), customer_name, customer_phone, customer_address, note, total_price, status, created_at` |
| `order_items` | `id (UUID), order_id (UUID FK), product_id, product_name, product_price, quantity` |
| `fb_customers` | `fb_user_id (PK), customer_name, customer_phone, customer_address, updated_at` |

> **Lưu ý:** `orders.id` là **UUID** — `order_items.order_id` phải khai báo `UUID NOT NULL REFERENCES orders(id)`.

### Order flow

1. Client POST `/api/orders` với `{ customer_name, customer_phone, customer_address, note, fb_user_id, items: [{product_id, quantity}] }`
2. API fetch product info, tính `total_price`, insert `orders` → insert `order_items`
3. Nếu có `fb_user_id`, upsert `fb_customers`
4. Client gọi `clearCart()` sau khi thành công

---

## Supabase

### Clients

| Client | Dùng khi | File |
|--------|----------|------|
| `getClient()` | Read-only, server component | `src/lib/supabase/server.ts` |
| `createSSRClient()` | Auth session (phải await) | `src/lib/supabase/server.ts` |
| `getAdminClient()` | Ghi DB từ API route | `src/lib/supabase/admin.ts` |
| `createSupabaseBrowserClient()` | Client component | `src/lib/supabase/browser.ts` |

### Auth (admin panel)

- Dùng Supabase Auth email+password (PKCE flow)
- Tắt public sign-up trong Supabase Dashboard → Authentication → Settings
- Tạo user thủ công: Authentication → Users → Add user → tick "Auto Confirm User"

---

## Facebook Webhook

### Flow hiện tại

```
User comment keyword
  → feed webhook
  → private_replies: button "Thêm vào giỏ hàng"
      ↓ (postback ADD_TO_CART:{product_id})
  → sendMessage: link /gio-hang?add={product_id}&fbid={psid}
      ↓
  → User mở web, sản phẩm tự thêm vào giỏ localStorage
  → Checkout tại /thanh-toan → POST /api/orders
```

### ProductCard & trang detail — logic nút

- Nếu `product.price != null` → hiện **AddToCartButton** (thêm vào giỏ)
- Nếu `product.price == null` → hiện nút **Đặt hàng** gọi điện (`tel:`)

### Env vars

```
FB_APP_SECRET=           # App → Settings → Basic → App Secret
FB_VERIFY_TOKEN=         # Tự đặt, điền vào webhook setup trên Facebook
FB_PAGE_ACCESS_TOKEN=    # Page Access Token (pages_messaging, pages_manage_metadata, pages_read_engagement)
NEXT_PUBLIC_SITE_URL=    # URL production, dùng để build cart link
```

### Page Access Token

Lấy từ **Graph API Explorer** — chọn đúng Page (không phải User Token). Verify:
```
GET /me?access_token=TOKEN → phải trả về tên Page
```

### Subscribe Page vào webhook

```powershell
Invoke-RestMethod -Method POST `
  -Uri "https://graph.facebook.com/v21.0/{PAGE_ID}/subscribed_apps" `
  -Body "subscribed_fields=feed,messages,messaging_postbacks&access_token={PAGE_ACCESS_TOKEN}"
```

### Lưu ý

- `feed` webhook và `messages` webhook là **2 subscription riêng biệt**
- `private_replies` chỉ hoạt động với comment trên **Page post** (không phải User post)
- Trong Development mode: chỉ fire webhook cho user có role trong App

---

## Admin Panel

- URL: `/admin/don-hang`
- Login: `/admin/dang-nhap`
- Route guard: `proxy.ts` redirect về login nếu chưa auth
- Logout: `POST /api/admin/logout`
- Trang chi tiết đơn: hiện danh sách `order_items` với tên, số lượng, đơn giá, thành tiền

---

## Lệnh thường dùng

```bash
npm run dev    # dev server
npm run build  # kiểm tra TypeScript + build
```

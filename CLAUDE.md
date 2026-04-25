# CT Tân Vy Phát — Web Bán Hàng

## Stack

- **Next.js 16.2.0** (App Router)
- **React 19**, **TypeScript**, **Tailwind CSS v4**
- **Supabase** (PostgreSQL + Auth + Storage) — dùng `@supabase/ssr`
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
  san-pham/
    page.tsx                       # Server component — trang sản phẩm với hero + filter + grid
    [slug]/page.tsx                # Trang chi tiết sản phẩm
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
    ProductCard.tsx                # Card sản phẩm — dùng next/image, hiện AddToCartButton nếu có giá
    ProductHero.tsx                # Hero trang sản phẩm: branch tabs + search bar (client)
    CategoryStrip.tsx              # Thanh icon danh mục ngang, highlight theo branch (client)
    SortBar.tsx                    # Pill buttons sắp xếp + đếm sản phẩm (client)
    ProductFilter.tsx              # Sidebar bộ lọc: size/weight / hãng / loại SP (client)
    ProductPagination.tsx          # Phân trang
    FeaturedCarousel.tsx           # Carousel sản phẩm (trang chủ + giỏ hàng)
    Navbar.tsx                     # Navbar — chứa CartBadge
  lib/
    supabase/
      server.ts                    # getClient(), getBranches(), getCategories(), getProductsFiltered()
      admin.ts                     # getAdminClient() dùng SERVICE_ROLE_KEY
      browser.ts                   # createSupabaseBrowserClient()
    facebook.ts                    # verifySignature, sendMessage, buildCartLinkMessage
scripts/
  upload-and-seed.mjs              # Convert JPG→WebP, upload Supabase Storage, seed products
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

## Trang sản phẩm `/san-pham`

### 3 dòng sản phẩm (branches)

| Branch | Slug | Filter sidebar | Thứ tự tab |
|--------|------|---------------|------------|
| Giấy In | `giay-in` | KÍCH THƯỚC (A4/A3/A5/A3L) + TRỌNG LƯỢNG (70/75/80/100gsm) | 1 |
| Văn Phòng Phẩm | `van-phong-pham` | THƯƠNG HIỆU (hãng) | 2 |
| Hàng Tiêu Dùng Thái Lan | `hang-thai-lan` | LOẠI SẢN PHẨM | 3 |

### URL params trang sản phẩm

| Param | Giá trị | Mô tả |
|-------|---------|-------|
| `branch` | slug hoặc `all` | Dòng sản phẩm đang xem |
| `category` | slug | Sub-category (hãng / loại SP) |
| `search` | text | Tìm kiếm theo tên + mô tả |
| `sort` | `name` \| `price` | Trường sắp xếp |
| `dir` | `asc` \| `desc` | Chiều sắp xếp |
| `size` | `A4,A3,A5,A3L` (comma-sep) | Kích thước — chỉ dùng cho Giấy In |
| `weight` | `70gsm,80gsm,...` (comma-sep) | Trọng lượng — chỉ dùng cho Giấy In |

### Sort mặc định cho Giấy In

Khi `branch=giay-in` và không chọn sort khác, sắp xếp theo **brand priority** (categories.sort_order):
Supreme (10) → Idea (20) → Delight (30) → Projecta Optima (40) → Double A (50) → Paper One (60) → Quality (70) → Bìa Thái Gold (80) → Tổng Hợp (999)

Thứ tự trong mỗi hãng: sort theo tên (A3 → A4 → A5).

---

## Database tables

| Bảng | Mô tả |
|------|-------|
| `branches` | `id, slug, name, icon, sort_order` — 3 dòng: giay-in(10), van-phong-pham(20), hang-thai-lan(30) |
| `categories` | `id, slug, name, icon, branch_id, sort_order` — sub-category của từng branch |
| `products` | `id, slug, name, description, images[], price, stock, category(FK→categories.slug), keyword, featured, fb_post_url` |
| `orders` | `id (UUID), customer_name, customer_phone, customer_address, note, total_price, status, created_at` |
| `order_items` | `id (UUID), order_id (UUID FK), product_id, product_name, product_price, quantity` |
| `fb_customers` | `fb_user_id (PK), customer_name, customer_phone, customer_address, updated_at` |

> **Lưu ý:** `orders.id` là **UUID** — `order_items.order_id` phải khai báo `UUID NOT NULL REFERENCES orders(id)`.

### Categories hiện tại

**Giấy In** (branch giay-in, theo hãng + sort_order):
`supreme`(10), `idea`(20), `delight`(30), `projecta-optima`(40), `double-a`(50), `paper-one`(60), `quality`(70), `bia-thai`(80 — Bìa Thái Gold 160gsm từ giay-in/Gold), `giay-in-khac`(999)

**Văn Phòng Phẩm** (branch van-phong-pham, theo hãng):
`thien-long`, `gold`, `plus`, `double-a-vpp`, `vpp-khac`

**Hàng Thái Lan** (branch hang-thai-lan, theo loại SP):
`nuoc-giat`, `bot-giat`, `nuoc-xa-vai`, `nuoc-rua-chen`, `nuoc-lau-san`, `tay-rua`, `sua-tam`, `kem-danh-rang`, `huong-thom`, `hang-thai-khac`

> **Lưu ý folder mapping:** Thêm sản phẩm mới bằng cách đặt ảnh vào đúng folder trong `../san-pham/[branch]/[subfolder]/` rồi chạy lại `node scripts/upload-and-seed.mjs`. Folder names phân biệt hoa/thường — hang-thai-lan dùng ALL CAPS (BỘT GIẶT, NƯỚC GIẶT…).

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

### Storage

- Bucket: `product-images` (public)
- Path: `[branch-slug]/[category-slug]/[product-slug].webp`
- Policy: Public SELECT cho tất cả
- Ảnh được convert từ JPG → WebP (quality=80, max 800px) trước khi upload
- Để thêm sản phẩm mới: đặt ảnh vào `../san-pham/[branch]/[brand]/`, chạy `node scripts/upload-and-seed.mjs`

### Server functions (`src/lib/supabase/server.ts`)

| Function | Mô tả |
|----------|-------|
| `getBranches()` | Trả về branches sắp xếp theo sort_order |
| `getCategories()` | Trả về categories với branch_slug, sắp xếp theo branch_id → sort_order |
| `getProductsFiltered(filter)` | Filter + paginate sản phẩm. Giấy In sort theo categories.sort_order |
| `getProductCounts()` | Đếm sản phẩm theo category slug |
| `getProductBySlug(slug)` | Lấy một sản phẩm |

### Auth (admin panel)

- Dùng Supabase Auth email+password (PKCE flow)
- Tắt public sign-up trong Supabase Dashboard → Authentication → Settings
- Tạo user thủ công: Authentication → Users → Add user → tick "Auto Confirm User"

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
const { items, totalItems, totalPrice, addItem, removeItem, updateQuantity, clearCart } = useCart()
```

### localStorage keys

| Key | Nội dung |
|-----|---------|
| `tvp_cart` | `CartItem[]` |
| `tvp_fb_user_id` | Facebook PSID (lưu khi vào `/gio-hang?fbid=...`) |

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
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # Server-only, dùng cho admin writes + storage upload
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
npm run dev    # dev server (chạy từ web-ban-hang/)
npm run build  # kiểm tra TypeScript + build

# Thêm sản phẩm mới từ ảnh trong ../san-pham/
node scripts/upload-and-seed.mjs   # chạy từ web-ban-hang/
```

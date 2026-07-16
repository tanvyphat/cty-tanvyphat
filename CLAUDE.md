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
    webhook/
      facebook/route.ts            # Facebook webhook (GET verify + POST events)
      sepay/route.ts               # SePay webhook — nhận giao dịch CK, tạo đơn hàng
    orders/route.ts                # POST tạo đơn COD (bank_transfer dùng /api/payments/pending)
    payments/
      pending/route.ts             # POST lưu tạm form+giỏ hàng CK, trả token + QR content
      [token]/route.ts             # GET poll trạng thái thanh toán (waiting/paid/expired)
    shipping/
      fee/route.ts                 # GET tính phí vận chuyển (freeship TP.HCM ≥4tr, còn lại GHTK)
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
    page.tsx                       # Client component — checkout form, phí ship, QR modal
  admin/
    layout.tsx                     # Layout riêng, không có Navbar/Footer
    dang-nhap/page.tsx
    don-hang/page.tsx              # Danh sách đơn + cột Thanh toán (COD / CK ✓ / CK ⏳)
    don-hang/[id]/page.tsx         # Chi tiết đơn + card Thanh toán & Giao hàng
  auth/confirm/route.ts            # PKCE token exchange (password reset)
src/
  data/
    provinces.ts                   # 63 tỉnh/TP + quận/huyện tĩnh, HCMC_DISTRICTS cho freeship
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

| Branch | Slug | Filter sidebar (`ProductFilter`) | Thứ tự tab |
|--------|------|---------------|------------|
| Giấy In | `giay-in` | KÍCH THƯỚC (A4/A3/A5/A3L) + TRỌNG LƯỢNG (70/75/80/100gsm) | 1 |
| Văn Phòng Phẩm | `van-phong-pham` | Không có — chọn category qua `CategoryStrip` (chip icon) | 2 |
| Hàng Tiêu Dùng Thái Lan | `hang-thai-lan` | Không có — chọn category qua `CategoryStrip` (chip icon) | 3 |

> `ProductFilter` (sidebar "Bộ lọc") chỉ hiện khi `branch=giay-in` — các branch khác chọn category qua `CategoryStrip` để tránh trùng UI.

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
| `orders` | `id (UUID), customer_name, customer_phone, customer_address, province, district, note, total_price, shipping_fee, payment_method, payment_status, status, created_at, updated_at` |
| `order_items` | `id (bigint), order_id (UUID FK), product_id, product_name, product_price, quantity` |
| `fb_customers` | `fb_user_id (PK), customer_name, customer_phone, customer_address, updated_at` |
| `pending_payments` | `token (UUID PK), amount, shipping_fee, customer_*, province, district, note, fb_user_id, items (JSONB), status (waiting/paid/expired), order_id (FK), created_at, expires_at` |

> **Lưu ý:** `orders.id` là **UUID** — `order_items.order_id` phải khai báo `UUID NOT NULL REFERENCES orders(id)`.

### Trạng thái đơn hàng (`orders.status`)

| Giá trị | Ý nghĩa |
|---------|---------|
| `moi` | Đơn mới — COD vừa đặt, hoặc CK đã xác nhận thanh toán |
| `dang_xu_ly` | Đang xử lý / đóng gói |
| `da_giao` | Đã giao thành công |
| `huy` | Đã huỷ |

> Không có trạng thái `cho_thanh_toan`. CK chờ TT lưu trong `pending_payments`, chỉ tạo `orders` sau khi SePay webhook xác nhận.

### payment_method / payment_status

| Field | Giá trị |
|-------|---------|
| `payment_method` | `cod` hoặc `bank_transfer` |
| `payment_status` | `pending` (COD chưa thu) hoặc `paid` (CK đã xác nhận) |

### Categories hiện tại

**Giấy In** (branch giay-in, theo hãng + sort_order):
`supreme`(10), `idea`(20), `delight`(30), `projecta-optima`(40), `double-a`(50), `paper-one`(60), `quality`(70), `bia-thai`(80 — Bìa Thái Gold 160gsm từ giay-in/Gold), `giay-in-khac`(999)

**Văn Phòng Phẩm** (branch van-phong-pham, theo hãng):
`thien-long`, `gold`, `plus`, `double-a-vpp`, `vpp-khac`

**Hàng Thái Lan** (branch hang-thai-lan, theo loại SP):
`nuoc-giat`, `bot-giat`, `nuoc-xa-vai`, `nuoc-rua-chen`, `nuoc-lau-san`, `tay-rua`, `sua-tam`, `kem-danh-rang`, `huong-thom`, `hang-thai-khac`

> **Lưu ý folder mapping:** Thêm sản phẩm mới bằng cách đặt ảnh vào đúng folder trong `../san-pham/[branch]/[subfolder]/` rồi chạy lại `node scripts/upload-and-seed.mjs`. Folder names phân biệt hoa/thường — hang-thai-lan dùng ALL CAPS (BỘT GIẶT, NƯỚC GIẶT…).

### Order flow — COD

1. Client POST `/api/orders` với `{ customer_name, customer_phone, customer_address, province, district, shipping_fee, note, fb_user_id, items }`
2. API fetch product info, tính `total_price = subtotal + shipping_fee`, insert `orders` (payment_method=cod) → insert `order_items`
3. Nếu có `fb_user_id`, upsert `fb_customers`
4. Client gọi `clearCart()`, hiện success screen

### Order flow — Chuyển khoản (Bank Transfer)

1. Client POST `/api/payments/pending` với cùng payload → trả `{ token, amount, transfer_content }`
   - `transfer_content` = `TVP` + 8 ký tự hex đầu của token UUID (ví dụ: `TVP4DC0B4F8`)
2. Frontend mở **QR modal** với QR SePay: `https://qr.sepay.vn/img?bank=MB&acc=120926868&template=compact&amount={amount}&des={transfer_content}`
3. Frontend poll `GET /api/payments/{token}` mỗi 3 giây
4. SePay gửi POST webhook `https://tanvyphat.com/api/webhook/sepay` khi nhận tiền
   - Webhook verify header `Authorization: Apikey {SEPAY_WEBHOOK_SECRET}`
   - Tìm `pending_payments` theo token prefix trong nội dung CK
   - Tạo `orders` (payment_method=bank_transfer, payment_status=paid, status=moi) + `order_items`
   - Update `pending_payments.status = paid`
5. Frontend poll nhận `status=paid` → modal chuyển thành công → clearCart()

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
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # Server-only, dùng cho admin writes + storage upload

# Site
NEXT_PUBLIC_SITE_URL=             # URL production, dùng để build cart link

# SePay (thanh toán chuyển khoản)
SEPAY_WEBHOOK_SECRET=             # Từ SePay dashboard → Webhooks → API Key (header: Authorization: Apikey <secret>)
NEXT_PUBLIC_SEPAY_BANK_CODE=MB    # Mã ngân hàng (MB = MBBank)
NEXT_PUBLIC_SEPAY_ACCOUNT=120926868  # Số tài khoản MBBank của công ty

# GHTK (tính phí vận chuyển)
GHTK_API_TOKEN=                   # Từ GHTK → Thông tin tài khoản → Cấu hình API → Token
GHTK_PICK_PROVINCE=TP. Hồ Chí Minh
GHTK_PICK_DISTRICT=Quận 12        # Quận kho hàng shop

# Facebook Webhook
FB_APP_SECRET=           # App → Settings → Basic → App Secret
FB_VERIFY_TOKEN=         # Tự đặt, điền vào webhook setup trên Facebook
FB_PAGE_ACCESS_TOKEN=    # Page Access Token (pages_messaging, pages_manage_metadata, pages_read_engagement)
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

## Thanh toán (Payment)

### 2 phương thức

| Phương thức | Luồng | Route |
|-------------|-------|-------|
| COD (tiền mặt) | Đặt → tạo đơn ngay, status=`moi` | `POST /api/orders` |
| Chuyển khoản | Đặt → lưu tạm → QR → SePay webhook → tạo đơn | `POST /api/payments/pending` |

### SePay Webhooks đã cấu hình

| Tên | URL | Dùng cho |
|-----|-----|---------|
| Xác thực thanh toán web | `https://tanvyphat.com/api/webhook/sepay` | Production |
| Xác thực thanh toán web dev | `https://chitinoid-funiculate-dakota.ngrok-free.dev/api/webhook/sepay` | Local dev (ngrok) |

- Bảo mật: **API Key** — header `Authorization: Apikey {SEPAY_WEBHOOK_SECRET}`
- `SEPAY_WEBHOOK_SECRET` = `4dc0b4f8-4e66-478e-9e3b-c2cf7deefac9`
- Ngân hàng: **MBBank**, STK: **120926868** (CTY TNHH MTV SX TM TAN VY PHAT)

### QR SePay

```
https://qr.sepay.vn/img?bank=MB&acc=120926868&template=compact&amount={amount}&des={transfer_content}
```

`transfer_content` = `TVP` + 8 ký tự hex đầu của `pending_payments.token` (uppercase, bỏ dấu `-`)

---

## Phí vận chuyển

### Logic tính phí (`app/api/shipping/fee/route.ts`)

1. **Freeship**: province_code=`79` (TP.HCM) + district trong `HCMC_DISTRICTS` + total ≥ 4,000,000đ → `{ fee: 0, freeship: true }`
2. **GHTK API**: gọi `services.giaohangtietkiem.vn/services/shipment/fee` với token — lấy phí, không tạo đơn
3. **Fallback**: nếu GHTK_API_TOKEN chưa có hoặc lỗi → `{ fee: 0, unavailable: true }` — UI hiện "Liên hệ shop"

### Dữ liệu tỉnh/quận (`src/data/provinces.ts`)

- 63 tỉnh/TP với province code (TP.HCM = `79`)
- Quận/huyện cho các tỉnh phổ biến (TP.HCM đầy đủ 22 đơn vị)
- `HCMC_DISTRICTS` — Set tên quận/huyện TP.HCM để check freeship

### Checkout form (`app/thanh-toan/page.tsx`)

- Dropdown **Tỉnh/TP** → Dropdown **Quận/Huyện** (cascade) → textarea địa chỉ chi tiết
- Khi thay đổi địa chỉ → debounce gọi `/api/shipping/fee` → hiện phí (MIỄN PHÍ / giá / Liên hệ shop)
- TỔNG = subtotal sản phẩm + phí ship

---

## Lệnh thường dùng

```bash
npm run dev    # dev server (chạy từ web-ban-hang/)
npm run build  # kiểm tra TypeScript + build

# Thêm sản phẩm mới từ ảnh trong ../san-pham/
node scripts/upload-and-seed.mjs   # chạy từ web-ban-hang/
```

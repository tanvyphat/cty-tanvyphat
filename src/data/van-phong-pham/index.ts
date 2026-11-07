/**
 * Nhánh sản phẩm: VĂN PHÒNG PHẨM
 * Công ty CT Tân Vy Phát — Chuyên Phân Phối Giấy In & Văn Phòng Phẩm Giá Rẻ
 * Facebook: https://www.facebook.com/profile.php?id=100023082080173
 *
 * Nguồn dữ liệu: ~77 bài đăng Facebook (tháng 12/2025 – 3/2026)
 */

export const BRANCH_VPP = {
  slug: 'van-phong-pham',
  name: 'Văn Phòng Phẩm',
  shortName: 'VPP',
  tagline: 'Chuyên Phân Phối Giấy In & Văn Phòng Phẩm Giá Sỉ',
  description:
    'Cung cấp giấy in A4, bìa, decal, nhựa ép, tập vở và văn phòng phẩm các loại. ' +
    'Hàng nhập trực tiếp từ nhà sản xuất — không qua trung gian. ' +
    'Giao nội thành TP.HCM; khu vực khác theo thỏa thuận và khách chịu phí vận chuyển, nhận đơn sỉ số lượng lớn.',
  facebook: 'https://www.facebook.com/profile.php?id=100023082080173',
  phone: '0903608768',
  icon: '📋',
}

/**
 * Danh mục con của nhánh Văn Phòng Phẩm
 * branch = 'van-phong-pham' trong bảng categories (Supabase)
 */
export const categoriesVPP = [
  {
    slug: 'giay-in',
    name: 'Giấy In',
    icon: '📄',
    description: 'Giấy in A4 chính hãng, giá sỉ tận kho',
    brands: ['Double A', 'Supreme', 'Projecta (Nga)', 'Idea Max 70G', 'IK Plus', 'Smartist', 'Paper One'],
    notes:
      'Đủ định lượng DL70 & DL80. Giấy trắng đẹp, không kẹt giấy, phù hợp mọi loại máy in. ' +
      'Tuyển nhà phân phối toàn quốc.',
  },
  {
    slug: 'bia-decal',
    name: 'Bìa & Decal',
    icon: '🗂️',
    description: 'Bìa Thái các màu, giấy decal, bìa lá PP Holder',
    brands: ['Bìa Thái Vàng Chanh A4', 'Giấy Decal Xanh / Vàng / Da Bò', 'Bìa Lá PP Holder Gold A4 (50 cái/bịch)'],
    notes: 'Hàng đẹp – dày – chuẩn màu. Keo dính tốt, bám chắc (giấy decal).',
  },
  {
    slug: 'nhua-ep',
    name: 'Nhựa Ép & Laminating',
    icon: '🗃️',
    description: 'Nhựa ép dẻo 80 mic A4 / A3 / A5',
    brands: ['Yidu Sails Laminating (2×80 micron, 220×310mm)'],
    notes: 'Chuẩn kích thước, trong suốt đẹp. Dùng cho hồ sơ, thẻ, ảnh, tài liệu.',
  },
  {
    slug: 'tap-vo',
    name: 'Tập Vở',
    icon: '📓',
    description: 'Tập vở học sinh các định lượng, giá sỉ',
    brands: ['Tập học sinh (đủ định lượng)'],
    notes: 'Cung cấp sỉ cho nhà sách, cửa hàng văn phòng phẩm, trường học.',
  },
  {
    slug: 'van-phong-pham',
    name: 'Văn Phòng Phẩm',
    icon: '✏️',
    description: 'Thiên Long, kẹp bướm, bút bi, ghim bấm và phụ kiện văn phòng',
    brands: ['Thiên Long Group', 'Echo Binder Clip Gold (kẹp bướm)'],
    notes:
      'Chiết khấu cao cho đại lý. Đủ thuế VAT. ' +
      'Sản phẩm Thiên Long: bút bi, bút gel, ghim, kẹp tài liệu...',
  },
]

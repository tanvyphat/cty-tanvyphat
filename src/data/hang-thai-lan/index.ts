/**
 * Nhánh sản phẩm: HÀNG TIÊU DÙNG THÁI LAN
 * LanVy Shop — Chuyên cung cấp Hàng Tiêu Dùng Thái Lan
 * Facebook: https://www.facebook.com/lanvyshop828
 * TikTok: Lanvy Shop - ThailandGoods
 *
 * Nguồn dữ liệu: ~75 bài đăng Facebook (tháng 1 – 4/2026)
 */

export const BRANCH_THAI = {
  slug: 'hang-thai-lan',
  name: 'Hàng Tiêu Dùng Thái Lan',
  shortName: 'Hàng Thái',
  tagline: 'Hàng Nhập Khẩu Chính Ngạch – Thuế VAT Đầy Đủ',
  description:
    'Chuyên cung cấp hàng tiêu dùng Thái Lan nhập khẩu chính ngạch: ' +
    'nước giặt, nước xả vải, vệ sinh nhà cửa, chăm sóc cá nhân, sản phẩm cho bé, ' +
    'hương thơm và thực phẩm. Ưu tiên bán sỉ tại TP.HCM; ngoài khu vực theo thỏa thuận.',
  facebook: 'https://www.facebook.com/lanvyshop828',
  tiktok: 'https://www.tiktok.com/@lanvyshop828',
  phone: '0906892828',
  icon: '🇹🇭',
}

/**
 * Danh mục con của nhánh Hàng Tiêu Dùng Thái Lan
 * branch = 'hang-thai-lan' trong bảng categories (Supabase)
 */
export const categoriesThai = [
  {
    slug: 'nuoc-giat',
    name: 'Nước Giặt',
    icon: '🧺',
    description: 'Nước giặt đậm đặc Thái Lan, thơm lâu, sạch sâu',
    brands: [
      'Hygiene (3L, túi đậm đặc)',
      'Haby Ultra Wash (can 3.8kg)',
      'Mẹ Chọn (3000ml / 3kg)',
      'PAO (can 3L, túi 3kg, bột 5kg)',
      'Essence (3500ml)',
      'FineLine (đủ mẫu, màu)',
    ],
    notes:
      'Hàng sản xuất tại Thái Lan, nhập khẩu chính ngạch có VAT. ' +
      'Bán sỉ số lượng lớn, chiết khấu hấp dẫn cho đại lý. ' +
      'Mặt hàng chủ lực, đăng bán thường xuyên nhất.',
  },
  {
    slug: 'nuoc-xa-vai',
    name: 'Nước Xả Vải',
    icon: '🫧',
    description: 'Nước xả vải đậm đặc Thái Lan, mềm mại, thơm lâu',
    brands: [
      'Hygiene (túi 3.5L / 1100ml đậm đặc)',
      'Haby (2L đậm đặc)',
    ],
    notes: 'Đủ màu sắc, mùi hương. Hàng sẵn kho giao liền tay.',
  },
  {
    slug: 've-sinh-nha-cua',
    name: 'Vệ Sinh Nhà Cửa',
    icon: '🏠',
    description: 'Nước lau sàn, nước tẩy rửa Thái Lan chất lượng cao',
    brands: [
      'Hygiene (nước lau sàn 3D – thơm như nước hoa)',
      'XCleen (nước lau sàn 1L)',
    ],
    notes: 'Sản xuất tại Thái Lan. Lau sạch, thơm lâu, an toàn cho gia đình.',
  },
  {
    slug: 'cham-soc-ca-nhan',
    name: 'Chăm Sóc Cá Nhân',
    icon: '🧴',
    description: 'Kem đánh răng, sữa tắm nhập khẩu Thái Lan',
    brands: [
      'Fresh & White (kem đánh răng 160g)',
      'Amoré (sữa tắm – hương nước hoa sang trọng)',
    ],
    notes: 'Da mềm mịn sau mỗi lần tắm. Thương hiệu uy tín từ Thái Lan.',
  },
  {
    slug: 'san-pham-cho-be',
    name: 'Sản Phẩm Cho Bé',
    icon: '👶',
    description: 'Sản phẩm chăm sóc bé dịu nhẹ, an toàn từ Thái Lan',
    brands: [
      'D-nee Organic (dầu gội, sữa tắm, kem dưỡng cho bé)',
      'Kodomo (kem đánh răng trẻ em)',
    ],
    notes:
      'Chiết xuất hữu cơ, không gây kích ứng. ' +
      'D-nee Organic là thương hiệu số 1 Thái Lan cho chăm sóc bé.',
  },
  {
    slug: 'huong-thom',
    name: 'Hương Thơm',
    icon: '🌸',
    description: 'Túi thơm, xịt phòng, sáp thơm Thái Lan',
    brands: [
      'Hygiene (túi thơm quần áo)',
      'Aumira (xịt phòng & sáp thơm)',
    ],
    notes: 'Thơm dịu, kéo dài. Dùng cho tủ quần áo, phòng ngủ, xe hơi.',
  },
  {
    slug: 'thuc-pham-do-uong',
    name: 'Thực Phẩm & Đồ Uống',
    icon: '🥤',
    description: 'Thực phẩm, đồ uống nhập khẩu từ Thái Lan',
    brands: [
      'Sương sáo lon (mát lạnh tiện lợi)',
    ],
    notes: 'Hàng Thái chính hãng, nhập khẩu chính ngạch. Bổ sung thêm mặt hàng thường xuyên.',
  },
]

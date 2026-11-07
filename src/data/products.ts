export type Product = {
  slug: string
  name: string
  category: string
  description: string
  images: string[]
  fbPostUrl?: string
  featured?: boolean
}

export const products: Product[] = [
  {
    slug: 'bia-thai-vang-chanh',
    name: 'Bìa Thái Vàng Chanh A4',
    category: 'bia-decal',
    featured: true,
    images: [
      'https://scontent.fsgn5-6.fna.fbcdn.net/v/t39.30808-6/651880932_2154942661951782_6924016421855615184_n.jpg?stp=dst-jpg_p526x296_tt6&_nc_cat=102&ccb=1-7&_nc_sid=13d280&_nc_ohc=UmS5RzbhFuQQ7kNvwEwdbG0&_nc_oc=AdpwL2RbV5zmwTR7FPP-5RNrlaAXwD0vfpVo_1xRdF0tBUQ8yzQ82_dZQhWk8Q3lorY&_nc_zt=23&_nc_ht=scontent.fsgn5-6.fna&_nc_gid=naiqzT8BWYZO1_B7iayKnw&_nc_ss=7a30f&oh=00_AfzIzL5J7t0E0xFjZaGAL33ZQfm5XFmLZV9tEmqZ26GAlg&oe=69C2640D',
    ],
    description:
      'BÌA THÁI VÀNG CHANH A4 – GIÁ SỈ CỰC TỐT | HÀNG ĐẸP – DÀY – CHUẨN MÀU. Sản phẩm chất lượng cao, màu sắc tươi sáng, độ bền tốt. Phù hợp đóng bìa hồ sơ, tài liệu văn phòng. Liên hệ để được báo giá sỉ tốt nhất.',
  },
  {
    slug: 'giay-decal-xanh-vang-da-bo',
    name: 'Giấy Decal Xanh – Vàng – Da Bò',
    category: 'bia-decal',
    featured: true,
    images: [
      'https://scontent.fsgn5-13.fna.fbcdn.net/v/t39.30808-6/648229685_2145654846213897_7279594487552405589_n.jpg?stp=dst-jpg_s960x960_tt6&_nc_cat=101&ccb=1-7&_nc_sid=7b2446&_nc_ohc=yFnkdFL-PKgQ7kNvwFW-udE&_nc_oc=AdrsYP1DZkf4lIHr3uID-RKYmHjJ6EPuFnA2d4pANUW4fSrwRiDq67gSdZEUjg4iBR8&_nc_zt=23&_nc_ht=scontent.fsgn5-13.fna&_nc_gid=vmDiBvfX1MkbsbLdG2vYEQ&_nc_ss=7a30f&oh=00_AfyLUfTeCWIUcouG2CB5l0hrvbxPy_WSsUCjlpgWQHxgKQ&oe=69C25F00',
    ],
    description:
      'GIẤY DECAN XANH – VÀNG – DA BÒ. Hàng đẹp – keo dính tốt – bám chắc. Nhiều màu sắc đa dạng, phù hợp cho in ấn, dán nhãn, trang trí. Giá sỉ cạnh tranh.',
  },
  {
    slug: 'thien-long-group',
    name: 'Văn Phòng Phẩm Thiên Long',
    category: 'van-phong-pham',
    featured: true,
    images: [
      'https://scontent.fsgn5-6.fna.fbcdn.net/v/t39.30808-6/646970549_2145654646213917_1948164280287200167_n.jpg?stp=dst-jpg_s960x960_tt6&_nc_cat=103&ccb=1-7&_nc_sid=7b2446&_nc_ohc=GeN9_rQZ4o4Q7kNvwFMQVbJ&_nc_oc=Adq9O5oHUFItIK_KJvdkN-od1rTUC47TDg1-QFO0Rz8V9B-8TqGbxTUl2Xcy0xjMX4M&_nc_zt=23&_nc_ht=scontent.fsgn5-6.fna&_nc_gid=8jz8oXBud3SM0XnjAE6osw&_nc_ss=7a30f&oh=00_Afx1Y4X9xQrVFYfM9Aw96pSRjHyIT5MRYzJqsjTRY71o3Q&oe=69C24FAD',
    ],
    description:
      'CUNG CẤP SỈ CÁC MẶT HÀNG Thiên Long Group – CHIẾT KHẤU CAO HẤP DẪN. Bút bi, bút mực, kẹp bướm, ghim bấm, dập ghim và nhiều dụng cụ văn phòng khác từ thương hiệu uy tín Thiên Long.',
  },
  {
    slug: 'giay-in-tan-vy-phat',
    name: 'Giấy In A4 Các Loại',
    category: 'giay-in',
    featured: true,
    images: [
      'https://scontent.fsgn5-13.fna.fbcdn.net/v/t39.30808-6/649073019_2149013802544668_4784281595383273883_n.jpg?stp=dst-jpg_p526x296_tt6&_nc_cat=107&ccb=1-7&_nc_sid=13d280&_nc_ohc=b1kpI9lFEbkQ7kNvwHyuPxK&_nc_oc=Adp6fGx7dq_7opWwzd244UaPVWemRnHrjV6lRriSHEI-R5ehpvn2IEAoYtBtEMbLF-s&_nc_zt=23&_nc_ht=scontent.fsgn5-13.fna&_nc_gid=LE_syUsG124O3DEhxud5TQ&_nc_ss=7a30f&oh=00_AfzHDEjeYjp25vDv4fkN3e0ufKo80hUtEYFSInXurVYZyw&oe=69C24FBE',
    ],
    description:
      'TÂN VY PHÁT – CHUYÊN CUNG CẤP GIẤY IN & VĂN PHÒNG PHẨM GIÁ SỈ TẠI TP.HCM. Giấy in A4 hàng sẵn kho giao liền tay. Đủ loại: Double A, Projecta, Supreme, Idea Max và nhiều nhãn hiệu khác.',
  },
  {
    slug: 'tap-vo-hoa-binh',
    name: 'Tập Vở Học Sinh Hòa Bình',
    category: 'tap-vo',
    images: [],
    description:
      'Tập đủ định lượng - Hòa Bình, Tân Tiến, Thuận Hưng. Giá sỉ cực tốt cho các đại lý, tiệm tạp hóa, nhà sách. Nhiều định lượng: 48 trang, 96 trang, 200 trang.',
  },
  {
    slug: 'nhua-ep-deo-80-mic',
    name: 'Nhựa Ép Dẻo 80 Mic A4/A3/A5',
    category: 'nhua-ep',
    featured: true,
    images: [],
    description:
      'NHỰA ÉP DẺO 80 MIC – CHUẨN A4, A3, A5. Hàng chất lượng cao, trong suốt, bền đẹp. Phù hợp cho máy ép nhiệt văn phòng. Giá sỉ hấp dẫn, giao nội thành TP.HCM.',
  },
  {
    slug: 'giay-nga-dl-80',
    name: 'Giấy Nga DL 80',
    category: 'giay-in',
    images: [],
    description:
      'Giấy Nga DL 80 đã về hàng! Giấy nhập khẩu chất lượng cao, độ trắng sáng, in đẹp. Định lượng 80g/m². Liên hệ để được báo giá sỉ tốt nhất.',
  },
  {
    slug: 'giay-chau-au',
    name: 'Giấy Nhập Khẩu Châu Âu',
    category: 'giay-in',
    images: [],
    description:
      'GIẤY NHẬP KHẨU CHÂU ÂU (ĐL 70-80). Alo là có giá tốt – Xăng lên nhưng giá ổn định. Chất lượng châu Âu chuẩn mực, độ trắng cao, chạy máy tốt.',
  },
  {
    slug: 'giay-double-a',
    name: 'Giấy Double A A4',
    category: 'giay-in',
    featured: true,
    images: [],
    description:
      'Giấy Double A A4 80g – thương hiệu số 1 Thái Lan. Hàng chính hãng, đủ ream, in không kẹt giấy. Phù hợp cho mọi loại máy in laser và phun mực.',
  },
  {
    slug: 'giay-projecta-ultra',
    name: 'Giấy Projecta Ultra/Optima',
    category: 'giay-in',
    images: [],
    description:
      'Giấy Projecta Ultra và Optima – dòng giấy cao cấp cho văn phòng. Độ trắng chuẩn ISO, bề mặt mịn, in sắc nét. Giá sỉ cạnh tranh nhất thị trường TPHCM.',
  },
  {
    slug: 'bia-thai-xanh-da-bo',
    name: 'Bìa Thái Xanh & Da Bò A4',
    category: 'bia-decal',
    images: [],
    description:
      'Bìa Thái nhiều màu: xanh dương, xanh lá, da bò. Chất liệu dày dặn, cứng cáp. Phù hợp đóng hồ sơ, luận văn, tài liệu quan trọng.',
  },
  {
    slug: 'giay-supreme',
    name: 'Giấy Supreme A4',
    category: 'giay-in',
    images: [],
    description:
      'Giấy Supreme A4 80g – lựa chọn kinh tế cho văn phòng. Chất lượng ổn định, giá tốt cho đơn sỉ lớn. Giao nội thành TP.HCM; khu vực khác liên hệ thỏa thuận phí vận chuyển.',
  },
  {
    slug: 'giay-idea-max',
    name: 'Giấy Idea Max A4',
    category: 'giay-in',
    images: [],
    description:
      'Giấy Idea và Idea Max A4 – dòng giấy phổ thông chất lượng tốt. Độ trắng 92%, in không nhòe, giá ưu đãi cho đại lý và CTV.',
  },
  {
    slug: 'kep-buom-van-phong',
    name: 'Kẹp Bướm Các Loại',
    category: 'van-phong-pham',
    images: [],
    description:
      'Kẹp bướm văn phòng các cỡ: 15mm, 19mm, 25mm, 32mm, 41mm, 51mm. Hàng chất lượng, kẹp chắc, không gỉ sét. Bán sỉ giá tốt.',
  },
  {
    slug: 'tap-vo-tan-tien',
    name: 'Tập Vở Tân Tiến',
    category: 'tap-vo',
    images: [],
    description:
      'Tập vở học sinh Tân Tiến đủ loại định lượng. Giấy trắng, kẻ đẹp, bìa cứng. Phù hợp bán lẻ và bán sỉ cho trường học, văn phòng phẩm.',
  },
  {
    slug: 'bia-mau-a4',
    name: 'Bìa Màu A4 Nhiều Màu',
    category: 'bia-decal',
    images: [],
    description:
      'Bìa màu A4 đủ màu sắc tươi sáng. Chất liệu giấy dày 180g-230g. Dùng in ấn, đóng bìa, trang trí. Có bán lẻ và bán sỉ với giá ưu đãi.',
  },
  {
    slug: 'nhua-ep-a3',
    name: 'Nhựa Ép Laminating A3',
    category: 'nhua-ep',
    images: [],
    description:
      'Nhựa ép Laminating khổ A3 80 mic. Trong suốt, bóng đẹp, bảo vệ tài liệu hiệu quả. Phù hợp cho shop in ấn, văn phòng, trường học.',
  },
  {
    slug: 'but-bi-thien-long',
    name: 'Bút Bi Thiên Long',
    category: 'van-phong-pham',
    images: [],
    description:
      'Bút bi Thiên Long các loại: TL-023, TL-027, Flex. Mực đều, trơn tay, bền đẹp. Nhập sỉ số lượng lớn giá ưu đãi, chiết khấu hấp dẫn cho đại lý.',
  },
]

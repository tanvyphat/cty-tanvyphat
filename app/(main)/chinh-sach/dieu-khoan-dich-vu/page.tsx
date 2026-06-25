import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Điều Khoản Dịch Vụ | Tân Vy Phát',
    description: 'Các điều khoản và điều kiện khi sử dụng dịch vụ và mua sắm tại hệ thống Tân Vy Phát.',
};

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 sm:p-12">

                    {/* Tiêu đề trang */}
                    {}
                    <div className="border-b border-gray-200 pb-6 mb-8 text-center sm:text-left">
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
                            Điều Khoản Dịch Vụ
                        </h1>
                        <p className="mt-3 text-sm text-gray-500">
                            Cập nhật lần cuối: <span className="font-semibold text-gray-700">25/6/2026</span>
                        </p>
                    </div>

                    {/* Khối nội dung bài viết */}
                    {}
                    <div className="text-gray-600 leading-relaxed space-y-6 text-base">
                        <p>
                            Chào mừng quý khách đến với website của <strong>Tân Vy Phát</strong>.
                            Vui lòng đọc kỹ các Điều khoản Dịch vụ này trước khi sử dụng website hoặc thực hiện bất kỳ giao dịch mua bán nào. Khi quý khách truy cập, duyệt, hoặc sử dụng trang web của chúng tôi, đồng nghĩa với việc quý khách đã đọc, hiểu và đồng ý bị ràng buộc bởi các điều khoản này.
                        </p>
                        <p>
                            Trang web có quyền thay đổi, chỉnh sửa, thêm hoặc lược bỏ bất kỳ phần nào trong Điều khoản mua bán hàng hóa này vào bất cứ lúc nào. Các thay đổi có hiệu lực ngay khi được đăng trên trang web mà không cần thông báo trước.
                        </p>

                        {}
                        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">1. Định nghĩa</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>"Chúng tôi", "Tân Vy Phát":</strong> Chỉ Công ty TNHH Tân Vy Phát, đơn vị chủ quản của website tanvyphat.com.</li>
                            <li><strong>"Quý khách", "Khách hàng", "Người dùng":</strong> Chỉ các cá nhân, tổ chức truy cập, sử dụng dịch vụ hoặc mua sắm trên website.</li>
                            <li><strong>"Sản phẩm", "Hàng hóa":</strong> Chỉ các mặt hàng văn phòng phẩm, hàng tiêu dùng Thái Lan, và các sản phẩm khác được bày bán trên website.</li>
                        </ul>

                        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">2. Điều kiện sử dụng website</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Người dùng phải đủ 18 tuổi, hoặc truy cập dưới sự giám sát của cha mẹ hoặc người đại diện hợp pháp. Đảm bảo có đầy đủ năng lực hành vi dân sự để thực hiện các giao dịch mua bán theo quy định của pháp luật Việt Nam.</li>
                            <li>Khi đăng ký tài khoản, quý khách phải cung cấp thông tin xác thực, đầy đủ và cập nhật. Quý khách tự chịu trách nhiệm bảo mật thông tin đăng nhập của mình.</li>
                            <li>Nghiêm cấm mọi hành vi sử dụng trang web với mục đích lừa đảo, phát tán mã độc, vi phạm bản quyền, hoặc gây tổn hại đến hệ thống máy chủ và uy tín của Tân Vy Phát.</li>
                        </ul>

                        {}
                        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">3. Thông tin Sản phẩm và Giá cả</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Chúng tôi luôn nỗ lực để cung cấp thông tin, hình ảnh và giá cả sản phẩm một cách chính xác nhất. Tuy nhiên, sai sót hệ thống có thể xảy ra. Trong trường hợp giá hoặc thông tin bị lỗi, chúng tôi có quyền từ chối hoặc hủy đơn hàng và sẽ thông báo ngay cho quý khách.</li>
                            <li>Giá sản phẩm được niêm yết trên website là giá bán cuối cùng, có thể thay đổi tùy thời điểm mà không cần báo trước.</li>
                            <li>Màu sắc thực tế của sản phẩm có thể chênh lệch đôi chút so với hình ảnh trên website do điều kiện ánh sáng hoặc độ phân giải màn hình.</li>
                        </ul>

                        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">4. Chấp nhận, Hủy đơn và Vận chuyển</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Tân Vy Phát có quyền từ chối hoặc hủy bỏ đơn hàng do hết hàng, lỗi hệ thống, hoặc không thể xác minh thông tin nhận hàng. Nếu đã thanh toán, chúng tôi sẽ hoàn tiền theo quy định.</li>
                            <li>Quý khách có thể yêu cầu hủy đơn hàng trước khi đơn hàng chuyển sang trạng thái "Đang giao".</li>
                            <li>Thời gian giao hàng dự kiến sẽ được thông báo cụ thể. Rủi ro về mất mát hoặc hư hỏng hàng hóa sẽ được chuyển giao cho quý khách kể từ thời điểm ký nhận hàng. Vui lòng kiểm tra kỹ gói hàng trước khi nhận.</li>
                        </ul>

                        {}
                        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">5. Trách nhiệm pháp lý và Sở hữu trí tuệ</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Toàn bộ thiết kế, văn bản, đồ họa, hình ảnh, mã nguồn và nội dung trên website đều là tài sản thuộc sở hữu độc quyền của Tân Vy Phát, được bảo hộ bởi luật pháp Việt Nam.</li>
                            <li>Mọi tranh chấp phát sinh từ giao dịch tại website sẽ được ưu tiên giải quyết thông qua thương lượng. Nếu không thành, tranh chấp sẽ được đưa ra Tòa án có thẩm quyền tại Việt Nam.</li>
                        </ul>

                        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">6. Thông tin liên hệ</h2>
                        <p>Mọi thắc mắc liên quan đến tính bảo mật, đơn hàng và tài khoản, vui lòng liên hệ bộ phận CSKH:</p>

                        {}
                        <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 mt-4 text-gray-800 text-sm sm:text-base">
                            <p className="mb-2"><strong>Website:</strong> <Link href="/" className="text-blue-600 hover:underline">tanvyphat.com</Link></p>
                            <p className="mb-2"><strong>Email:</strong> <a href="mailto:Tanvyphatpaper@gmail.com?subject=Thắc Mắc Về Điều Khoản Dịch Vụ">Tanvyphatpaper@gmail.com</a> </p>
                            <p className="mb-2"><strong>Hotline:</strong> <a href="tel:0931868158">0931868158</a> </p>
                            <p><strong>Địa chỉ:</strong> Thành phố Hồ Chí Minh, Việt Nam</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
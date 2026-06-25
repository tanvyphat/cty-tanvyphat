import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Chính Sách Bảo Mật',
    description: 'Chính sách bảo mật thông tin và dữ liệu người dùng tại hệ thống Tân Vy Phát.',
};

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 sm:p-12">

                    {/* Tiêu đề trang */}
                    <div className="border-b border-gray-200 pb-6 mb-8 text-center sm:text-left">
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
                            Chính Sách Bảo Mật
                        </h1>
                        <p className="mt-3 text-sm text-gray-500">
                            Cập nhật lần cuối: <span className="font-semibold text-gray-700">25/6/2026</span>
                        </p>
                    </div>

                    {/* Khối nội dung bài viết */}
                    <div className="text-gray-600 leading-relaxed space-y-6 text-base">
                        <p>
                            Chào mừng quý khách đến với website của <strong>Tân Vy Phát</strong>.
                            Chính sách bảo mật này giải thích minh bạch cách hệ thống của chúng tôi thu thập, quản lý và bảo vệ dữ liệu cá nhân của bạn thông qua quá trình mua sắm, quản lý đơn hàng và sử dụng tính năng đăng nhập tự động.
                        </p>

                        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">1. Thông tin chúng tôi thu thập</h2>
                        <p>Từ quá trình bạn trải nghiệm hệ thống, chúng tôi thu thập các nhóm dữ liệu sau:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Thông tin định danh và giao hàng:</strong> Bao gồm Họ tên, Số điện thoại, Địa chỉ chi tiết (Tỉnh/Thành phố, Quận/Huyện) và các ghi chú cá nhân khi bạn thiết lập Hồ sơ hoặc Đặt hàng trực tuyến.</li>
                            <li><strong>Dữ liệu Đăng nhập qua Bên thứ 3 (Google):</strong> Khi bạn sử dụng tính năng Đăng nhập bằng Google, chúng tôi nhận và lưu trữ ID người dùng (Google ID), họ tên và email nhằm mục đích khởi tạo và đồng bộ tài khoản an toàn.</li>
                            <li><strong>Dữ liệu Giỏ hàng & Phiên hoạt động:</strong> Hệ thống sử dụng mã định danh an toàn (Tokens UUID) để lưu lại các phiên giỏ hàng (Cart Sessions) và các phiên thanh toán đang chờ xử lý (Pending Payments).</li>
                            <li><strong>Thông tin Giao dịch:</strong> Phương thức thanh toán bạn chọn và dữ liệu giao dịch ngân hàng khi sử dụng phương thức chuyển khoản tự động.</li>
                        </ul>

                        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">2. Mục đích sử dụng dữ liệu</h2>
                        <p>Hệ thống Tân Vy Phát xử lý thông tin của bạn để tự động hóa các quy trình sau:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Vận hành Đơn hàng:</strong> Tạo mã đơn hàng duy nhất, tính toán tự động phí vận chuyển dựa trên khu vực địa lý, và theo dõi sát sao trạng thái đơn hàng (Mới, Đang xử lý, Đã giao, Hủy).</li>
                            <li><strong>Xác thực Thanh toán Tự động:</strong> Thông qua webhook bảo mật với Sepay, chúng tôi đối soát thông tin chuyển khoản của bạn với mã đơn hàng để tự động xác nhận thanh toán thành công mà không cần can thiệp thủ công.</li>
                            <li><strong>Trải nghiệm liền mạch & Cá nhân hóa:</strong> Đồng bộ lịch sử đơn hàng giữa các thiết bị, lưu trữ giỏ hàng chưa hoàn tất và tự động điền thông tin cho những lần giao hàng sau.</li>
                        </ul>

                        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">3. Chia sẻ thông tin và Bảo mật</h2>
                        <p>Chúng tôi <strong>cam kết tuyệt đối không bán</strong> dữ liệu của bạn. Việc chia sẻ thông tin được kiểm soát nghiêm ngặt và chỉ dành cho:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Đối tác vận chuyển:</strong> Chỉ chia sẻ Tên, Số điện thoại và Địa chỉ để thực hiện tính phí ship và giao nhận hàng hóa.</li>
                            <li><strong>Đối tác thanh toán (Sepay & Ngân hàng):</strong> Trao đổi mã giao dịch và số tiền để hệ thống xác nhận thanh toán.</li>
                            <li><strong>Nền tảng xác thực (Google/Meta/Supabase):</strong> Quản lý luồng đăng nhập và mã hóa thông tin của bạn bằng các giao thức bảo mật tiên tiến nhất hiện nay.</li>
                        </ul>

                        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">4. Quyền kiểm soát của bạn</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Bạn có toàn quyền truy cập trang Quản lý tài khoản để thay đổi/cập nhật Tên, Số điện thoại, Địa chỉ nhận hàng bất kỳ lúc nào.</li>
                            <li>Bạn có thể thu hồi quyền truy cập của website đối với tài khoản Google của bạn trực tiếp từ cài đặt bảo mật của Google.</li>
                            <li>Bạn có quyền yêu cầu xóa bỏ hoàn toàn thông tin tài khoản và lịch sử giao dịch thông qua chức năng <Link href="/chinh-sach/chinh-sach-xoa-du-lieu" className="text-blue-600 hover:underline">Yêu cầu xóa dữ liệu</Link> của chúng tôi.</li>
                        </ul>

                        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">5. Thông tin liên hệ</h2>
                        <p>Mọi thắc mắc liên quan đến tính bảo mật, đơn hàng và tài khoản, vui lòng liên hệ bộ phận CSKH:</p>
                        <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 mt-4 text-gray-800 text-sm sm:text-base">
                            <p className="mb-2"><strong>Website:</strong> <Link href="/" className="text-blue-600 hover:underline">tanvyphat.com</Link></p>
                            <p className="mb-2"><strong>Email:</strong> <a href="mailto:Tanvyphatpaper@gmail.com?subject=Thắc Mắc Về Bảo Mật Website">Tanvyphatpaper@gmail.com</a> </p>
                            <p className="mb-2"><strong>Hotline:</strong> <a href="tel:0931868158">0931868158</a> </p>
                            <p><strong>Địa chỉ:</strong> Thành phố Hồ Chí Minh, Việt Nam</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
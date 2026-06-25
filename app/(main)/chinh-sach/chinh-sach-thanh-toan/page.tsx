import React from 'react';
import { Metadata } from 'next';
import Link from "next/link";

export const metadata: Metadata = {
    title: 'Chính Sách Thanh Toán | Tân Vy Phát',
    description: 'Các phương thức thanh toán an toàn và tiện lợi (Ship COD, Chuyển khoản tự động SEPAY) tại hệ thống Tân Vy Phát.',
};

export default function PaymentPolicyPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 sm:p-12">

                    {/* Tiêu đề trang */}
                    <div className="border-b border-gray-200 pb-6 mb-8 text-center sm:text-left">
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
                            Chính Sách Thanh Toán
                        </h1>
                        <p className="mt-3 text-sm text-gray-500">
                            Cập nhật lần cuối: <span className="font-semibold text-gray-700">25/6/2026</span>
                        </p>
                    </div>

                    {/* Khối nội dung bài viết */}
                    <div className="text-gray-600 leading-relaxed space-y-6 text-base">
                        <p>
                            Tại <strong>Tân Vy Phát</strong>, chúng tôi luôn nỗ lực mang đến trải nghiệm mua sắm trực tuyến không chỉ nhanh chóng mà còn an toàn tuyệt đối. Để tạo sự thuận tiện tối đa cho quý khách hàng trong quá trình giao dịch, hệ thống của chúng tôi hiện đang áp dụng <strong>02 phương thức thanh toán chính</strong> được tích hợp công nghệ tự động hóa hiện đại.
                        </p>

                        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">1. Thanh toán khi nhận hàng (Ship COD)</h2>
                        <p>
                            Đây là phương thức thanh toán truyền thống và an toàn nhất dành cho khách hàng muốn tận tay kiểm tra sản phẩm trước khi trả tiền.
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Quy trình:</strong> Khách hàng đặt hàng trên website và chọn phương thức "Thanh toán khi nhận hàng (COD)". Nhân viên giao hàng sẽ liên hệ và giao bưu kiện đến tận địa chỉ của quý khách.</li>
                            <li><strong>Đồng kiểm hàng:</strong> Quý khách được quyền kiểm tra tình trạng ngoại quan của gói hàng. Sau khi xác nhận đơn hàng đúng và nguyên vẹn, quý khách vui lòng thanh toán <strong>toàn bộ giá trị đơn hàng</strong> (bao gồm tiền hàng và phí vận chuyển) bằng tiền mặt trực tiếp cho nhân viên giao nhận.</li>
                        </ul>

                        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">2. Chuyển khoản ngân hàng tự động (Qua hệ thống SEPAY)</h2>
                        <p>
                            Nhằm mang lại trải nghiệm thanh toán 4.0 không chạm, không chờ đợi, Tân Vy Phát đã tích hợp thành công hệ thống đối soát giao dịch tự động <strong>SEPAY</strong>.
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Xác nhận tức thì:</strong> Sau khi quý khách hoàn tất chuyển khoản thành công theo đúng cú pháp, hệ thống SEPAY sẽ tự động nhận diện dòng tiền và chuyển trạng thái đơn hàng sang "Đã thanh toán" chỉ trong vài giây mà không cần nhân viên xác nhận thủ công.</li>
                            <li><strong>Thao tác đơn giản:</strong> Tại trang thanh toán, quý khách chỉ cần mở ứng dụng Mobile Banking và <strong>quét mã QR code</strong> hiển thị trên màn hình. Hệ thống sẽ tự động điền số tài khoản, số tiền và nội dung chuyển khoản.</li>
                            <li><strong>Lưu ý quan trọng:</strong> Nếu quý khách không quét mã QR mà chọn chuyển khoản thủ công, vui lòng <strong>nhập chính xác số tiền</strong> và <strong>nội dung chuyển khoản</strong> (thường là Mã đơn hàng) theo hướng dẫn trên màn hình. Nếu nhập sai nội dung, hệ thống sẽ không thể tự động xác nhận đơn hàng của quý khách.</li>
                        </ul>

                        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">3. Xử lý sự cố thanh toán & Hoàn tiền</h2>
                        <p>Trong một số trường hợp hiếm hoi phát sinh lỗi giao dịch, chúng tôi có các quy định xử lý như sau:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Chuyển sai số tiền / Sai cú pháp:</strong> Nếu quý khách chuyển khoản qua SEPAY nhưng sai số tiền hoặc quên ghi mã đơn hàng, trạng thái thanh toán sẽ không được cập nhật tự động. Quý khách vui lòng liên hệ ngay với bộ phận CSKH và cung cấp hình ảnh biên lai chuyển khoản để được hỗ trợ xác nhận thủ công.</li>
                            <li><strong>Chuyển dư tiền:</strong> Trong trường hợp quý khách chuyển dư so với giá trị đơn hàng, Tân Vy Phát sẽ chủ động liên hệ và hoàn trả lại phần tiền thừa qua đúng số tài khoản mà quý khách đã sử dụng.</li>
                            <li><strong>Hoàn tiền khi hủy đơn:</strong> Nếu quý khách đã thanh toán thành công qua SEPAY nhưng sau đó quyết định hủy đơn (trước khi hàng được gửi đi), chúng tôi sẽ tiến hành hoàn tiền 100% vào tài khoản của quý khách trong vòng 24h - 48h làm việc.</li>
                        </ul>

                        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">4. Thông tin liên hệ</h2>
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
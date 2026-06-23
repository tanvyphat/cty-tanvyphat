'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteProductButton({ id, name }: { id: number; name: string }) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setModalOpen(false)
        router.refresh()
      } else {
        alert('Xoá thất bại')
        setDeleting(false)
      }
    } catch (error) {
      alert('Đã xảy ra lỗi hệ thống')
      setDeleting(false)
    }
  }

  return (
      <>
        {/* Nút bấm để mở Modal */}
        <button
            onClick={() => setModalOpen(true)}
            className="text-red-500 hover:underline text-xs cursor-pointer font-medium"
        >
          Xoá
        </button>

        {/* Pop-up (Modal) xoá sản phẩm */}
        {modalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                {/* Header Modal */}
                <div className="p-5 border-b bg-red-50/50 border-red-100">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-red-700">
                    ⚠️ Xoá sản phẩm
                  </h3>
                </div>

                {/* Body Modal */}
                <div className="p-6">
                  <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">
                    CẢNH BÁO: Bạn sắp xoá sản phẩm <strong>"{name}"</strong>.<br /><br />
                    Hành động này KHÔNG THỂ HOÀN TÁC và sẽ xoá toàn bộ dữ liệu liên quan!
                  </p>
                </div>

                {/* Footer Modal - Nút hành động */}
                <div className="p-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
                  <button
                      onClick={() => setModalOpen(false)}
                      disabled={deleting}
                      className="cursor-pointer px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
                  >
                    Huỷ
                  </button>
                  <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="cursor-pointer px-5 py-2 text-sm font-semibold text-white rounded-xl transition-all shadow-sm bg-red-600 hover:bg-red-700 hover:shadow-red-200 hover:shadow-lg disabled:opacity-50"
                  >
                    {deleting ? 'Đang xoá...' : 'Xác nhận'}
                  </button>
                </div>
              </div>
            </div>
        )}
      </>
  )
}
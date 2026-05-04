'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteNewsButton({ id }: { id: number }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    if (!confirm('Bạn có chắc muốn xóa bài đăng này?')) return
    setLoading(true)
    await fetch(`/api/admin/news/${id}`, { method: 'DELETE' })
    setLoading(false)
    router.refresh()
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-500 hover:underline text-xs disabled:opacity-50"
    >
      {loading ? '...' : 'Xóa'}
    </button>
  )
}

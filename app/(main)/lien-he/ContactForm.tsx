'use client'

import { useState } from 'react'

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', message: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Static display only – no backend
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
        <div className="text-5xl mb-3">✅</div>
        <h3 className="text-lg font-bold text-green-700 mb-2">Gửi thành công!</h3>
        <p className="text-green-600 text-sm mb-4">
          Cảm ơn <strong>{form.name}</strong>! Chúng tôi sẽ liên hệ lại qua số{' '}
          <strong>{form.phone}</strong> sớm nhất có thể.
        </p>
        <button
          onClick={() => {
            setSubmitted(false)
            setForm({ name: '', phone: '', message: '' })
          }}
          className="text-green-700 text-sm underline hover:no-underline"
        >
          Gửi tin nhắn khác
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Họ và tên <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Nguyễn Văn A"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a56db] focus:border-transparent"
        />
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Số điện thoại <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          id="phone"
          required
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="09xxxxxxxx"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a56db] focus:border-transparent"
        />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
          Nội dung <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          required
          rows={4}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Tôi muốn hỏi giá giấy A4 Double A, số lượng 50 ream..."
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a56db] focus:border-transparent resize-none"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-[#1a56db] hover:bg-[#1e40af] text-white font-bold py-3 rounded-xl transition-colors shadow-md text-sm"
      >
        Gửi tin nhắn
      </button>
    </form>
  )
}

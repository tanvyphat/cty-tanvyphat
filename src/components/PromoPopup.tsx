'use client'

import { useState, useEffect } from 'react'

export default function PromoPopup() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Show on mount (every visit to homepage)
    const timer = setTimeout(() => setIsOpen(true), 10)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 sm:p-6 md:p-8 backdrop-blur-sm"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="relative w-full max-w-4xl flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setIsOpen(false)}
          className="absolute -top-12 right-0 md:-right-12 w-10 h-10 flex items-center justify-center rounded-full bg-white text-gray-900 hover:bg-gray-200 transition-colors z-[110] shadow-xl cursor-pointer"
          aria-label="Đóng popup"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="relative w-full flex justify-center items-center rounded-2xl shadow-2xl">
          <img
            src="/TVP_2.9.png"
            alt="Khuyến mãi"
            className="w-auto h-auto max-w-full max-h-[85vh] object-contain rounded-2xl"
          />
        </div>
      </div>
    </div>
  )
}

'use client'

import { useRef, useEffect, useState } from 'react'

type Props = {
  description: string
}

export default function ProductDescription({ description }: Props) {
  const ref = useRef<HTMLParagraphElement>(null)
  const [needsToggle, setNeedsToggle] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (el) setNeedsToggle(el.scrollHeight > el.clientHeight)
  }, [description])

  return (
    <div>
      <p
        ref={ref}
        className={`text-gray-600 leading-relaxed text-sm whitespace-pre-line transition-all duration-300 ${
          expanded ? '' : 'line-clamp-6'
        }`}
      >
        {description}
      </p>
      {needsToggle && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 text-[#1a56db] text-sm font-medium hover:underline"
        >
          {expanded ? 'Thu gọn ▲' : 'Xem thêm ▼'}
        </button>
      )}
    </div>
  )
}

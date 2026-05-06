'use client'

import { useRef, useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type Props = {
  description: string
}

export default function ProductDescription({ description }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [needsToggle, setNeedsToggle] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (el) setNeedsToggle(el.scrollHeight > el.clientHeight)
  }, [description])

  return (
    <div>
      <div
        ref={ref}
        className={`text-gray-600 leading-relaxed text-sm transition-all duration-300 overflow-hidden ${
          expanded ? 'max-h-none' : 'max-h-40'
        }`}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => <h1 className="text-base font-bold text-[#1a3a6b] mt-4 mb-1.5">{children}</h1>,
            h2: ({ children }) => <h2 className="text-sm font-bold text-[#1a3a6b] mt-3 mb-1">{children}</h2>,
            h3: ({ children }) => <h3 className="text-sm font-semibold text-gray-800 mt-2 mb-1">{children}</h3>,
            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
            ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-0.5">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-0.5">{children}</ol>,
            li: ({ children }) => <li>{children}</li>,
            strong: ({ children }) => <strong className="font-semibold text-gray-800">{children}</strong>,
            em: ({ children }) => <em className="italic">{children}</em>,
          }}
        >
          {description}
        </ReactMarkdown>
      </div>
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

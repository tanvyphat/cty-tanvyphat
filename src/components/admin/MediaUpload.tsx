'use client'

import { useState, useRef } from 'react'

type Props = {
  label: string
  accept: string
  currentUrl?: string | null
  onUpload: (url: string) => void
}

export default function MediaUpload({ label, accept, currentUrl, onUpload }: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl ?? null)
  const inputRef = useRef<HTMLInputElement>(null)

  const isVideo = accept.includes('video')

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)
    setPreviewUrl(URL.createObjectURL(file))

    const form = new FormData()
    form.append('file', file)

    try {
      const res = await fetch('/api/admin/news/upload', { method: 'POST', body: form })
      if (!res.ok) {
        const { error: msg } = await res.json()
        throw new Error(msg)
      }
      const { url } = await res.json()
      setPreviewUrl(url)
      onUpload(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload thất bại')
      setPreviewUrl(null)
    } finally {
      setUploading(false)
    }
  }

  function handleRemove() {
    setPreviewUrl(null)
    onUpload('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      {previewUrl ? (
        <div className="relative inline-block">
          {isVideo ? (
            <video src={previewUrl} controls className="h-32 rounded-lg border border-gray-200" preload="metadata" />
          ) : (
            <img src={previewUrl} alt="preview" className="h-32 object-cover rounded-lg border border-gray-200" />
          )}
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
          >
            ×
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors disabled:opacity-50"
        >
          {uploading ? '⏳ Đang upload...' : `+ Chọn ${isVideo ? 'video' : 'ảnh'}`}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFile}
      />

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

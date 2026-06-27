'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { CategoryRow, ProductRow, ProductUnitRow } from '@/src/lib/supabase/server'

const BRANCH_NAMES: Record<string, string> = {
  'giay-in': 'Giấy In',
  'van-phong-pham': 'Văn Phòng Phẩm',
  'hang-thai-lan': 'Hàng Tiêu Dùng Thái Lan',
  'becker-chemie': 'Becker Chemie'
}

function toSlug(text: string): string {
  return text
    .replace(/[đĐ]/g, 'd')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

interface UnitField {
  unit_name: string
  price: string
  stock: string
}

type Props = {
  categories: CategoryRow[]
  product?: ProductRow
}

function defaultUnits(product?: ProductRow): UnitField[] {
  if (!product || product.product_units.length === 0) {
    return [{ unit_name: 'Hộp', price: '', stock: '0' }]
  }
  return product.product_units.map((u: ProductUnitRow) => ({
    unit_name: u.unit_name,
    price: u.price != null ? String(u.price) : '',
    stock: String(u.stock),
  }))
}

export default function ProductFormClient({ categories, product }: Props) {
  const router = useRouter()
  const isEdit = !!product
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState(product?.name ?? '')
  const [slug, setSlug] = useState(product?.slug ?? '')
  const [slugManual, setSlugManual] = useState(isEdit)
  const [category, setCategory] = useState(product?.category ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [images, setImages] = useState<string[]>(product?.images ?? [])
  const [units, setUnits] = useState<UnitField[]>(defaultUnits(product))
  const [featured, setFeatured] = useState(product?.featured ?? false)
  const [fbPostUrl, setFbPostUrl] = useState(product?.fb_post_url ?? '')
  const [keyword, setKeyword] = useState(product?.keyword ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleNameChange(val: string) {
    setName(val)
    if (!slugManual) setSlug(toSlug(val))
  }

  async function handleImageFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)
    setError(null)
    for (const file of Array.from(files)) {
      const form = new FormData()
      form.append('file', file)
      try {
        const res = await fetch('/api/admin/products/upload', { method: 'POST', body: form })
        if (!res.ok) throw new Error((await res.json()).error)
        const { url } = await res.json()
        setImages(prev => [...prev, url])
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Upload thất bại')
      }
    }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function removeImage(index: number) {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  function moveImage(from: number, to: number) {
    setImages(prev => {
      const next = [...prev]
      const [item] = next.splice(from, 1)
      next.splice(to, 0, item)
      return next
    })
  }

  function addUnit() {
    setUnits(prev => [...prev, { unit_name: '', price: '', stock: '0' }])
  }

  function removeUnit(index: number) {
    setUnits(prev => prev.filter((_, i) => i !== index))
  }

  function updateUnit(index: number, field: keyof UnitField, value: string) {
    setUnits(prev => prev.map((u, i) => i === index ? { ...u, [field]: value } : u))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !slug.trim() || !category) {
      setError('Vui lòng điền tên sản phẩm, slug và chọn danh mục')
      return
    }
    if (units.length === 0) {
      setError('Sản phẩm phải có ít nhất một đơn vị')
      return
    }
    if (units.some(u => !u.unit_name.trim())) {
      setError('Tên đơn vị không được để trống')
      return
    }
    setSubmitting(true)
    setError(null)

    const payload = {
      slug: slug.trim(),
      name: name.trim(),
      category,
      description: description.trim(),
      images,
      featured,
      fb_post_url: fbPostUrl.trim() || null,
      keyword: keyword.trim() || null,
      units: units.map(u => ({
        unit_name: u.unit_name.trim(),
        price: u.price.trim() || null,
        stock: u.stock || '0',
      })),
    }

    const url = isEdit ? `/api/admin/products/${product.id}` : '/api/admin/products'
    const method = isEdit ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const { error: msg } = await res.json()
      setError(msg)
      setSubmitting(false)
      return
    }

    router.push('/admin/san-pham')
    router.refresh()
  }

  const branchSlugs = [...new Set(categories.map(c => c.branch_slug))]

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/san-pham" className="text-gray-500 hover:text-gray-700 text-sm">
              ← Sản phẩm
            </Link>
            <h1 className="font-bold text-gray-900">
              {isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
            </h1>
          </div>
          <button
            form="product-form"
            type="submit"
            disabled={submitting || uploading}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-1.5 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            {submitting ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
          </button>
        </div>
      </header>

      <form id="product-form" onSubmit={handleSubmit} className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Thông tin cơ bản */}
        <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Thông tin cơ bản</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm *</label>
            <input
              type="text"
              value={name}
              onChange={e => handleNameChange(e.target.value)}
              placeholder="Ví dụ: Giấy In A4 Double A 80gsm"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL) *</label>
            <input
              type="text"
              value={slug}
              onChange={e => { setSlug(e.target.value); setSlugManual(true) }}
              placeholder="giay-in-a4-double-a-80gsm"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              URL: /san-pham/{slug || '...'} — tự động tạo từ tên, có thể chỉnh tay
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục *</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Chọn danh mục --</option>
              {branchSlugs.map(bs => (
                <optgroup key={bs} label={BRANCH_NAMES[bs] ?? bs}>
                  {categories
                    .filter(c => c.branch_slug === bs)
                    .map(c => (
                      <option key={c.slug} value={c.slug}>{c.name}</option>
                    ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              placeholder="Mô tả sản phẩm, đặc điểm, ưu điểm..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        {/* Hình ảnh */}
        <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">Hình ảnh sản phẩm</h2>
            {images.length > 0 && (
              <span className="text-xs text-gray-400">{images.length} ảnh — ảnh đầu là ảnh chính</span>
            )}
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {images.map((url, i) => (
                <div key={i} className="relative group">
                  <img
                    src={url}
                    alt={`Ảnh ${i + 1}`}
                    className="w-full aspect-square object-cover rounded-xl border border-gray-100"
                  />
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-md font-medium">
                      Chính
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                  <div className="absolute bottom-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {i > 0 && (
                      <button
                        type="button"
                        onClick={() => moveImage(i, i - 1)}
                        className="w-5 h-5 bg-black/50 text-white rounded text-[10px] flex items-center justify-center hover:bg-black/70"
                        title="Dịch sang trái"
                      >
                        ‹
                      </button>
                    )}
                    {i < images.length - 1 && (
                      <button
                        type="button"
                        onClick={() => moveImage(i, i + 1)}
                        className="w-5 h-5 bg-black/50 text-white rounded text-[10px] flex items-center justify-center hover:bg-black/70"
                        title="Dịch sang phải"
                      >
                        ›
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors disabled:opacity-50"
          >
            {uploading ? '⏳ Đang upload...' : '+ Thêm ảnh'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={e => handleImageFiles(e.target.files)}
          />
          <p className="text-xs text-gray-400">Có thể chọn nhiều ảnh cùng lúc. Dùng nút ‹ › để đổi thứ tự.</p>
        </div>

        {/* Đơn vị & Giá */}
        <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">Đơn vị & Giá bán</h2>
            <button
              type="button"
              onClick={addUnit}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium px-3 py-1 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
            >
              + Thêm đơn vị
            </button>
          </div>

          <p className="text-xs text-gray-400">Mỗi đơn vị có giá riêng. Ví dụ: Hộp 25.000đ, Thùng 250.000đ. Để trống giá → nút &quot;Liên hệ&quot;.</p>

          {units.length === 0 && (
            <p className="text-sm text-gray-400 italic">Chưa có đơn vị nào. Nhấn &quot;+ Thêm đơn vị&quot; để thêm.</p>
          )}

          <div className="space-y-3">
            {units.map((unit, i) => (
              <div key={i} className="flex items-start gap-2 p-3 bg-gray-50 rounded-xl">
                <div className="flex-1 grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Tên đơn vị *</label>
                    <input
                      type="text"
                      value={unit.unit_name}
                      onChange={e => updateUnit(i, 'unit_name', e.target.value)}
                      placeholder="hộp, thùng, cái..."
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Giá (đ)</label>
                    <input
                      type="number"
                      value={unit.price}
                      onChange={e => updateUnit(i, 'price', e.target.value)}
                      placeholder="Để trống = Liên hệ"
                      min="0"
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Tồn kho</label>
                    <input
                      type="number"
                      value={unit.stock}
                      onChange={e => updateUnit(i, 'stock', e.target.value)}
                      min="0"
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                </div>
                {units.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeUnit(i)}
                    className="mt-5 w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                    title="Xóa đơn vị này"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={featured}
              onChange={e => setFeatured(e.target.checked)}
              className="w-4 h-4 rounded accent-blue-600"
            />
            <span className="text-sm text-gray-700">Sản phẩm nổi bật (hiển thị ở trang chủ)</span>
          </label>
        </div>

        {/* Thông tin bổ sung */}
        <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Thông tin bổ sung</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Link bài đăng Facebook</label>
            <input
              type="url"
              value={fbPostUrl}
              onChange={e => setFbPostUrl(e.target.value)}
              placeholder="https://facebook.com/..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Từ khóa tìm kiếm</label>
            <input
              type="text"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder="giay in a4, double a, 80gsm..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </form>
    </div>
  )
}

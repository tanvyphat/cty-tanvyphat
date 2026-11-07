'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import ImageExtension from '@tiptap/extension-image'
import LinkExtension from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { useCallback, useRef, useState } from 'react'
import { adminRequest } from '@/src/lib/admin-api-client'

type Props = {
  content: string
  onChangeAction: (html: string) => void
}

type ToolbarButtonProps = {
  onClick: () => void
  active?: boolean
  children: React.ReactNode
  title?: string
}

function ToolbarButton({ onClick, active, children, title }: ToolbarButtonProps) {
  return (
      <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); onClick() }}
          title={title}
          className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
              active
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
      >
        {children}
      </button>
  )
}

export default function NewsEditor({ content, onChangeAction }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadError, setUploadError] = useState('')
  const [uploading, setUploading] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: false, // Vô hiệu hóa link mặc định có sẵn trong StarterKit
      }),
      ImageExtension.configure({ inline: false }),
      LinkExtension.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Viết nội dung bài đăng tại đây...' }),
    ],
    content,
    immediatelyRender: false,
    onUpdate({ editor }) {
      onChangeAction(editor.getHTML())
    },
  })

  const uploadImage = useCallback(async (file: File) => {
    if (file.size > 4 * 1024 * 1024) {
      setUploadError('Ảnh vượt 4 MB, vui lòng nén trước khi chèn.')
      return
    }
    setUploadError('')
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const { url } = await adminRequest<{ url: string }>('/api/admin/news/upload', {
        method: 'POST', body: form,
      })
      editor?.chain().focus().setImage({ src: url }).run()
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Không thể chèn ảnh.')
    } finally {
      setUploading(false)
    }
  }, [editor])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadImage(file)
    e.target.value = ''
  }, [uploadImage])

  if (!editor) return null

  return (
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border-b border-gray-200">
          <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={editor.isActive('bold')}
              title="In đậm"
          >
            <strong>B</strong>
          </ToolbarButton>
          <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={editor.isActive('italic')}
              title="In nghiêng"
          >
            <em>I</em>
          </ToolbarButton>
          <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              active={editor.isActive('heading', { level: 2 })}
              title="Tiêu đề 2"
          >
            H2
          </ToolbarButton>
          <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              active={editor.isActive('heading', { level: 3 })}
              title="Tiêu đề 3"
          >
            H3
          </ToolbarButton>
          <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              active={editor.isActive('bulletList')}
              title="Danh sách"
          >
            • —
          </ToolbarButton>
          <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              active={editor.isActive('orderedList')}
              title="Danh sách số"
          >
            1.—
          </ToolbarButton>
          <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              active={editor.isActive('blockquote')}
              title="Trích dẫn"
          >
            ❝
          </ToolbarButton>
          <ToolbarButton
              onClick={() => {
                const url = window.prompt('Nhập URL link:')
                if (url) editor.chain().focus().setLink({ href: url }).run()
              }}
              active={editor.isActive('link')}
              title="Chèn link"
          >
            🔗
          </ToolbarButton>
          <ToolbarButton
              onClick={() => fileInputRef.current?.click()}
              title={uploading ? "Đang tải ảnh..." : "Chèn ảnh vào bài"}
          >
            🖼️
          </ToolbarButton>
          <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
          />
          <div className="flex-1" />
          <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              title="Hoàn tác"
          >
            ↩
          </ToolbarButton>
          <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              title="Làm lại"
          >
            ↪
          </ToolbarButton>
        </div>

        {uploadError && <p role="alert" className="px-3 py-2 text-sm text-red-600 bg-red-50">{uploadError}</p>}
        {uploading && <p role="status" className="px-3 py-2 text-sm text-blue-600">Đang tải ảnh vào bài...</p>}
        {/* Editor */}
        <EditorContent
            editor={editor}
            className="news-content p-4 min-h-[220px] focus:outline-none text-gray-800 text-sm"
        />
      </div>
  )
}
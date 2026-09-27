"use client"

import { useEffect, useState } from "react"
import { X, Loader2, Send } from "lucide-react"

interface Comment {
  id: number
  author_name: string | null
  content: string
  created_at: string
}

export default function ExplorerCommentsSheet({
  postId,
  onClose,
  onCommentAdded,
}: {
  postId: number
  onClose: () => void
  onCommentAdded: () => void
}) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState("")
  const [content, setContent] = useState("")
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetch(`/api/explorer/${postId}/comments`)
      .then((res) => res.json())
      .then((data) => setComments(data.comments || []))
      .finally(() => setLoading(false))
  }, [postId])

  const handleSubmit = async () => {
    if (!content.trim()) return
    setSending(true)
    try {
      const res = await fetch(`/api/explorer/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, author_name: name || null }),
      })
      const data = await res.json()
      if (res.ok) {
        setComments((prev) => [data.comment, ...prev])
        setContent("")
        onCommentAdded()
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl max-h-[75vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-bold text-gray-900">نظرات</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700" aria-label="بستن">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">هنوز نظری ثبت نشده است. اولین نفر باشید!</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="text-sm">
                <span className="font-medium text-gray-900">{c.author_name || "کاربر مهمان"}</span>
                <p className="text-gray-700 mt-0.5">{c.content}</p>
              </div>
            ))
          )}
        </div>

        <div className="p-3 border-t space-y-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="نام شما (اختیاری)"
            className="w-full text-sm rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
          <div className="flex items-center gap-2">
            <input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="نظر خود را بنویسید..."
              className="flex-1 text-sm rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
            <button
              onClick={handleSubmit}
              disabled={sending || !content.trim()}
              className="rounded-xl bg-brand text-white p-2.5 disabled:opacity-50"
              aria-label="ارسال نظر"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

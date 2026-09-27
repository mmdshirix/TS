"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Loader2, Film } from "lucide-react"
import type { ExplorerPost, ExplorerPinnedProduct } from "@/lib/db"
import ExplorerPostItem from "@/components/explorer-post"

type Post = ExplorerPost & { products: ExplorerPinnedProduct[] }

export default function ExplorerFeed({
  initialPosts,
  initialNextCursor,
}: {
  initialPosts: Post[]
  initialNextCursor: number | null
}) {
  const [posts, setPosts] = useState(initialPosts)
  const [cursor, setCursor] = useState(initialNextCursor)
  const [loading, setLoading] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const loadMore = useCallback(async () => {
    if (loading || cursor === null) return
    setLoading(true)
    try {
      const res = await fetch(`/api/explorer?cursor=${cursor}`)
      const data = await res.json()
      setPosts((prev) => [...prev, ...(data.posts || [])])
      setCursor(data.nextCursor)
    } finally {
      setLoading(false)
    }
  }, [cursor, loading])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) loadMore()
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMore])

  if (posts.length === 0) {
    return (
      <div className="h-[calc(100dvh-12rem)] md:h-[calc(100dvh-4rem)] flex flex-col items-center justify-center text-gray-500 gap-3 bg-black text-white">
        <Film className="w-12 h-12 text-gray-600" />
        <p>هنوز ویدیویی در اکسپلور این فروشگاه منتشر نشده است</p>
      </div>
    )
  }

  return (
    <div className="h-[calc(100dvh-12rem)] md:h-[calc(100dvh-4rem)] overflow-y-scroll snap-y snap-mandatory scrollbar-none">
      {posts.map((post) => (
        <ExplorerPostItem key={post.id} post={post} />
      ))}
      {cursor !== null && (
        <div ref={sentinelRef} className="h-20 flex items-center justify-center bg-black">
          {loading && <Loader2 className="w-6 h-6 animate-spin text-white" />}
        </div>
      )}
    </div>
  )
}

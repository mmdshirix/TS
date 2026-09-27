"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Heart, MessageCircle, Share2, ShoppingBag } from "lucide-react"
import type { ExplorerPost, ExplorerPinnedProduct } from "@/lib/db"
import ExplorerCommentsSheet from "@/components/explorer-comments-sheet"

type Post = ExplorerPost & { products: ExplorerPinnedProduct[] }

export default function ExplorerPostItem({ post }: { post: Post }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post.like_count)
  const [shareCount, setShareCount] = useState(post.share_count)
  const [commentCount, setCommentCount] = useState(post.comment_count)
  const [showComments, setShowComments] = useState(false)
  const pathname = usePathname()
  const slug = pathname.split("/")[2] || ""

  useEffect(() => {
    const el = containerRef.current
    const video = videoRef.current
    if (!el || !video) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {})
          if (slug) {
            fetch("/api/track", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ slug, eventType: "explorer_play", targetId: post.id }),
              keepalive: true,
            }).catch(() => {})
          }
        } else {
          video.pause()
        }
      },
      { threshold: 0.6 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [slug, post.id])

  const handleLike = async () => {
    setLiked((prev) => !prev)
    setLikeCount((prev) => prev + (liked ? -1 : 1))
    try {
      const res = await fetch(`/api/explorer/${post.id}/like`, { method: "POST" })
      const data = await res.json()
      if (res.ok) {
        setLiked(data.liked)
        setLikeCount(data.likeCount)
      }
    } catch {
      // optimistic state stands if the request fails silently
    }
  }

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : ""
    try {
      if (navigator.share) {
        await navigator.share({ title: post.caption || "اکسپلور", url })
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url)
      }
    } catch {
      // user cancelled the native share sheet
    }
    try {
      const res = await fetch(`/api/explorer/${post.id}/share`, { method: "POST" })
      const data = await res.json()
      if (res.ok) setShareCount(data.shareCount)
    } catch {
      // share count is best-effort
    }
  }

  const primaryProduct = post.products[0]

  return (
    <div ref={containerRef} className="relative h-full w-full snap-start bg-black flex items-center justify-center">
      <video
        ref={videoRef}
        src={post.video_url}
        poster={post.thumbnail_url || undefined}
        loop
        muted
        playsInline
        onClick={(e) => (e.currentTarget.paused ? e.currentTarget.play() : e.currentTarget.pause())}
        className="h-full w-full object-cover cursor-pointer"
      />

      <div className="absolute inset-x-0 bottom-0 z-10 p-4 pb-24 md:pb-6 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end justify-between gap-3">
        <div className="flex-1 min-w-0">
          {post.caption && <p className="text-white text-sm line-clamp-2 mb-3">{post.caption}</p>}

          {primaryProduct && (
            <Link
              href={`/product/${primaryProduct.slug}`}
              className="flex items-center gap-3 bg-white/95 rounded-2xl p-2 pl-3 max-w-xs hover:bg-white transition-colors"
            >
              <div className="w-11 h-11 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                {primaryProduct.image_url ? (
                  <img src={primaryProduct.image_url || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-900 truncate">{primaryProduct.name}</p>
                <p className="text-xs text-gray-500">{Number(primaryProduct.price).toLocaleString()} تومان</p>
              </div>
            </Link>
          )}
        </div>

        <div className="flex flex-col items-center gap-4 flex-shrink-0">
          <button onClick={handleLike} className="flex flex-col items-center gap-1 text-white" aria-label="لایک">
            <Heart className={`w-7 h-7 ${liked ? "fill-red-500 text-red-500" : ""}`} />
            <span className="text-xs">{likeCount}</span>
          </button>
          <button onClick={() => setShowComments(true)} className="flex flex-col items-center gap-1 text-white" aria-label="نظرات">
            <MessageCircle className="w-7 h-7" />
            <span className="text-xs">{commentCount}</span>
          </button>
          <button onClick={handleShare} className="flex flex-col items-center gap-1 text-white" aria-label="اشتراک‌گذاری">
            <Share2 className="w-7 h-7" />
            <span className="text-xs">{shareCount}</span>
          </button>
        </div>
      </div>

      {showComments && (
        <ExplorerCommentsSheet
          postId={post.id}
          onClose={() => setShowComments(false)}
          onCommentAdded={() => setCommentCount((prev) => prev + 1)}
        />
      )}
    </div>
  )
}

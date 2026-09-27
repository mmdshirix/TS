"use client"

import { useEffect, useRef, useState } from "react"
import { X } from "lucide-react"
import type { StoreStory } from "@/lib/db"

const IMAGE_DURATION_MS = 5000

export default function StoryViewer({
  stories,
  startIndex,
  onClose,
}: {
  stories: StoreStory[]
  startIndex: number
  onClose: () => void
}) {
  const [index, setIndex] = useState(startIndex)
  const [progress, setProgress] = useState(0)
  const rafRef = useRef<number>()
  const startRef = useRef<number>(0)

  const story = stories[index]

  const goNext = () => {
    setIndex((i) => {
      if (i >= stories.length - 1) {
        onClose()
        return i
      }
      return i + 1
    })
  }

  const goPrev = () => {
    setIndex((i) => Math.max(0, i - 1))
  }

  useEffect(() => {
    setProgress(0)
    if (story.media_type === "video") {
      return
    }
    startRef.current = Date.now()
    const tick = () => {
      const elapsed = Date.now() - startRef.current
      const pct = Math.min(100, (elapsed / IMAGE_DURATION_MS) * 100)
      setProgress(pct)
      if (pct >= 100) {
        goNext()
      } else {
        rafRef.current = requestAnimationFrame(tick)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  return (
    <div className="fixed inset-0 z-[60] bg-black flex items-center justify-center">
      <div className="relative w-full h-full max-w-md mx-auto">
        <div className="absolute top-2 inset-x-2 z-20 flex gap-1">
          {stories.map((s, i) => (
            <div key={s.id} className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden">
              <div
                className="h-full bg-white"
                style={{ width: i < index ? "100%" : i === index ? `${progress}%` : "0%" }}
              />
            </div>
          ))}
        </div>

        <div className="absolute top-6 inset-x-3 z-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={story.cover_image_url} alt="" className="w-7 h-7 rounded-full object-cover border border-white/50" />
            <span className="text-white text-sm font-medium">{story.title}</span>
          </div>
          <button onClick={onClose} aria-label="بستن" className="text-white p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="w-full h-full flex items-center justify-center">
          {story.media_type === "video" ? (
            <video
              key={story.id}
              src={story.media_url}
              autoPlay
              playsInline
              className="w-full h-full object-contain"
              onTimeUpdate={(e) => {
                const v = e.currentTarget
                if (v.duration) setProgress((v.currentTime / v.duration) * 100)
              }}
              onEnded={goNext}
            />
          ) : (
            <img src={story.media_url} alt={story.title} className="w-full h-full object-contain" />
          )}
        </div>

        <button aria-label="استوری قبلی" className="absolute top-16 bottom-0 right-0 w-1/2" onClick={goPrev} />
        <button aria-label="استوری بعدی" className="absolute top-16 bottom-0 left-0 w-1/2" onClick={goNext} />

        {story.link_url && (
          <a
            href={story.link_url}
            className="absolute bottom-6 inset-x-4 z-20 bg-white text-gray-900 text-center rounded-full py-2.5 text-sm font-medium"
          >
            مشاهده
          </a>
        )}
      </div>
    </div>
  )
}

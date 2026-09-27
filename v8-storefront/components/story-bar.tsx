"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import type { StoreStory } from "@/lib/db"
import StoryViewer from "@/components/story-viewer"

export default function StoryBar({ stories }: { stories: StoreStory[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const pathname = usePathname()

  // The explorer feed is an immersive full-bleed view (see explorer-feed.tsx's
  // viewport height math) — showing the story bar above it would push its
  // height calculation off again, so it's hidden on that route only.
  if (stories.length === 0 || pathname.includes("/explorer")) return null

  return (
    <>
      <div className="border-b bg-white">
        <div className="container flex items-center gap-4 overflow-x-auto py-3 scrollbar-none">
          {stories.map((story, i) => (
            <button
              key={story.id}
              onClick={() => setActiveIndex(i)}
              className="flex flex-col items-center gap-1 flex-shrink-0 w-16"
            >
              <span className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-orange-400 via-pink-500 to-rose-500">
                <span className="block w-full h-full rounded-full border-2 border-white overflow-hidden bg-gray-100">
                  <img src={story.cover_image_url} alt={story.title} className="w-full h-full object-cover" />
                </span>
              </span>
              <span className="text-[11px] text-gray-700 truncate w-full text-center">{story.title}</span>
            </button>
          ))}
        </div>
      </div>

      {activeIndex !== null && (
        <StoryViewer stories={stories} startIndex={activeIndex} onClose={() => setActiveIndex(null)} />
      )}
    </>
  )
}

"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Slide {
  image_url?: string
  title?: string
  subtitle?: string
  link_url?: string
  link_text?: string
}

export default function BannerBlock({ config }: { config: { slides?: Slide[] } }) {
  const slides = (config.slides || []).filter((s) => s.image_url || s.title)
  const [index, setIndex] = useState(0)

  if (slides.length === 0) return null

  const slide = slides[index]

  return (
    <section className="relative">
      <div className="relative h-56 sm:h-80 md:h-96 w-full overflow-hidden bg-gray-100">
        {slide.image_url && (
          <img src={slide.image_url || "/placeholder.svg"} alt={slide.title || ""} className="w-full h-full object-cover" />
        )}
        {(slide.title || slide.subtitle) && (
          <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-center text-white p-6">
            {slide.title && <h2 className="text-xl sm:text-3xl font-bold mb-2">{slide.title}</h2>}
            {slide.subtitle && <p className="text-sm sm:text-base mb-4">{slide.subtitle}</p>}
            {slide.link_url && slide.link_text && (
              <a href={slide.link_url} className="bg-brand text-white px-5 py-2 rounded-brand text-sm font-medium">
                {slide.link_text}
              </a>
            )}
          </div>
        )}

        {slides.length > 1 && (
          <>
            <button
              onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
              className="absolute top-1/2 -translate-y-1/2 right-3 bg-white/80 hover:bg-white rounded-full p-2"
              aria-label="قبلی"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIndex((i) => (i + 1) % slides.length)}
              className="absolute top-1/2 -translate-y-1/2 left-3 bg-white/80 hover:bg-white rounded-full p-2"
              aria-label="بعدی"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className={`w-2 h-2 rounded-full ${i === index ? "bg-white" : "bg-white/50"}`}
                  aria-label={`اسلاید ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}

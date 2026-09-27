"use client"

import { useEffect } from "react"

declare global {
  interface Window {
    ChatbotWidget?: { open: () => void; close: () => void; toggle: () => void; sendMessage?: (text: string) => void }
  }
}

/**
 * Turns any element with [data-open-chat] into an "open the AI assistant" trigger.
 * Optional data-prompt pre-fills a message when the widget supports it.
 */
export default function OpenChatListener() {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-open-chat]")
      if (!target) return
      e.preventDefault()
      const prompt = target.dataset.prompt
      const widget = window.ChatbotWidget
      if (widget) {
        widget.open()
        if (prompt && widget.sendMessage) setTimeout(() => widget.sendMessage!(prompt), 400)
      } else {
        // Widget still loading: retry shortly, then give up quietly.
        let tries = 0
        const t = setInterval(() => {
          tries += 1
          if (window.ChatbotWidget) {
            window.ChatbotWidget.open()
            if (prompt && window.ChatbotWidget.sendMessage) window.ChatbotWidget.sendMessage(prompt)
            clearInterval(t)
          } else if (tries > 20) {
            clearInterval(t)
          }
        }, 250)
      }
    }
    document.addEventListener("click", handler)
    return () => document.removeEventListener("click", handler)
  }, [])
  return null
}

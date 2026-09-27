"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Send, Code2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  role: "user" | "assistant"
  content: string
}

const PAGES = [
  { value: "home", label: "صفحه اصلی" },
  { value: "about", label: "درباره ما" },
  { value: "contact", label: "تماس با ما" },
]

export default function ProgrammerAssistantChat() {
  const [page, setPage] = useState("home")
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "سلام! من دستیار برنامه‌نویس شما هستم. می‌توانم چیدمان، محتوا و رنگ‌بندی صفحات فروشگاهتان را طبق درخواست شما تغییر بدهم. مثلاً بگویید «رنگ اصلی فروشگاه را سبز کن» یا «یک بلاک متنی درباره ضمانت بازگشت کالا اضافه کن».",
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    const message = input.trim()
    if (!message || loading) return

    const nextMessages = [...messages, { role: "user" as const, content: message }]
    setMessages(nextMessages)
    setInput("")
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/ai-assistant/programmer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          page,
          history: nextMessages.slice(0, -1).slice(-10),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "خطا در پردازش درخواست")

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }])
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ارتباط با دستیار")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 justify-between flex-wrap">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Code2 className="w-4 h-4" />
          صفحه‌ای که ویرایش می‌شود:
        </div>
        <Select value={page} onValueChange={setPage}>
          <SelectTrigger className="w-40 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGES.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="rounded-2xl">
        <CardContent className="p-4 space-y-3 max-h-[480px] overflow-y-auto">
          {messages.map((m, i) => (
            <div
              key={i}
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line",
                m.role === "user" ? "bg-blue-600 text-white mr-auto" : "bg-gray-100 text-gray-800 ml-auto",
              )}
            >
              {m.content}
            </div>
          ))}
          {loading && (
            <div className="bg-gray-100 text-gray-500 ml-auto max-w-[85%] rounded-2xl px-4 py-2.5 text-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              در حال فکر کردن...
            </div>
          )}
          <div ref={bottomRef} />
        </CardContent>
      </Card>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="مثلاً: رنگ اصلی فروشگاه را سبز کن"
          className="rounded-xl"
          disabled={loading}
        />
        <Button onClick={handleSend} disabled={loading || !input.trim()} className="rounded-xl gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          ارسال
        </Button>
      </div>
    </div>
  )
}

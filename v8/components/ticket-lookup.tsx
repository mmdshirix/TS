"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Search, Ticket, MessageSquare, Clock, ArrowRight } from "lucide-react"

interface TicketData {
  id: number
  subject: string
  message: string
  image_url: string | null
  status: string
  priority: string
  created_at: string
  responses: Array<{
    id: number
    message: string
    image_url?: string | null
    is_admin: boolean
    created_at: string
  }>
}

interface TicketLookupProps {
  chatbotId: number
  primaryColor?: string
}

export function TicketLookup({ chatbotId, primaryColor = "#3B82F6" }: TicketLookupProps) {
  const [step, setStep] = useState<"search" | "results">("search")
  const [userPhone, setUserPhone] = useState("")
  const [tickets, setTickets] = useState<TicketData[]>([])
  const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSearch = async () => {
    if (!userPhone.trim()) {
      setError("لطفاً شماره تماس خود را وارد کنید")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const url = new URL(`${window.location.origin}/api/tickets/lookup`)
      url.searchParams.set("chatbot_id", chatbotId.toString())
      url.searchParams.set("user_phone", userPhone)

      console.log("[v0] Searching tickets with URL:", url.toString())

      const response = await fetch(url.toString())

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Tickets found:", data.tickets?.length || 0)
        if (data.tickets && data.tickets.length > 0) {
          setTickets(data.tickets)
          setStep("results")
        } else {
          setError("تیکتی با این شماره تماس یافت نشد")
        }
      } else {
        const errorData = await response.json()
        console.error("[v0] Lookup error:", errorData)
        setError("خطا در جستجوی تیکت. لطفاً دوباره تلاش کنید")
      }
    } catch (error) {
      console.error("[v0] Error searching tickets:", error)
      setError("خطا در جستجوی تیکت. لطفاً دوباره تلاش کنید")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <Badge className="bg-green-100 text-green-700 dark:bg-green-100 dark:text-green-700 border-0 rounded-full">
            باز
          </Badge>
        )
      case "closed":
        return (
          <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-100 dark:text-gray-700 border-0 rounded-full">
            بسته شده
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-100 dark:text-yellow-700 border-0 rounded-full">
            در انتظار
          </Badge>
        )
      default:
        return (
          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-100 dark:text-blue-700 border-0 rounded-full">
            {status}
          </Badge>
        )
    }
  }

  if (step === "search") {
    return (
      <Card className="w-full border-0 shadow-none bg-white dark:bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-900 flex items-center gap-2">
            <Search className="w-6 h-6" />
            پیگیری تیکت
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-600 mt-1">
            برای مشاهده تیکت‌های قبلی خود، شماره تماس خود را وارد کنید
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="userPhone" className="text-sm font-medium text-gray-700 dark:text-gray-700 mb-2 block">
              شماره تماس *
            </Label>
            <Input
              id="userPhone"
              value={userPhone}
              onChange={(e) => setUserPhone(e.target.value)}
              placeholder="09xxxxxxxxx"
              className="rounded-2xl border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 dark:bg-white dark:text-gray-900 dark:border-gray-300 dark:placeholder:text-gray-400 [color-scheme:light]"
              dir="ltr"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 dark:text-red-600 bg-red-50 dark:bg-red-50 p-3 rounded-2xl">
              {error}
            </div>
          )}

          <Button
            onClick={handleSearch}
            disabled={isLoading}
            className="w-full rounded-2xl text-white h-12 text-base font-medium"
            style={{ backgroundColor: primaryColor }}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                در حال جستجو...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                جستجوی تیکت
              </div>
            )}
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (selectedTicket) {
    return (
      <Card className="w-full border-0 shadow-none bg-white dark:bg-white">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-900 flex items-center gap-2">
              <Ticket className="w-6 h-6" />
              تیکت #{selectedTicket.id}
            </CardTitle>
            <Button
              variant="ghost"
              onClick={() => setSelectedTicket(null)}
              className="text-sm text-gray-700 dark:text-gray-700"
            >
              بازگشت
            </Button>
          </div>
          <div className="flex items-center gap-2 mt-2">
            {getStatusBadge(selectedTicket.status)}
            <span className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(selectedTicket.created_at).toLocaleDateString("fa-IR")}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-900 mb-2">{selectedTicket.subject}</h3>
            <p className="text-sm text-gray-700 dark:text-gray-700 leading-relaxed">{selectedTicket.message}</p>
            {selectedTicket.image_url && (
              <img
                src={selectedTicket.image_url || "/placeholder.svg"}
                alt="Ticket"
                className="mt-3 rounded-xl max-w-full border-2 border-gray-200 dark:border-gray-200"
              />
            )}
          </div>

          {selectedTicket.responses && selectedTicket.responses.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 dark:text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                پاسخ‌ها ({selectedTicket.responses.length})
              </h4>
              {selectedTicket.responses.map((response) => (
                <div
                  key={response.id}
                  className={`p-4 rounded-2xl ${
                    response.is_admin
                      ? "bg-blue-50 border-2 border-blue-200 dark:bg-blue-50 dark:border-blue-200"
                      : "bg-gray-50 border-2 border-gray-200 dark:bg-gray-50 dark:border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant={response.is_admin ? "default" : "secondary"}
                      className={`rounded-full text-xs ${
                        response.is_admin
                          ? "bg-blue-600 text-white dark:bg-blue-600 dark:text-white"
                          : "bg-gray-200 text-gray-700 dark:bg-gray-200 dark:text-gray-700"
                      }`}
                    >
                      {response.is_admin ? "پشتیبانی" : "شما"}
                    </Badge>
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      {new Date(response.created_at).toLocaleDateString("fa-IR")}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 dark:text-gray-800 leading-relaxed">{response.message}</p>
                  {response.image_url && (
                    <img
                      src={response.image_url || "/placeholder.svg"}
                      alt="Response"
                      className="mt-3 rounded-xl max-w-full border-2 border-gray-200 dark:border-gray-200"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full border-0 shadow-none bg-white dark:bg-white">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-900">تیکت‌های یافت شده</CardTitle>
          <Button
            variant="ghost"
            onClick={() => setStep("search")}
            className="text-sm text-gray-700 dark:text-gray-700"
          >
            جستجوی جدید
          </Button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-600 mt-1">{tickets.length} تیکت یافت شد</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {tickets.map((ticket) => (
          <Card
            key={ticket.id}
            className="cursor-pointer hover:shadow-lg transition-all bg-white dark:bg-white border-gray-200 dark:border-gray-200"
            onClick={() => setSelectedTicket(ticket)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-900 line-clamp-1">{ticket.subject}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-600 mt-1 line-clamp-2">{ticket.message}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 dark:text-gray-400 flex-shrink-0 mr-2" />
              </div>
              <div className="flex items-center justify-between mt-3">
                {getStatusBadge(ticket.status)}
                <span className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(ticket.created_at).toLocaleDateString("fa-IR")}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  )
}

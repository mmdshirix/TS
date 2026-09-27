"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { TicketIcon, MessageSquare, Send, Search, Filter, X, Upload, ChevronUp, ChevronDown, Minus } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface TicketType {
  id: number
  chatbot_id: number
  user_name: string
  user_email?: string
  user_phone: string | null
  subject: string
  message: string
  image_url: string | null
  status: string
  priority: string
  created_at: string
  updated_at: string
}

interface TicketResponse {
  id: number
  ticket_id: number
  message: string
  image_url?: string | null
  is_admin: boolean
  created_at: string
}

export function TicketManagement({ userId }: { userId: number }) {
  const [tickets, setTickets] = useState<TicketType[]>([])
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null)
  const [responses, setResponses] = useState<TicketResponse[]>([])
  const [replyMessage, setReplyMessage] = useState("")
  const [replyImage, setReplyImage] = useState<File | null>(null)
  const [replyImagePreview, setReplyImagePreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [filter, setFilter] = useState<"all" | "open" | "closed" | "pending">("all")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchTickets()

    const handleChatbotChange = () => {
      fetchTickets()
    }

    window.addEventListener("chatbotChanged", handleChatbotChange)

    return () => {
      window.removeEventListener("chatbotChanged", handleChatbotChange)
    }
  }, [])

  const fetchTickets = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/dashboard/tickets")
      if (response.ok) {
        const data = await response.json()
        setTickets(data.tickets || [])
      }
    } catch (error) {
      console.error("Error fetching tickets:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTicketResponses = async (ticketId: number) => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}`)
      if (response.ok) {
        const data = await response.json()
        setResponses(data.responses || [])
      }
    } catch (error) {
      console.error("Error fetching responses:", error)
    }
  }

  const handleTicketSelect = (ticket: TicketType) => {
    setSelectedTicket(ticket)
    fetchTicketResponses(ticket.id)
  }

  const handleReplyImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setReplyImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setReplyImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSendReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return

    setIsSubmitting(true)
    try {
      let imageUrl: string | null = null
      if (replyImage) {
        const imageFormData = new FormData()
        imageFormData.append("file", replyImage)

        const uploadResponse = await fetch("/api/upload-image", {
          method: "POST",
          body: imageFormData,
        })

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          imageUrl = uploadData.url
        }
      }

      const response = await fetch(`/api/tickets/${selectedTicket.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: replyMessage,
          image_url: imageUrl,
          is_admin: true,
        }),
      })

      if (response.ok) {
        setReplyMessage("")
        setReplyImage(null)
        setReplyImagePreview(null)
        fetchTicketResponses(selectedTicket.id)
      }
    } catch (error) {
      console.error("Error sending reply:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStatusChange = async (ticketId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchTickets()
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket({ ...selectedTicket, status: newStatus })
        }
      }
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

  const filteredTickets = tickets.filter((ticket) => {
    const matchesFilter = filter === "all" || ticket.status === filter
    const matchesSearch =
      searchQuery === "" ||
      ticket.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.message?.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesFilter && matchesSearch
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <Badge className="bg-green-100 text-green-700 border-0 rounded-full dark:bg-green-100 dark:text-green-700">
            باز
          </Badge>
        )
      case "closed":
        return (
          <Badge className="bg-gray-100 text-gray-700 border-0 rounded-full dark:bg-gray-100 dark:text-gray-700">
            بسته
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-purple-100 text-purple-700 border-0 rounded-full dark:bg-purple-100 dark:text-purple-700">
            در انتظار
          </Badge>
        )
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-0 rounded-full dark:bg-yellow-100 dark:text-yellow-700">
            معلق
          </Badge>
        )
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <ChevronUp className="w-4 h-4 text-red-600" />
      case "low":
        return <ChevronDown className="w-4 h-4 text-gray-500" />
      default:
        return <Minus className="w-4 h-4 text-orange-500" />
    }
  }

  const getPriorityLabel = (priority: string | null) => {
    if (!priority) return "متوسط"
    switch (priority) {
      case "high":
        return "بالا"
      case "low":
        return "پایین"
      default:
        return "متوسط"
    }
  }

  const openTicketCount = tickets.filter((t) => t.status === "open").length
  const pendingTicketCount = tickets.filter((t) => t.status === "pending").length
  const closedTicketCount = tickets.filter((t) => t.status === "closed").length

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-white" dir="rtl">
      <div className="bg-white dark:bg-white border-b dark:border-gray-200 p-4">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white">
              + تیکت جدید
            </Button>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-400" />
              <Input
                placeholder="جستجوی درخواست‌کننده"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 rounded-xl border-gray-200 dark:border-gray-200 dark:bg-white dark:text-gray-900 dark:placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="rounded-xl dark:border-gray-200 dark:bg-white dark:text-gray-900 bg-transparent"
                >
                  <Filter className="w-4 h-4 ml-2 dark:text-gray-900" />
                  فیلترها
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white dark:bg-white dark:border-gray-200 rounded-xl">
                <DropdownMenuItem onClick={() => setFilter("all")} className="dark:text-gray-900">
                  همه تیکت‌ها
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("open")} className="dark:text-gray-900">
                  باز
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("pending")} className="dark:text-gray-900">
                  در انتظار
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("closed")} className="dark:text-gray-900">
                  بسته
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {selectedTicket && (
              <Button
                variant="outline"
                onClick={() => handleStatusChange(selectedTicket.id, "closed")}
                className="rounded-xl dark:border-gray-200 dark:bg-white dark:text-gray-900"
              >
                بستن تیکت
              </Button>
            )}

            <Button variant="ghost" size="icon" className="rounded-xl dark:text-gray-900">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <button
            onClick={() => setFilter("all")}
            className={`pb-2 border-b-2 transition-colors dark:text-gray-900 ${
              filter === "all"
                ? "border-blue-600 text-blue-600 font-medium"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            همه تیکت‌های فعال <span className="mr-1">({tickets.length})</span>
          </button>
          <button
            onClick={() => setFilter("open")}
            className={`pb-2 border-b-2 transition-colors dark:text-gray-900 ${
              filter === "open"
                ? "border-blue-600 text-blue-600 font-medium"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            باز <span className="mr-1">({openTicketCount})</span>
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`pb-2 border-b-2 transition-colors dark:text-gray-900 ${
              filter === "pending"
                ? "border-blue-600 text-blue-600 font-medium"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            در انتظار <span className="mr-1">({pendingTicketCount})</span>
          </button>
          <button
            onClick={() => setFilter("closed")}
            className={`pb-2 border-b-2 transition-colors dark:text-gray-900 ${
              filter === "closed"
                ? "border-blue-600 text-blue-600 font-medium"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            بسته <span className="mr-1">({closedTicketCount})</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-2/3 border-l dark:border-gray-200 overflow-y-auto bg-white dark:bg-white">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-50 border-b dark:border-gray-200 sticky top-0">
              <tr className="text-right text-xs font-medium text-gray-600 dark:text-gray-600 uppercase tracking-wider">
                <th className="p-4 w-12">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="p-4">شناسه</th>
                <th className="p-4">درخواست‌کننده</th>
                <th className="p-4">شماره تماس</th>
                <th className="p-4">اولویت</th>
                <th className="p-4">موضوع</th>
                <th className="p-4">وضعیت</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto dark:border-blue-600"></div>
                    <p className="text-gray-600 dark:text-gray-600 mt-3">در حال بارگذاری...</p>
                  </td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center">
                    <TicketIcon className="h-12 w-12 text-gray-400 dark:text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-600">تیکتی یافت نشد</p>
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    onClick={() => handleTicketSelect(ticket)}
                    className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-50 transition-colors ${
                      selectedTicket?.id === ticket.id ? "bg-blue-50 dark:bg-blue-50" : ""
                    }`}
                  >
                    <td className="p-4">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-900">#{ticket.id}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                          {ticket.user_name ? ticket.user_name.charAt(0).toUpperCase() : "؟"}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-900">
                            {ticket.user_name || "بدون نام"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-gray-700 dark:text-gray-700" dir="ltr">
                        {ticket.user_phone || "ندارد"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        {getPriorityIcon(ticket.priority || "medium")}
                        <span className="text-sm text-gray-700 dark:text-gray-700">
                          {getPriorityLabel(ticket.priority)}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-gray-900 dark:text-gray-900">{ticket.subject || "بدون موضوع"}</span>
                    </td>
                    <td className="p-4">{getStatusBadge(ticket.status)}</td>
                    <td className="p-4">
                      <button className="text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-600">
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="w-1/3 flex flex-col bg-white dark:bg-white">
          {selectedTicket ? (
            <>
              <div className="p-6 border-b dark:border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-lg font-medium">
                    {selectedTicket.user_name ? selectedTicket.user_name.charAt(0).toUpperCase() : "؟"}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-900">
                      {selectedTicket.user_name || "بدون نام"}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      کاربر: {selectedTicket.user_name || "نامشخص"}
                    </p>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start rounded-xl dark:border-gray-200 dark:bg-white dark:text-gray-900 bg-transparent"
                    >
                      وضعیت: {getStatusBadge(selectedTicket.status)}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-white dark:bg-white dark:border-gray-200 rounded-xl">
                    <DropdownMenuItem
                      onClick={() => handleStatusChange(selectedTicket.id, "open")}
                      className="dark:text-gray-900"
                    >
                      باز
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleStatusChange(selectedTicket.id, "pending")}
                      className="dark:text-gray-900"
                    >
                      در انتظار
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleStatusChange(selectedTicket.id, "closed")}
                      className="dark:text-gray-900"
                    >
                      بسته
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                    <span>
                      {new Date(selectedTicket.created_at).toLocaleDateString("fa-IR", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span>1194</span>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-50 rounded-xl p-4">
                    <p className="text-sm text-gray-800 dark:text-gray-800 leading-relaxed">{selectedTicket.message}</p>
                    {selectedTicket.image_url && (
                      <img
                        src={selectedTicket.image_url || "/placeholder.svg"}
                        alt="Attachment"
                        className="mt-3 rounded-xl max-w-full"
                      />
                    )}
                  </div>
                </div>

                {responses.map((response) => (
                  <div key={response.id} className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                      <span>
                        {new Date(response.created_at).toLocaleDateString("fa-IR", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <span>
                        {new Date(response.created_at).toLocaleTimeString("fa-IR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div
                      className={`rounded-xl p-4 ${
                        response.is_admin
                          ? "bg-white dark:bg-white border dark:border-gray-200"
                          : "bg-blue-50 dark:bg-blue-50"
                      }`}
                    >
                      <p className="text-sm text-gray-800 dark:text-gray-800 leading-relaxed">{response.message}</p>
                      {response.image_url && (
                        <img
                          src={response.image_url || "/placeholder.svg"}
                          alt="Attachment"
                          className="mt-3 rounded-xl max-w-full"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t dark:border-gray-200">
                {replyImagePreview && (
                  <div className="mb-2 relative">
                    <img src={replyImagePreview || "/placeholder.svg"} alt="Preview" className="h-20 rounded-xl" />
                    <button
                      onClick={() => {
                        setReplyImage(null)
                        setReplyImagePreview(null)
                      }}
                      className="absolute top-1 left-1 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <div className="flex items-end gap-2">
                  <Textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="پیام"
                    rows={2}
                    className="flex-1 rounded-xl resize-none dark:bg-white dark:border-gray-200 dark:text-gray-900 dark:placeholder:text-gray-400"
                  />
                  <input
                    type="file"
                    id="reply-image"
                    accept="image/*"
                    onChange={handleReplyImageChange}
                    className="hidden"
                  />
                  <label htmlFor="reply-image">
                    <Button type="button" variant="ghost" size="icon" className="rounded-xl dark:text-gray-900" asChild>
                      <div>
                        <Upload className="w-4 h-4" />
                      </div>
                    </Button>
                  </label>
                  <Button
                    onClick={handleSendReply}
                    disabled={isSubmitting || !replyMessage.trim()}
                    size="icon"
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-12 text-center">
              <div>
                <TicketIcon className="h-16 w-16 text-gray-400 dark:text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-900 mb-2">تیکتی انتخاب نشده</h3>
                <p className="text-gray-600 dark:text-gray-600">برای مشاهده جزئیات و پاسخ، یک تیکت را انتخاب کنید</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

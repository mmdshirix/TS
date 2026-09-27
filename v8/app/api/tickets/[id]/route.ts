import { type NextRequest, NextResponse } from "next/server"
import { getTicketById, updateTicketStatus, getTicketResponses, addTicketResponse } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ticketId = Number(params.id)
    const ticket = await getTicketById(ticketId)

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    const responses = await getTicketResponses(ticketId)
    return NextResponse.json({ ticket, responses })
  } catch (error) {
    console.error("Error fetching ticket:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ticketId = Number(params.id)
    const { status } = await request.json()

    if (!status) {
      return NextResponse.json({ error: "Missing status field" }, { status: 400 })
    }

    await updateTicketStatus(ticketId, status)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating ticket:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ticketId = Number(params.id)
    const body = await request.json()

    const { message, is_admin = false, image_url = null } = body

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Missing message field" }, { status: 400 })
    }

    await addTicketResponse(ticketId, message.trim(), is_admin, image_url || null)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error adding ticket response:", error)
    return NextResponse.json({ error: "خطا در ارسال پاسخ", details: String(error) }, { status: 500 })
  }
}

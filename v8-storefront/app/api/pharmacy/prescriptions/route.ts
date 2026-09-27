import { NextResponse, type NextRequest } from "next/server"
import { getStoreFromRequest } from "@/lib/store-context"
import { getPharmacySettings, createPrescriptionRequest } from "@/lib/pharmacy-db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  const store = await getStoreFromRequest(request)
  if (!store) return NextResponse.json({ error: "داروخانه یافت نشد" }, { status: 404 })
  const settings = await getPharmacySettings(store.id)
  if (!settings.accepts_prescriptions) return NextResponse.json({ error: "پذیرش نسخه آنلاین غیرفعال است" }, { status: 400 })

  const body = await request.json().catch(() => ({}))
  const name = String(body.name || "").trim()
  const phone = String(body.phone || "").replace(/\s|-/g, "")
  const images = Array.isArray(body.image_urls) ? body.image_urls.map(String).filter((u: string) => /^https?:\/\//.test(u)).slice(0, 5) : []
  const delivery = body.delivery === "delivery" && settings.delivery_enabled ? "delivery" : "pickup"

  if (name.length < 3) return NextResponse.json({ error: "نام را کامل وارد کنید" }, { status: 400 })
  if (!/^09\d{9}$/.test(phone)) return NextResponse.json({ error: "شماره موبایل معتبر نیست" }, { status: 400 })
  if (images.length === 0) return NextResponse.json({ error: "حداقل یک تصویر نسخه لازم است" }, { status: 400 })
  if (delivery === "delivery" && String(body.address || "").trim().length < 8) return NextResponse.json({ error: "آدرس را کامل وارد کنید" }, { status: 400 })

  try {
    const rx = await createPrescriptionRequest({
      store_id: store.id,
      store_slug: store.slug,
      customer_name: name,
      customer_phone: phone,
      national_id: body.national_id || null,
      insurance_type: body.insurance || null,
      delivery_method: delivery,
      address: delivery === "delivery" ? String(body.address).trim() : null,
      image_urls: images,
      notes: body.notes || null,
    })
    return NextResponse.json({ requestNumber: rx.request_number })
  } catch (e) {
    console.error("[prescriptions]", e)
    return NextResponse.json({ error: "خطا در ثبت نسخه" }, { status: 500 })
  }
}

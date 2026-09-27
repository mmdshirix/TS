import { NextResponse, type NextRequest } from "next/server"
import { getStoreFromRequest } from "@/lib/store-context"
import { listDoctors, getClinicSettings } from "@/lib/clinic-db"
import { ask, extractJson } from "@/lib/ai"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const EMERGENCY_PATTERNS = /(درد قفسه سینه|تنگی نفس شدید|بیهوش|خونریزی شدید|تشنج|سکته|فلج|نفس نمی)/

export async function POST(request: NextRequest) {
  const store = await getStoreFromRequest(request)
  if (!store) return NextResponse.json({ error: "مطب یافت نشد" }, { status: 404 })

  const body = await request.json().catch(() => ({}))
  const symptoms = String(body.symptoms || "").trim().slice(0, 800)
  const age = Number(body.age) || undefined
  if (symptoms.length < 3) return NextResponse.json({ error: "علائم را کامل‌تر بنویسید" }, { status: 400 })

  const [doctors, settings] = await Promise.all([listDoctors(store.id), getClinicSettings(store.id)])
  if (!settings.ai_triage_enabled) return NextResponse.json({ error: "راهنمای هوشمند در این مطب فعال نیست" }, { status: 400 })

  const specialties = Array.from(new Set(doctors.map((d) => d.specialty)))
  const doctorList = doctors.map((d) => `- ${d.name} | تخصص: ${d.specialty} | slug: ${d.slug}${d.keywords ? ` | کلیدواژه‌ها: ${d.keywords}` : ""}`).join("\n")

  const system = `تو راهنمای هوشمند یک مطب/کلینیک به نام "${store.name}" هستی. وظیفه‌ات فقط راهنمایی اولیه و هدایت بیمار به تخصص و پزشک مناسب از بین پزشکان همین مطب است.
قوانین:
- هیچ تشخیص قطعی یا نسخه دارویی نده.
- اگر علائم خطرناک است (درد قفسه سینه، تنگی نفس شدید، خونریزی شدید، کاهش هوشیاری، تشنج) urgency را "emergency" بگذار.
- تخصص را از بین این موارد انتخاب کن: ${specialties.length ? specialties.join("، ") : "پزشک عمومی، داخلی، قلب و عروق، پوست و مو، کودکان، زنان، ارتوپدی، گوش و حلق و بینی، چشم، اعصاب، روانپزشکی، تغذیه"}
- اگر پزشکی در فهرست با آن تخصص وجود دارد، slug او را در doctor_slug و نامش را در doctor_name بگذار؛ در غیر این صورت null.
- پاسخ کوتاه، آرام و به فارسی روان.
پزشکان مطب:
${doctorList || "(هنوز پزشکی ثبت نشده است)"}

فقط یک JSON با این ساختار برگردان:
{"summary":"خلاصه ۱-۲ جمله‌ای از علائم و برداشت اولیه","urgency":"low|medium|high|emergency","specialty":"نام تخصص","specialty_slug":"slug یا null","doctor_slug":"slug یا null","doctor_name":"نام یا null","advice":["۲ تا ۴ توصیه عملی کوتاه"],"red_flags":["علائم خطری که باید فوراً به اورژانس مراجعه شود"],"disclaimer":"یک جمله"}`

  const user = `علائم بیمار: ${symptoms}${age ? `\nسن: ${age} سال` : ""}`

  try {
    const text = await ask([{ role: "system", content: system }, { role: "user", content: user }], { temperature: 0.2, maxTokens: 550, timeoutMs: 18_000 })
    const parsed = extractJson<any>(text)
    if (!parsed) throw new Error("bad json")

    // Never let the model downgrade obviously emergency wording.
    if (EMERGENCY_PATTERNS.test(symptoms)) parsed.urgency = "emergency"
    const doctor = doctors.find((d) => d.slug === parsed.doctor_slug) || doctors.find((d) => d.specialty === parsed.specialty) || null

    return NextResponse.json({
      result: {
        summary: String(parsed.summary || ""),
        urgency: ["low", "medium", "high", "emergency"].includes(parsed.urgency) ? parsed.urgency : "low",
        specialty: String(parsed.specialty || doctor?.specialty || "پزشک عمومی"),
        specialty_slug: doctor?.specialty_slug || parsed.specialty_slug || null,
        doctor_slug: doctor?.slug || null,
        doctor_name: doctor?.name || null,
        advice: Array.isArray(parsed.advice) ? parsed.advice.slice(0, 4).map(String) : [],
        red_flags: Array.isArray(parsed.red_flags) ? parsed.red_flags.slice(0, 4).map(String) : [],
        disclaimer: String(parsed.disclaimer || "این راهنما جایگزین معاینه پزشک نیست."),
      },
    })
  } catch (e) {
    console.error("[triage]", e)
    // Rule-based fallback keeps the flow usable even when AI is unreachable.
    const lower = symptoms
    const pick = (re: RegExp, name: string) => (re.test(lower) ? name : null)
    const specialty =
      pick(/قلب|قفسه سینه|تپش/, "قلب و عروق") ||
      pick(/پوست|جوش|لک|خارش|مو/, "پوست و مو") ||
      pick(/کودک|بچه|نوزاد/, "کودکان") ||
      pick(/معده|شکم|اسهال|تهوع/, "داخلی") ||
      pick(/زانو|کمر|مفصل|شکستگی/, "ارتوپدی") ||
      pick(/چشم|بینایی/, "چشم") ||
      pick(/گوش|حلق|بینی|سینوس/, "گوش و حلق و بینی") ||
      "پزشک عمومی"
    const doctor = doctors.find((d) => d.specialty === specialty) || doctors[0] || null
    return NextResponse.json({
      result: {
        summary: "بر اساس علائم شما، تخصص زیر پیشنهاد می‌شود. برای بررسی دقیق‌تر نوبت بگیرید.",
        urgency: EMERGENCY_PATTERNS.test(symptoms) ? "emergency" : "medium",
        specialty: doctor?.specialty || specialty,
        specialty_slug: doctor?.specialty_slug || null,
        doctor_slug: doctor?.slug || null,
        doctor_name: doctor?.name || null,
        advice: ["استراحت کافی و مصرف مایعات", "علائم خود را تا زمان ویزیت یادداشت کنید"],
        red_flags: ["تنگی نفس شدید", "درد قفسه سینه", "کاهش سطح هوشیاری"],
        disclaimer: "این راهنما جایگزین معاینه پزشک نیست.",
      },
    })
  }
}

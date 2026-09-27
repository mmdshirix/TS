// SMS.ir Verify (OTP) API — https://app.sms.ir/developer/verify
const VERIFY_URL = "https://api.sms.ir/v1/send/verify"

export async function sendSmsIrOtp(params: {
  apiKey: string
  templateId: string
  mobile: string
  code: string
}): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": params.apiKey },
      body: JSON.stringify({
        mobile: params.mobile,
        templateId: Number(params.templateId),
        parameters: [{ name: "CODE", value: params.code }],
      }),
    })
    const data = await res.json()

    if (data?.status === 1) {
      return { success: true }
    }
    return { success: false, error: data?.message || "خطا در ارسال پیامک تایید" }
  } catch (error) {
    console.error("SMS.ir send error:", error)
    return { success: false, error: "خطا در اتصال به سرویس پیامکی" }
  }
}

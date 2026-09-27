// MeliPayamak pattern-based (OTP) SMS API — https://www.melipayamak.com/api/send/shared/
const SEND_URL = "https://rest.payamak-panel.com/api/SendSMS/BaseServiceNumber"

export async function sendMelipayamakOtp(params: {
  username: string
  password: string
  bodyId: string
  mobile: string
  code: string
}): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const res = await fetch(SEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: params.username,
        password: params.password,
        text: params.code,
        to: params.mobile,
        bodyId: Number(params.bodyId),
      }),
    })
    const data = await res.json()

    // MeliPayamak returns a numeric RecId (> 0) on success, or a negative error code.
    if (data?.Value && Number(data.Value) > 0) {
      return { success: true }
    }
    return { success: false, error: `خطا در ارسال پیامک تایید (کد ${data?.Value ?? "نامشخص"})` }
  } catch (error) {
    console.error("MeliPayamak send error:", error)
    return { success: false, error: "خطا در اتصال به سرویس پیامکی" }
  }
}

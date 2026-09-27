// Zarinpal REST API v4 (stable, publicly documented). Amounts in this app are stored
// in Toman everywhere (matches existing UI); Zarinpal v4 expects Rial, so every amount
// crossing this boundary is multiplied by 10.

const REQUEST_URL = "https://api.zarinpal.com/pg/v4/payment/request.json"
const VERIFY_URL = "https://api.zarinpal.com/pg/v4/payment/verify.json"
const STARTPAY_URL = "https://www.zarinpal.com/pg/StartPay"

export async function requestZarinpalPayment(params: {
  merchantId: string
  amountToman: number
  description: string
  callbackUrl: string
  mobile?: string
}): Promise<{ success: true; authority: string; paymentUrl: string } | { success: false; error: string }> {
  try {
    const res = await fetch(REQUEST_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant_id: params.merchantId,
        amount: params.amountToman * 10,
        description: params.description,
        callback_url: params.callbackUrl,
        metadata: params.mobile ? { mobile: params.mobile } : undefined,
      }),
    })
    const data = await res.json()

    if (data?.data?.code === 100 && data.data.authority) {
      return { success: true, authority: data.data.authority, paymentUrl: `${STARTPAY_URL}/${data.data.authority}` }
    }
    return { success: false, error: data?.errors?.message || "خطا در اتصال به درگاه زرین‌پال" }
  } catch (error) {
    console.error("Zarinpal request error:", error)
    return { success: false, error: "خطا در اتصال به درگاه زرین‌پال" }
  }
}

export async function verifyZarinpalPayment(params: {
  merchantId: string
  amountToman: number
  authority: string
}): Promise<{ success: true; refId: string } | { success: false; error: string }> {
  try {
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant_id: params.merchantId,
        amount: params.amountToman * 10,
        authority: params.authority,
      }),
    })
    const data = await res.json()

    // code 100 = verified now, 101 = already verified earlier (still a success, avoids
    // double-processing if the callback is hit more than once)
    if (data?.data?.code === 100 || data?.data?.code === 101) {
      return { success: true, refId: String(data.data.ref_id) }
    }
    return { success: false, error: data?.errors?.message || "پرداخت تایید نشد" }
  } catch (error) {
    console.error("Zarinpal verify error:", error)
    return { success: false, error: "خطا در تایید پرداخت" }
  }
}

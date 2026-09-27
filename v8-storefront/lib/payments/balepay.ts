// BalePay wallet payments, per the docs in v8/bale pay.txt.
//
// Two important, doc-confirmed constraints this wrapper works within:
// 1. createInvoiceLink's result is only usable via Bale.WebApp.openInvoice() inside an
//    actual Bale Mini App (the storefront running in an iframe/webview inside the Bale
//    client) — it is NOT a plain URL you can redirect a normal browser tab to. Callers
//    must gate this gateway behind a `window.Bale?.WebApp` presence check.
// 2. Bale's bot HTTP API follows the same shape as Telegram's Bot API
//    (https://tapi.bale.ai/bot<TOKEN>/<method>, {ok, result} envelope) — the doc states
//    inquireTransaction specifically requires a raw HTTP call "like the others", implying
//    the others (createInvoiceLink, sendInvoice) follow that same convention. This isn't
//    spelled out with a literal example in the source doc, so treat this base URL as the
//    best-supported inference and confirm against a real bot token before going live.
//
// The single `balepay_bot_token` configured per store is used both as the API path token
// and as the `provider_token` payment field — the doc doesn't clearly distinguish a
// separate wallet-payment token from the bot's own token, and only mentions one token
// obtained from @botfather "for your bot".

const API_BASE = "https://tapi.bale.ai/bot"

function apiUrl(token: string, method: string) {
  return `${API_BASE}${token}/${method}`
}

export async function createBaleInvoiceLink(params: {
  botToken: string
  title: string
  description: string
  payload: string
  amountToman: number
}): Promise<{ success: true; invoiceLink: string } | { success: false; error: string }> {
  try {
    const res = await fetch(apiUrl(params.botToken, "createInvoiceLink"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: params.title.slice(0, 32),
        description: params.description.slice(0, 255),
        payload: params.payload.slice(0, 128),
        provider_token: params.botToken,
        prices: [{ label: params.title.slice(0, 32), amount: params.amountToman * 10 }],
      }),
    })
    const data = await res.json()

    if (data?.ok && data.result) {
      return { success: true, invoiceLink: data.result }
    }
    return { success: false, error: data?.description || "خطا در ایجاد لینک پرداخت بله‌پی" }
  } catch (error) {
    console.error("BalePay createInvoiceLink error:", error)
    return { success: false, error: "خطا در اتصال به بله‌پی" }
  }
}

export async function inquireBaleTransaction(
  botToken: string,
  transactionId: string,
): Promise<{ success: true; status: "pending" | "paid" | "failed" | "rejected"; amount: number } | { success: false; error: string }> {
  try {
    const res = await fetch(apiUrl(botToken, "inquireTransaction"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transaction_id: transactionId }),
    })
    const data = await res.json()

    if (data?.ok && data.result) {
      return { success: true, status: data.result.status, amount: data.result.amount }
    }
    return { success: false, error: data?.description || "خطا در استعلام تراکنش بله‌پی" }
  } catch (error) {
    console.error("BalePay inquireTransaction error:", error)
    return { success: false, error: "خطا در اتصال به بله‌پی" }
  }
}

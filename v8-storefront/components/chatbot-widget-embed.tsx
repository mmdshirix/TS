"use client"

import Script from "next/script"

// Loads the existing, unmodified TalkSell chat widget (platform-talksell.ir/widget-loader.js)
// using its documented embed contract: a <script> tag with data-chatbot-id, auto-detected
// by the widget's own autoInit(). This is the "AI Chatbot access point" required on every
// storefront page — the widget renders its own floating launcher button.
export default function ChatbotWidgetEmbed({ chatbotId, autoOpen }: { chatbotId: number; autoOpen?: boolean }) {
  const platformUrl = process.env.NEXT_PUBLIC_PLATFORM_URL || "https://platform-talksell.ir"

  return (
    <Script
      src={`${platformUrl}/widget-loader.js`}
      data-chatbot-id={String(chatbotId)}
      data-auto-open={autoOpen ? "true" : undefined}
      strategy="afterInteractive"
    />
  )
}

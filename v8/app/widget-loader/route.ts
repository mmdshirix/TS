import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const chatbotId = searchParams.get("id")

  if (!chatbotId) {
    return new Response("Chatbot ID is required", { status: 400 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  const script = `
    (function() {
      console.log('[Widget Loader] Initializing for chatbot ID:', '${chatbotId}');
      
      const LAUNCHER_IFRAME_ID = 'chatbot-launcher-iframe';
      
      // Avoid creating duplicate iframes
      if (document.getElementById(LAUNCHER_IFRAME_ID)) {
        console.warn('[Widget Loader] Launcher iframe already exists. Aborting.');
        return;
      }

      const iframe = document.createElement('iframe');
      iframe.id = LAUNCHER_IFRAME_ID;
      const iframeSrc = \`${appUrl}/launcher/${chatbotId}\`;
      console.log('[Widget Loader] Setting iframe source to:', iframeSrc);
      iframe.src = iframeSrc;
      
      iframe.style.position = 'fixed';
      iframe.style.bottom = '0';
      iframe.style.right = '0';
      iframe.style.width = '100px';
      iframe.style.height = '100px';
      iframe.style.border = 'none';
      iframe.style.zIndex = '9999';
      iframe.style.backgroundColor = 'transparent';

      iframe.onload = () => {
        console.log('[Widget Loader] Iframe loaded successfully.');
      };
      
      iframe.onerror = (error) => {
        console.error('[Widget Loader] Failed to load iframe:', error);
      };

      document.body.appendChild(iframe);
      console.log('[Widget Loader] Iframe appended to the document body.');
    })();
  `

  return new NextResponse(script, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "no-store, max-age=0", // Prevent caching
    },
  })
}

import type React from "react"
import type { Viewport } from "next"
import "@/app/widget/[id]/widget.css"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
}

export default function WidgetLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div 
      id="widget-root" 
      className="widget-no-scroll"
      style={{
        visibility: "visible",
        opacity: 1,
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: "#ffffff",
      }}
    >
      {children}
    </div>
  )
}

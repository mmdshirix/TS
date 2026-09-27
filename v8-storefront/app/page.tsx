import { Sparkles } from "lucide-react"
import AcidSquares from "@/components/effects/acid-squares"

export default function MarketingLandingPage() {
  const platformUrl = process.env.NEXT_PUBLIC_PLATFORM_URL || "https://platform-talksell.ir"
  const marketingUrl = process.env.NEXT_PUBLIC_MARKETING_URL || "https://talksell.ir"

  return (
    <main className="h-screen w-full overflow-hidden flex items-center justify-center bg-[#050510] relative font-iran-sans">
      <div className="absolute inset-0">
        <AcidSquares
          color1="#5227FF"
          color2="#2e2ddb"
          color3="#FFFFFF"
          detail="medium"
          speed={0.7}
          waveDepth={1}
          zoom={1.3}
          density={10.0}
          glow={1.0}
          exposure={2700}
          spread={0.3}
          stepSize={0.002}
          colorShift={0}
          contrast={1}
          brightness={1.0}
          opacity={1.0}
          mouseInteraction={true}
          mouseStrength={0.1}
          mouseRadius={0.35}
          blur={0}
          grain={true}
          grainIntensity={0.05}
        />
      </div>

      <div className="relative text-center px-6 max-w-2xl pointer-events-none">
        <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white mb-4 text-balance">
          تاکسل، فروشگاه مبتنی بر هوش مصنوعی
        </h1>
        <p className="text-base sm:text-xl text-white/80 mb-10 text-balance font-medium">
          راهی مدیر برای توسعه و رشد کسب‌وکارهای آنلاین با هوش مصنوعی
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pointer-events-auto">
          <a
            href={`${platformUrl}/login`}
            className="w-full sm:w-auto bg-white text-indigo-700 px-8 py-3.5 rounded-2xl font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            همین الان شروع کنید
          </a>
          <a
            href={marketingUrl}
            className="w-full sm:w-auto border-2 border-white/60 text-white px-8 py-3.5 rounded-2xl font-medium hover:bg-white/10 transition-all"
          >
            مشاهده وبسایت تاکسل
          </a>
        </div>
      </div>
    </main>
  )
}

interface CtaConfig {
  text?: string
  link_url?: string
  style?: "primary" | "outline"
}

export default function CtaButtonBlock({ config }: { config: CtaConfig }) {
  if (!config.text) return null

  return (
    <section className="container py-10 text-center">
      <a
        href={config.link_url || "/shop"}
        className={
          config.style === "outline"
            ? "inline-block border-2 border-brand text-brand px-8 py-3 rounded-brand font-medium hover:bg-brand hover:text-white transition-colors"
            : "inline-block bg-brand text-white px-8 py-3 rounded-brand font-medium hover:opacity-90 transition-opacity"
        }
      >
        {config.text}
      </a>
    </section>
  )
}

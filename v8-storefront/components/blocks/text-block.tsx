export default function TextBlock({ config }: { config: { title?: string; body?: string } }) {
  if (!config.title && !config.body) return null
  return (
    <section className="container py-10 text-center max-w-2xl">
      {config.title && <h2 className="text-xl font-bold text-gray-900 mb-3">{config.title}</h2>}
      {config.body && <p className="text-gray-600 leading-relaxed whitespace-pre-line">{config.body}</p>}
    </section>
  )
}

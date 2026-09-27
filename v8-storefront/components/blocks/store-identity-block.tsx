import type { Store } from "@/lib/db"

export default function StoreIdentityBlock({ store }: { store: Store; config: Record<string, any> }) {
  return (
    <section className="py-10 text-center border-b">
      {store.logo_url && (
        <img src={store.logo_url || "/placeholder.svg"} alt={store.name} className="w-20 h-20 rounded-2xl object-cover mx-auto mb-4" />
      )}
      <h1 className="text-2xl font-bold text-gray-900">{store.name}</h1>
      {store.description && <p className="text-gray-500 mt-2 max-w-xl mx-auto">{store.description}</p>}
    </section>
  )
}

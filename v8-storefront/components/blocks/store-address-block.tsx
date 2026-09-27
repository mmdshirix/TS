import type { Store } from "@/lib/db"
import { MapPin } from "lucide-react"

export default function StoreAddressBlock({ store, config }: { store: Store; config: { show_map?: boolean } }) {
  if (!store.contact_address) return null

  return (
    <section className="container py-10 max-w-xl text-center">
      <div className="flex items-center justify-center gap-2 text-gray-700 mb-4">
        <MapPin className="w-4 h-4 text-brand flex-shrink-0" />
        <p>{store.contact_address}</p>
      </div>
      {config.show_map && (
        <div className="rounded-2xl overflow-hidden border h-64">
          <iframe
            title="نقشه"
            className="w-full h-full"
            loading="lazy"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(store.contact_address)}&output=embed`}
          />
        </div>
      )}
    </section>
  )
}

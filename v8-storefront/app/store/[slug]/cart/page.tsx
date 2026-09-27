import { notFound } from "next/navigation"
import { getStoreBySlug } from "@/lib/db"
import CartPageClient from "@/components/cart-page-client"

export default async function CartPage({ params }: { params: { slug: string } }) {
  const store = await getStoreBySlug(params.slug)
  if (!store) {
    notFound()
  }

  return <CartPageClient />
}

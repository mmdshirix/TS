import { notFound } from "next/navigation"
import { getStoreBySlug } from "@/lib/db"
import { getOrderByNumber, getOrderItemsByOrderId, getCardToCardInfo } from "@/lib/commerce-db"
import OrderStatus from "@/components/order-status"

export default async function OrderStatusPage({
  params,
}: {
  params: { slug: string; orderNumber: string }
}) {
  const store = await getStoreBySlug(params.slug)
  if (!store) {
    notFound()
  }

  const order = await getOrderByNumber(store.id, params.orderNumber)
  if (!order) {
    notFound()
  }

  const items = await getOrderItemsByOrderId(order.id)
  const cardInfo = order.payment_method === "card_to_card" ? await getCardToCardInfo(store.id) : null

  return <OrderStatus order={order} items={items} cardInfo={cardInfo} />
}

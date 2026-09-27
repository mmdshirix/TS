import { redirect, notFound } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getStoreByUserId, getProduct, getStoreById, listCategoriesByStore, listProductImages } from "@/lib/store-db"
import StoreProductEditForm from "@/components/store-product-edit-form"

export default async function StoreProductEditPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }

  const store = await getStoreByUserId(user.id)
  if (!store) {
    redirect("/dashboard/store/create")
  }

  const product = await getProduct(Number(params.id))
  if (!product) {
    notFound()
  }

  const productStore = await getStoreById(product.store_id)
  if (!productStore || productStore.user_id !== user.id) {
    notFound()
  }

  const [categories, images] = await Promise.all([listCategoriesByStore(store.id), listProductImages(product.id)])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">ویرایش محصول</h1>
        <p className="text-gray-600 mt-1">{product.name}</p>
      </div>
      <StoreProductEditForm product={product} categories={categories} initialImageUrl={images[0]?.url || ""} />
    </div>
  )
}

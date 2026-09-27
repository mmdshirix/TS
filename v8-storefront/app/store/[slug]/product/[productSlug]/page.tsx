import { notFound } from "next/navigation"
import { getStoreBySlug, getProductBySlug, listProductImages, listProductVariants } from "@/lib/db"
import ProductDetail from "@/components/product-detail"

export default async function ProductPage({ params }: { params: { slug: string; productSlug: string } }) {
  const store = await getStoreBySlug(params.slug)
  if (!store) {
    notFound()
  }

  const product = await getProductBySlug(store.id, params.productSlug)
  if (!product) {
    notFound()
  }

  const [images, variants] = await Promise.all([listProductImages(product.id), listProductVariants(product.id)])

  return <ProductDetail product={product} images={images} variants={variants} />
}

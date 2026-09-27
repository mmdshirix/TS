import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getStoreBySlug, getProductBySlug, listProductImages, listProductVariants, listProductsWithImages } from "@/lib/db"
import { getTheme } from "@/lib/themes"
import { buildStoreMetadata, BreadcrumbJsonLd, ProductJsonLd, storeBaseUrl } from "@/lib/seo"
import ProductDetail from "@/components/product-detail"
import { SectionHeading, ProductGrid } from "@/components/themes/shared"

export async function generateMetadata({ params }: { params: { slug: string; productSlug: string } }): Promise<Metadata> {
  const store = await getStoreBySlug(params.slug)
  if (!store) return {}
  const product = await getProductBySlug(store.id, params.productSlug)
  if (!product) return {}
  const images = await listProductImages(product.id)
  return buildStoreMetadata(store, {
    path: `/product/${params.productSlug}`,
    title: product.meta_title || product.name,
    description: product.meta_description || product.description || `${product.name} — خرید از ${store.name}`,
    image: images[0]?.url,
    type: "product",
  })
}

export default async function ProductPage({ params }: { params: { slug: string; productSlug: string } }) {
  const store = await getStoreBySlug(params.slug)
  if (!store) notFound()
  const product = await getProductBySlug(store.id, params.productSlug)
  if (!product) notFound()
  const theme = getTheme(store.theme_id || store.category)

  const [images, variants, related] = await Promise.all([
    listProductImages(product.id),
    listProductVariants(product.id),
    listProductsWithImages(store.id, { limit: 5, categoryId: product.category_id, sort: "popular" }),
  ])
  const base = storeBaseUrl(store)
  const relatedProducts = related.filter((p) => p.id !== product.id).slice(0, 4)

  return (
    <>
      <ProductJsonLd store={store} product={product} image={images[0]?.url || null} base={base} />
      <BreadcrumbJsonLd items={[{ name: store.name, url: base }, { name: theme.shopLabel, url: `${base}/shop` }, { name: product.name, url: `${base}/product/${product.slug}` }]} />
      <ProductDetail product={product} images={images} variants={variants} />
      {relatedProducts.length > 0 && (
        <section className="container pb-16">
          <SectionHeading eyebrow="مرتبط" title="شاید بپسندید" action={{ href: "/shop", label: "همه محصولات" }} />
          <ProductGrid products={relatedProducts} variant={theme.card} />
        </section>
      )}
    </>
  )
}

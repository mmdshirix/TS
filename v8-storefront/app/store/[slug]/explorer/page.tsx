import { notFound } from "next/navigation"
import { getStoreBySlug, listExplorerPosts, listExplorerPostProducts } from "@/lib/db"
import ExplorerFeed from "@/components/explorer-feed"

export default async function ExplorerPage({ params }: { params: { slug: string } }) {
  const store = await getStoreBySlug(params.slug)
  if (!store) notFound()

  const { posts, nextCursor } = await listExplorerPosts(store.id)
  const postsWithProducts = await Promise.all(
    posts.map(async (post) => ({ ...post, products: await listExplorerPostProducts(post.id) })),
  )

  return <ExplorerFeed initialPosts={postsWithProducts} initialNextCursor={nextCursor} />
}

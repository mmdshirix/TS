export function findMatchingProducts(userMessage: string, products: any[]): any[] {
  if (!userMessage || !products || products.length === 0) {
    return []
  }

  const message = userMessage.toLowerCase()
  const matchedProducts: any[] = []

  products.forEach((product) => {
    const productName = product.name?.toLowerCase() || ""
    const productDescription = product.description?.toLowerCase() || ""

    // جستجو در نام محصول - بالاترین اولویت
    if (productName.includes(message) || message.includes(productName)) {
      matchedProducts.push({ ...product, score: 10 })
      return
    }

    // جستجو در توضیحات محصول - اولویت متوسط
    if (productDescription.includes(message)) {
      matchedProducts.push({ ...product, score: 5 })
      return
    }

    // جستجوی کلمات کلیدی
    const keywords = message.split(" ").filter((word) => word.length > 2)
    let keywordMatches = 0

    keywords.forEach((keyword) => {
      if (productName.includes(keyword) || productDescription.includes(keyword)) {
        keywordMatches++
      }
    })

    if (keywordMatches > 0) {
      matchedProducts.push({ ...product, score: keywordMatches })
    }
  })

  // مرتب‌سازی بر اساس امتیاز و برگرداندن حداکثر 3 محصول
  return matchedProducts
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ score, ...product }) => product)
}

export function matchProducts(userMessage: string, products: any[]): any[] {
  return findMatchingProducts(userMessage, products)
}

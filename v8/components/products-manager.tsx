"use client"

import type React from "react"
import { useState } from "react"
import type { ChatbotProduct } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, MoveUp, MoveDown, Upload, Download, Eye, Link } from "lucide-react"

interface ProductsManagerProps {
  products: Partial<ChatbotProduct>[]
  setProducts: React.Dispatch<React.SetStateAction<Partial<ChatbotProduct>[]>>
}

export default function ProductsManager({ products, setProducts }: ProductsManagerProps) {
  const [showJsonImport, setShowJsonImport] = useState(false)
  const [jsonInput, setJsonInput] = useState("")
  const [showPreview, setShowPreview] = useState(false)

  // Handle product field changes
  const handleProductChange = (index: number, field: keyof ChatbotProduct, value: string | number) => {
    setProducts((prev) => {
      const newProducts = [...prev]
      newProducts[index] = { ...newProducts[index], [field]: value }
      return newProducts
    })
  }

  // Add new product
  const addProduct = () => {
    setProducts((prev) => [
      ...prev,
      {
        name: "",
        description: "",
        image_url: "",
        price: 0,
        position: prev.length,
        button_text: "افزودن به سبد",
        secondary_text: "اطلاعات بیشتر",
        product_url: "",
      },
    ])
  }

  // Remove product
  const removeProduct = (index: number) => {
    setProducts((prev) => prev.filter((_, i) => i !== index))
  }

  // Move product up
  const moveProductUp = (index: number) => {
    if (index === 0) return
    setProducts((prev) => {
      const newProducts = [...prev]
      const temp = newProducts[index]
      newProducts[index] = newProducts[index - 1]
      newProducts[index - 1] = temp
      return newProducts.map((product, i) => ({ ...product, position: i }))
    })
  }

  // Move product down
  const moveProductDown = (index: number) => {
    if (index === products.length - 1) return
    setProducts((prev) => {
      const newProducts = [...prev]
      const temp = newProducts[index]
      newProducts[index] = newProducts[index + 1]
      newProducts[index + 1] = temp
      return newProducts.map((product, i) => ({ ...product, position: i }))
    })
  }

  // Import products from JSON
  const handleJsonImport = () => {
    try {
      const parsedProducts = JSON.parse(jsonInput)
      if (Array.isArray(parsedProducts)) {
        const validatedProducts = parsedProducts.map((product, index) => ({
          name: product.name || "",
          description: product.description || "",
          image_url: product.image_url || "",
          price: Number(product.price) || 0,
          position: index,
          button_text: product.button_text || "افزودن به سبد",
          secondary_text: product.secondary_text || "اطلاعات بیشتر",
          product_url: product.product_url || "",
        }))
        setProducts(validatedProducts)
        setJsonInput("")
        setShowJsonImport(false)
      } else {
        alert("فرمت JSON نامعتبر است. باید آرایه‌ای از محصولات باشد.")
      }
    } catch (error) {
      alert("خطا در پردازش JSON: " + (error instanceof Error ? error.message : "خطای نامشخص"))
    }
  }

  // Export products to JSON
  const handleJsonExport = () => {
    const exportData = products.map(({ id, chatbot_id, position, ...product }) => product)
    const jsonString = JSON.stringify(exportData, null, 2)
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "products.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Sample JSON structure
  const sampleJson = `[
  {
    "name": "محصول شماره ۱",
    "description": "توضیحات محصول شماره ۱",
    "image_url": "https://example.com/image1.jpg",
    "price": 150000,
    "button_text": "خرید",
    "secondary_text": "اطلاعات بیشتر",
    "product_url": "https://example.com/product1"
  },
  {
    "name": "محصول شماره ۲",
    "description": "توضیحات محصول شماره ۲",
    "image_url": "https://example.com/image2.jpg",
    "price": 250000,
    "button_text": "افزودن به سبد",
    "secondary_text": "اطلاعات بیشتر",
    "product_url": "https://example.com/product2"
  }
]`

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">مدیریت محصولات فروشگاه</h3>
        <div className="flex gap-2">
          <Button type="button" onClick={() => setShowPreview(!showPreview)} variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            {showPreview ? "مخفی کردن پیش‌نمایش" : "پیش‌نمایش"}
          </Button>
          <Button type="button" onClick={handleJsonExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            خروجی JSON
          </Button>
          <Button type="button" onClick={() => setShowJsonImport(!showJsonImport)} variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            وارد کردن JSON
          </Button>
          <Button type="button" onClick={addProduct} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            افزودن محصول
          </Button>
        </div>
      </div>

      {/* JSON Import Section */}
      {showJsonImport && (
        <div className="border rounded-lg p-4 bg-blue-50">
          <h4 className="font-medium mb-2">وارد کردن محصولات از JSON</h4>
          <div className="space-y-3">
            <Textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="JSON محصولات را اینجا وارد کنید..."
              rows={6}
              className="font-mono text-sm"
            />
            <div className="flex gap-2">
              <Button type="button" onClick={handleJsonImport} size="sm">
                وارد کردن
              </Button>
              <Button type="button" onClick={() => setJsonInput(sampleJson)} variant="outline" size="sm">
                نمونه JSON
              </Button>
              <Button type="button" onClick={() => setShowJsonImport(false)} variant="ghost" size="sm">
                انصراف
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Section */}
      {showPreview && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="font-medium mb-4">پیش‌نمایش فروشگاه</h4>
          <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
            {products.map((product, index) => (
              <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm border">
                <div className="h-20 bg-gray-200 flex items-center justify-center">
                  {product.image_url ? (
                    <img
                      src={product.image_url || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 text-xs">بدون تصویر</span>
                  )}
                </div>
                <div className="p-2">
                  <h5 className="font-medium text-xs truncate">{product.name || "بدون نام"}</h5>
                  {product.price && <p className="text-xs font-bold mt-1">{product.price.toLocaleString()} تومان</p>}
                  <button className="mt-1 w-full bg-blue-600 text-white text-xs py-1 rounded-md">
                    {product.button_text || "افزودن به سبد"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Products List */}
      <div className="space-y-4">
        {products.map((product, index) => (
          <div key={index} className="border rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium">محصول {index + 1}</h4>
              <div className="flex gap-1">
                <Button
                  type="button"
                  onClick={() => moveProductUp(index)}
                  variant="ghost"
                  size="sm"
                  disabled={index === 0}
                >
                  <MoveUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  onClick={() => moveProductDown(index)}
                  variant="ghost"
                  size="sm"
                  disabled={index === products.length - 1}
                >
                  <MoveDown className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  onClick={() => removeProduct(index)}
                  variant="ghost"
                  size="sm"
                  className="text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`product-name-${index}`}>نام محصول</Label>
                <Input
                  id={`product-name-${index}`}
                  value={product.name || ""}
                  onChange={(e) => handleProductChange(index, "name", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor={`product-price-${index}`}>قیمت (تومان)</Label>
                <Input
                  id={`product-price-${index}`}
                  type="number"
                  value={product.price || ""}
                  onChange={(e) => handleProductChange(index, "price", Number(e.target.value))}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor={`product-description-${index}`}>توضیحات</Label>
                <Textarea
                  id={`product-description-${index}`}
                  value={product.description || ""}
                  onChange={(e) => handleProductChange(index, "description", e.target.value)}
                  rows={2}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor={`product-image-${index}`}>آدرس تصویر</Label>
                <Input
                  id={`product-image-${index}`}
                  value={product.image_url || ""}
                  onChange={(e) => handleProductChange(index, "image_url", e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor={`product-url-${index}`} className="flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  لینک محصول
                </Label>
                <Input
                  id={`product-url-${index}`}
                  value={product.product_url || ""}
                  onChange={(e) => handleProductChange(index, "product_url", e.target.value)}
                  placeholder="https://example.com/product"
                />
              </div>
              <div>
                <Label htmlFor={`product-button-${index}`}>متن دکمه اصلی</Label>
                <Input
                  id={`product-button-${index}`}
                  value={product.button_text || ""}
                  onChange={(e) => handleProductChange(index, "button_text", e.target.value)}
                  placeholder="افزودن به سبد"
                />
              </div>
              <div>
                <Label htmlFor={`product-secondary-${index}`}>متن دکمه ثانویه</Label>
                <Input
                  id={`product-secondary-${index}`}
                  value={product.secondary_text || ""}
                  onChange={(e) => handleProductChange(index, "secondary_text", e.target.value)}
                  placeholder="اطلاعات بیشتر"
                />
              </div>
            </div>

            {/* Product Preview */}
            <div className="mt-4 p-3 bg-white rounded-lg border">
              <div className="text-xs text-gray-500 mb-2">پیش‌نمایش:</div>
              <div className="bg-white rounded-lg overflow-hidden shadow-sm border max-w-[200px]">
                <div className="h-20 bg-gray-200 flex items-center justify-center">
                  {product.image_url ? (
                    <img
                      src={product.image_url || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 text-xs">بدون تصویر</span>
                  )}
                </div>
                <div className="p-3">
                  <h5 className="font-medium text-sm truncate">{product.name || "بدون نام"}</h5>
                  {product.price && <p className="text-sm font-bold mt-1">{product.price.toLocaleString()} تومان</p>}
                  <div className="flex gap-2 mt-2">
                    <button className="flex-1 bg-blue-600 text-white text-xs py-1.5 rounded-md">
                      {product.button_text || "افزودن به سبد"}
                    </button>
                    <button className="px-2 border border-gray-300 text-xs py-1.5 rounded-md">اطلاعات بیشتر</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {products.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>هیچ محصولی تعریف نشده است. برای افزودن محصول، روی دکمه "افزودن محصول" کلیک کنید.</p>
          </div>
        )}
      </div>
    </div>
  )
}

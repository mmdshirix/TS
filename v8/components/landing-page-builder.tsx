"use client"

import { useEffect, useState } from "react"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { LandingBlock, ProductCategory } from "@/lib/store-db"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  GripVertical,
  ChevronDown,
  Trash2,
  Plus,
  Loader2,
  RotateCcw,
  Image as ImageIcon,
  Upload,
  Images,
  Type,
  Package,
  LayoutGrid,
  Phone,
  MousePointerClick,
  MapPin,
  Share2,
  Store,
  CheckCircle2,
} from "lucide-react"
import { cn } from "@/lib/utils"

const BLOCK_META: Record<string, { label: string; icon: any }> = {
  store_identity: { label: "هویت فروشگاه (لوگو و نام)", icon: Store },
  banner: { label: "بنر / کاروسل", icon: Images },
  text: { label: "بخش متنی", icon: Type },
  products: { label: "محصولات", icon: Package },
  categories: { label: "دسته‌بندی‌ها", icon: LayoutGrid },
  contact: { label: "اطلاعات تماس", icon: Phone },
  cta_button: { label: "دکمه فراخوان", icon: MousePointerClick },
  store_address: { label: "آدرس فروشگاه", icon: MapPin },
  social_links: { label: "شبکه‌های اجتماعی", icon: Share2 },
}

const BLOCK_TYPES = Object.keys(BLOCK_META)

async function uploadImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)
  const res = await fetch("/api/upload-image", { method: "POST", body: formData })
  const data = await res.json()
  if (!res.ok || !data.url) {
    throw new Error(data.error || "خطا در آپلود تصویر")
  }
  return data.url as string
}

function BlockEditor({
  block,
  categories,
  onChange,
}: {
  block: LandingBlock
  categories: ProductCategory[]
  onChange: (config: Record<string, any>) => void
}) {
  const config = block.config || {}
  const [uploadingSlide, setUploadingSlide] = useState<number | null>(null)

  if (block.type === "store_identity") {
    return (
      <p className="text-sm text-gray-500">
        این بخش لوگو و نام فروشگاه را به‌صورت خودکار از «تنظیمات فروشگاه» نمایش می‌دهد.
      </p>
    )
  }

  if (block.type === "banner") {
    const slides = config.slides || []
    const updateSlide = (index: number, patch: Record<string, any>) => {
      const next = slides.map((s: any, i: number) => (i === index ? { ...s, ...patch } : s))
      onChange({ ...config, slides: next })
    }
    const addSlide = () => {
      onChange({ ...config, slides: [...slides, { image_url: "", title: "", subtitle: "", link_url: "", link_text: "" }] })
    }
    const removeSlide = (index: number) => {
      onChange({ ...config, slides: slides.filter((_: any, i: number) => i !== index) })
    }
    const handleSlideImage = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      setUploadingSlide(index)
      try {
        const url = await uploadImage(file)
        updateSlide(index, { image_url: url })
      } finally {
        setUploadingSlide(null)
      }
    }
    return (
      <div className="space-y-4">
        {slides.map((slide: any, index: number) => (
          <div key={index} className="rounded-xl border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">اسلاید {index + 1}</span>
              <Button variant="ghost" size="sm" onClick={() => removeSlide(index)} className="text-red-500 h-7 px-2">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden bg-gray-50 flex-shrink-0">
                {slide.image_url ? (
                  <img src={slide.image_url || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <label className="flex-1">
                <Input type="file" accept="image/*" className="hidden" onChange={(e) => handleSlideImage(index, e)} />
                <div className="rounded-lg border text-xs text-center py-1.5 cursor-pointer hover:bg-gray-50">
                  {uploadingSlide === index ? <Loader2 className="w-3.5 h-3.5 animate-spin inline" /> : <><Upload className="w-3.5 h-3.5 inline ml-1" />تصویر</>}
                </div>
              </label>
            </div>
            <Input placeholder="عنوان" value={slide.title || ""} onChange={(e) => updateSlide(index, { title: e.target.value })} className="rounded-lg text-sm" />
            <Input placeholder="زیرعنوان" value={slide.subtitle || ""} onChange={(e) => updateSlide(index, { subtitle: e.target.value })} className="rounded-lg text-sm" />
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="لینک" value={slide.link_url || ""} onChange={(e) => updateSlide(index, { link_url: e.target.value })} dir="ltr" className="rounded-lg text-sm" />
              <Input placeholder="متن دکمه" value={slide.link_text || ""} onChange={(e) => updateSlide(index, { link_text: e.target.value })} className="rounded-lg text-sm" />
            </div>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={addSlide} className="w-full rounded-lg gap-1">
          <Plus className="w-3.5 h-3.5" />
          افزودن اسلاید
        </Button>
      </div>
    )
  }

  if (block.type === "text") {
    return (
      <div className="space-y-3">
        <Input placeholder="عنوان" value={config.title || ""} onChange={(e) => onChange({ ...config, title: e.target.value })} className="rounded-lg" />
        <Textarea placeholder="متن" value={config.body || ""} onChange={(e) => onChange({ ...config, body: e.target.value })} rows={3} className="rounded-lg resize-none" />
      </div>
    )
  }

  if (block.type === "products") {
    return (
      <div className="space-y-3">
        <Input placeholder="عنوان بخش" value={config.title || ""} onChange={(e) => onChange({ ...config, title: e.target.value })} className="rounded-lg" />
        <div className="grid grid-cols-2 gap-2">
          <Select value={config.mode || "all"} onValueChange={(v) => onChange({ ...config, mode: v })}>
            <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه محصولات</SelectItem>
              <SelectItem value="category">یک دسته‌بندی خاص</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="number"
            placeholder="تعداد نمایش"
            value={config.limit ?? 8}
            onChange={(e) => onChange({ ...config, limit: Number(e.target.value) })}
            className="rounded-lg"
          />
        </div>
        {config.mode === "category" && (
          <Select value={config.category_id ? String(config.category_id) : ""} onValueChange={(v) => onChange({ ...config, category_id: Number(v) })}>
            <SelectTrigger className="rounded-lg"><SelectValue placeholder="انتخاب دسته‌بندی" /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    )
  }

  if (block.type === "categories") {
    return <Input placeholder="عنوان بخش" value={config.title || ""} onChange={(e) => onChange({ ...config, title: e.target.value })} className="rounded-lg" />
  }

  if (block.type === "contact") {
    return (
      <div className="space-y-3">
        <Input placeholder="عنوان بخش" value={config.title || ""} onChange={(e) => onChange({ ...config, title: e.target.value })} className="rounded-lg" />
        <div className="flex items-center justify-between rounded-lg border p-3">
          <Label className="text-sm">نمایش شماره تماس</Label>
          <Switch checked={config.show_phone ?? true} onCheckedChange={(v) => onChange({ ...config, show_phone: v })} />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3">
          <Label className="text-sm">نمایش فرم تماس</Label>
          <Switch checked={config.show_form ?? true} onCheckedChange={(v) => onChange({ ...config, show_form: v })} />
        </div>
      </div>
    )
  }

  if (block.type === "cta_button") {
    return (
      <div className="space-y-3">
        <Input placeholder="متن دکمه" value={config.text || ""} onChange={(e) => onChange({ ...config, text: e.target.value })} className="rounded-lg" />
        <Input placeholder="لینک مقصد" value={config.link_url || ""} onChange={(e) => onChange({ ...config, link_url: e.target.value })} dir="ltr" className="rounded-lg" />
        <Select value={config.style || "primary"} onValueChange={(v) => onChange({ ...config, style: v })}>
          <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="primary">پررنگ</SelectItem>
            <SelectItem value="outline">خط‌دار</SelectItem>
          </SelectContent>
        </Select>
      </div>
    )
  }

  if (block.type === "store_address") {
    return (
      <div className="flex items-center justify-between rounded-lg border p-3">
        <Label className="text-sm">نمایش نقشه</Label>
        <Switch checked={config.show_map ?? false} onCheckedChange={(v) => onChange({ ...config, show_map: v })} />
      </div>
    )
  }

  if (block.type === "social_links") {
    return <Input placeholder="عنوان بخش" value={config.title || ""} onChange={(e) => onChange({ ...config, title: e.target.value })} className="rounded-lg" />
  }

  return null
}

function SortableBlockCard({
  block,
  categories,
  onToggle,
  onDelete,
  onConfigChange,
  onSaveConfig,
  saving,
  saved,
}: {
  block: LandingBlock
  categories: ProductCategory[]
  onToggle: (id: number, enabled: boolean) => void
  onDelete: (id: number) => void
  onConfigChange: (id: number, config: Record<string, any>) => void
  onSaveConfig: (id: number) => void
  saving: boolean
  saved: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id })
  const meta = BLOCK_META[block.type] || { label: block.type, icon: Package }
  const Icon = meta.icon

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn("rounded-2xl", isDragging && "opacity-60 shadow-xl", !block.enabled && "opacity-60")}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center gap-3">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 touch-none"
            aria-label="جابجایی"
          >
            <GripVertical className="w-5 h-5" />
          </button>
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Icon className="w-4.5 h-4.5" />
          </div>
          <span className="flex-1 font-medium text-sm text-gray-900">{meta.label}</span>
          <Switch checked={block.enabled} onCheckedChange={(v) => onToggle(block.id, v)} />
          <Button variant="ghost" size="sm" onClick={() => setExpanded((e) => !e)} className="h-8 w-8 p-0">
            <ChevronDown className={cn("w-4 h-4 transition-transform", expanded && "rotate-180")} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(block.id)} className="h-8 w-8 p-0 text-red-500 hover:text-red-700">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {expanded && (
          <div className="mt-4 pt-4 border-t space-y-3">
            <BlockEditor block={block} categories={categories} onChange={(config) => onConfigChange(block.id, config)} />
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                onClick={() => onSaveConfig(block.id)}
                disabled={saving}
                className="rounded-lg bg-gradient-to-l from-blue-600 to-blue-700"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
                ذخیره بلاک
              </Button>
              {saved && (
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> ذخیره شد
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function LandingPageBuilder({ page = "home" }: { page?: "home" | "about" | "contact" }) {
  const [blocks, setBlocks] = useState<LandingBlock[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [resetting, setResetting] = useState(false)
  const [error, setError] = useState("")
  const [savingBlockId, setSavingBlockId] = useState<number | null>(null)
  const [savedBlockId, setSavedBlockId] = useState<number | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const loadData = async () => {
    setLoading(true)
    try {
      const [blocksRes, categoriesRes] = await Promise.all([
        fetch(`/api/store/landing-blocks?page=${page}`),
        fetch("/api/store/categories"),
      ])
      const blocksData = await blocksRes.json()
      const categoriesData = await categoriesRes.json()
      setBlocks(blocksData.blocks || [])
      setCategories(categoriesData.categories || [])
    } catch (err) {
      setError("خطا در دریافت اطلاعات")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [page])

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = blocks.findIndex((b) => b.id === active.id)
    const newIndex = blocks.findIndex((b) => b.id === over.id)
    const reordered = arrayMove(blocks, oldIndex, newIndex)
    setBlocks(reordered)

    const order = reordered.map((b, i) => ({ id: b.id, position: i }))
    await fetch("/api/store/landing-blocks/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order }),
    })
  }

  const handleToggle = async (id: number, enabled: boolean) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, enabled } : b)))
    await fetch(`/api/store/landing-blocks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled }),
    })
  }

  const handleConfigChange = (id: number, config: Record<string, any>) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, config } : b)))
  }

  const handleSaveConfig = async (id: number) => {
    const block = blocks.find((b) => b.id === id)
    if (!block) return
    setSavingBlockId(id)
    setSavedBlockId(null)
    setError("")
    try {
      const res = await fetch(`/api/store/landing-blocks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: block.config }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "خطا در ذخیره بلاک")
      }
      setSavedBlockId(id)
      setTimeout(() => setSavedBlockId((cur) => (cur === id ? null : cur)), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ذخیره بلاک")
    } finally {
      setSavingBlockId(null)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("آیا از حذف این بلاک مطمئن هستید؟")) return
    setError("")
    try {
      const res = await fetch(`/api/store/landing-blocks/${id}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "خطا در حذف بلاک")
      }
      setBlocks((prev) => prev.filter((b) => b.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در حذف بلاک")
    }
  }

  const handleAddBlock = async (type: string) => {
    setError("")
    try {
      const res = await fetch("/api/store/landing-blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, page, config: {} }),
      })
      const data = await res.json()
      if (!res.ok || !data.block) {
        throw new Error(data.error || "خطا در افزودن بلاک")
      }
      setBlocks((prev) => [...prev, data.block])
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در افزودن بلاک")
    }
  }

  const handleReset = async () => {
    if (!confirm("چیدمان فعلی حذف و به حالت پیش‌فرض بازمی‌گردد. ادامه می‌دهید؟")) return
    setResetting(true)
    try {
      const res = await fetch(`/api/store/landing-blocks/reset?page=${page}`, { method: "POST" })
      const data = await res.json()
      if (res.ok) {
        setBlocks(data.blocks || [])
      }
    } finally {
      setResetting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex flex-wrap gap-2 justify-end">
        <Button variant="outline" onClick={handleReset} disabled={resetting} className="rounded-xl gap-2">
          {resetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
          بازگردانی چیدمان پیش‌فرض
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="rounded-xl gap-2 bg-gradient-to-l from-blue-600 to-blue-700">
              <Plus className="w-4 h-4" />
              افزودن بلاک
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {BLOCK_TYPES.map((type) => {
              const meta = BLOCK_META[type]
              const Icon = meta.icon
              return (
                <DropdownMenuItem key={type} onClick={() => handleAddBlock(type)} className="gap-2">
                  <Icon className="w-4 h-4" />
                  {meta.label}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {blocks.length === 0 ? (
        <Card className="rounded-2xl">
          <CardContent className="py-16 text-center text-gray-500">هنوز بلاکی به این صفحه اضافه نشده است</CardContent>
        </Card>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {blocks.map((block) => (
                <SortableBlockCard
                  key={block.id}
                  block={block}
                  categories={categories}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  onConfigChange={handleConfigChange}
                  onSaveConfig={handleSaveConfig}
                  saving={savingBlockId === block.id}
                  saved={savedBlockId === block.id}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}

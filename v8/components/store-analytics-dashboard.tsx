"use client"

import { useEffect, useState } from "react"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, TrendingUp, TrendingDown, Wallet, ShoppingCart, Users, Eye, PlayCircle } from "lucide-react"

type Granularity = "day" | "week" | "month" | "year"

interface StatsPoint {
  label: string
  revenue: number
  orders: number
  visitors: number
  pageViews: number
  plays: number
}

interface StatsSummary {
  totalRevenue: number
  totalOrders: number
  totalVisitors: number
  totalPageViews: number
  totalPlays: number
  revenueChangePct: number | null
}

interface BestSellingProduct {
  productId: number | null
  name: string
  qty: number
  revenue: number
}

interface AnalyticsResponse {
  summary: StatsSummary
  series: StatsPoint[]
  bestSellers: BestSellingProduct[]
}

const GRANULARITY_OPTIONS: Array<{ value: Granularity; label: string }> = [
  { value: "day", label: "روزانه" },
  { value: "week", label: "هفتگی" },
  { value: "month", label: "ماهانه" },
  { value: "year", label: "سالانه" },
]

function StatCard({
  icon: Icon,
  label,
  value,
  badge,
}: {
  icon: any
  label: string
  value: string
  badge?: { positive: boolean; text: string }
}) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Icon className="w-5 h-5" />
          </div>
          {badge && (
            <span
              className={`flex items-center gap-1 text-xs font-medium ${badge.positive ? "text-green-600" : "text-red-600"}`}
            >
              {badge.positive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {badge.text}
            </span>
          )}
        </div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </CardContent>
    </Card>
  )
}

export default function StoreAnalyticsDashboard() {
  const [granularity, setGranularity] = useState<Granularity>("day")
  const [data, setData] = useState<AnalyticsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError("")
    fetch(`/api/store/analytics?granularity=${granularity}`)
      .then(async (res) => {
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || "خطا در دریافت آمار")
        if (!cancelled) setData(json)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "خطا در دریافت آمار")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [granularity])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">بازه نمایش نمودارها و بهترین‌فروش‌ها</p>
        <Select value={granularity} onValueChange={(v) => setGranularity(v as Granularity)}>
          <SelectTrigger className="w-36 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {GRANULARITY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading && !data ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatCard
              icon={Wallet}
              label="درآمد"
              value={`${data.summary.totalRevenue.toLocaleString()} تومان`}
              badge={
                data.summary.revenueChangePct !== null
                  ? {
                      positive: data.summary.revenueChangePct >= 0,
                      text: `${Math.abs(data.summary.revenueChangePct).toFixed(0)}%`,
                    }
                  : undefined
              }
            />
            <StatCard icon={ShoppingCart} label="سفارش‌ها" value={data.summary.totalOrders.toLocaleString()} />
            <StatCard icon={Users} label="بازدیدکنندگان" value={data.summary.totalVisitors.toLocaleString()} />
            <StatCard icon={Eye} label="ورودی‌ها (بازدید صفحه)" value={data.summary.totalPageViews.toLocaleString()} />
            <StatCard icon={PlayCircle} label="پخش اکسپلور" value={data.summary.totalPlays.toLocaleString()} />
          </div>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>روند فروش</CardTitle>
              <CardDescription>درآمد و تعداد سفارش‌ها</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.series} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip formatter={(value: number) => value.toLocaleString()} />
                    <Legend />
                    <Area type="monotone" dataKey="revenue" name="درآمد (تومان)" stroke="#2563eb" fill="#2563eb33" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>بازدیدکنندگان و ورودی‌ها</CardTitle>
              <CardDescription>بازدیدکنندگان یکتا، بازدید صفحه و پخش ویدیوهای اکسپلور</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.series} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="visitors" name="بازدیدکنندگان" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="pageViews" name="ورودی‌ها" fill="#93c5fd" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="plays" name="پخش اکسپلور" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>پرفروش‌ترین محصولات</CardTitle>
              <CardDescription>بر اساس تعداد فروش در بازه انتخاب‌شده</CardDescription>
            </CardHeader>
            <CardContent>
              {data.bestSellers.length === 0 ? (
                <p className="text-sm text-gray-500 py-8 text-center">در این بازه فروشی ثبت نشده است</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>محصول</TableHead>
                      <TableHead>تعداد فروش</TableHead>
                      <TableHead>درآمد</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.bestSellers.map((product, i) => (
                      <TableRow key={product.productId ?? `${product.name}-${i}`}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.qty.toLocaleString()}</TableCell>
                        <TableCell>{product.revenue.toLocaleString()} تومان</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  )
}

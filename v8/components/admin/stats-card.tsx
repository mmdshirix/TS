"use client"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: string | number
  change?: number
  icon?: string
  color?: "blue" | "green" | "orange" | "purple"
  className?: string
}

const colorClasses = {
  blue: "from-blue-500 to-blue-600",
  green: "from-green-500 to-green-600",
  orange: "from-orange-500 to-orange-600",
  purple: "from-purple-500 to-purple-600",
}

export default function StatsCard({ title, value, change, icon = "📊", color = "blue", className }: StatsCardProps) {
  const changeType = change && change > 0 ? "positive" : change && change < 0 ? "negative" : "neutral"

  return (
    <Card
      className={cn(
        "relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white/80 backdrop-blur-sm",
        className,
      )}
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-5", colorClasses[color])} />

      <div className="relative p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-3xl">{icon}</div>
          {change !== undefined && (
            <div
              className={cn(
                "text-sm font-medium px-3 py-1 rounded-full",
                changeType === "positive" && "bg-green-100 text-green-700",
                changeType === "negative" && "bg-red-100 text-red-700",
                changeType === "neutral" && "bg-gray-100 text-gray-700",
              )}
            >
              {change > 0 ? "+" : ""}
              {change}%
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </Card>
  )
}

"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function Scorecard({ vulnerabilities }: { vulnerabilities: any[] }) {
  const counts = vulnerabilities.reduce((acc, v) => {
    const sev = (v.severity || 'None').toLowerCase()
    acc[sev] = (acc[sev] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const items = [
    { label: "Critical", key: "critical", color: "bg-red-600" },
    { label: "High", key: "high", color: "bg-orange-600" },
    { label: "Medium", key: "medium", color: "bg-yellow-500" },
    { label: "Low", key: "low", color: "bg-green-600" },
    { label: "Informational", key: "informational", color: "bg-blue-600" },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {items.map((item) => (
        <Card key={item.key}>
          <CardContent className="flex flex-col items-center justify-center p-4">
            <span className="text-2xl font-bold">{counts[item.key] || 0}</span>
            <Badge className={cn("mt-1", item.color, "text-white")}>{item.label}</Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

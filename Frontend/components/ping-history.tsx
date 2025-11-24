"use client"

import { Clock } from "lucide-react"
import { Card } from "@/components/ui/card"

interface PingHistoryProps {
  history: Date[]
}

export default function PingHistory({ history }: PingHistoryProps) {
  const formatTime = (date: Date) => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  return (
    <Card className="bg-slate-900/50 border-slate-800/50 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-cyan-400" />
        <h3 className="font-semibold text-sm text-foreground">Recent Pings</h3>
      </div>
      {history.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">No pings yet</p>
      ) : (
        <div className="space-y-2">
          {history.map((date, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg border border-slate-700/50"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                <span className="text-xs text-foreground">Check-in</span>
              </div>
              <span className="text-xs text-muted-foreground">{formatTime(date)}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

"use client"

import { useEffect, useState } from "react"
import { AlertCircle } from "lucide-react"

interface CountdownTimerProps {
  lastPing: Date
  timeoutPeriod: number
}

export default function CountdownTimer({ lastPing, timeoutPeriod }: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState("")
  const [isWarning, setIsWarning] = useState(false)

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const deadline = new Date(lastPing.getTime() + timeoutPeriod * 1000)
      const now = new Date()
      const diff = deadline.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeRemaining("Deadline Passed")
        setIsWarning(true)
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      if (days === 0 && hours < 24) {
        setIsWarning(true)
      } else {
        setIsWarning(false)
      }

      setTimeRemaining(`${days}d ${hours}h ${minutes}m`)
    }

    calculateTimeRemaining()
    const interval = setInterval(calculateTimeRemaining, 60000)
    return () => clearInterval(interval)
  }, [lastPing, timeoutPeriod])

  return (
    <div
      className={`p-4 rounded-lg border transition-all ${
        isWarning ? "bg-red-950/30 border-red-800/50" : "bg-slate-800/50 border-slate-700/50"
      }`}
    >
      <div className="flex items-center gap-3">
        {isWarning && <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />}
        <div className="flex-1">
          <p className={`text-xs font-semibold ${isWarning ? "text-red-400" : "text-muted-foreground"}`}>
            {isWarning ? "Warning: Deadline Approaching" : "Time Until Deadline"}
          </p>
          <p className={`text-2xl font-bold mt-1 ${isWarning ? "text-red-300" : "text-cyan-400"}`}>{timeRemaining}</p>
        </div>
      </div>
    </div>
  )
}

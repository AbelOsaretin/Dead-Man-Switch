"use client"

import { useState } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PingButtonProps {
  onPing: () => void
}

export default function PingButton({ onPing }: PingButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handlePing = async () => {
    setIsLoading(true)
    // Simulate contract interaction
    await new Promise((resolve) => setTimeout(resolve, 800))
    onPing()
    setIsLoading(false)
    setShowConfirm(true)
    setTimeout(() => setShowConfirm(false), 3000)
  }

  return (
    <div className="relative">
      <Button
        onClick={handlePing}
        disabled={isLoading}
        className="w-full h-32 text-xl font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-emerald-500/50 transition-all duration-300 flex items-center justify-center gap-3"
      >
        <Heart className={`w-8 h-8 ${isLoading ? "animate-pulse" : ""}`} />
        <span>{isLoading ? "Pinging..." : "I Am Alive"}</span>
      </Button>
      {showConfirm && (
        <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/20 backdrop-blur-sm rounded-lg border border-emerald-500/50 animation-fade-in">
          <p className="text-emerald-400 font-semibold flex items-center gap-2">✓ Ping Confirmed</p>
        </div>
      )}
    </div>
  )
}

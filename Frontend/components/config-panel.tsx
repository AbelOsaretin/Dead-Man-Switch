"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ConfigPanelProps {
  currentTimeout: number
  currentBeneficiary: string
  onSave: (timeout: number, beneficiary: string) => void
  onClose: () => void
}

export default function ConfigPanel({ currentTimeout, currentBeneficiary, onSave, onClose }: ConfigPanelProps) {
  const [timeout, setTimeout] = useState(Math.round(currentTimeout / 86400))
  const [beneficiary, setBeneficiary] = useState(currentBeneficiary)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate contract interaction
    await new Promise((resolve) => setTimeout(resolve, 600))
    onSave(timeout * 86400, beneficiary)
    setIsSaving(false)
  }

  const presets = [
    { label: "30 days", value: 30 },
    { label: "60 days", value: 60 },
    { label: "90 days", value: 90 },
    { label: "180 days", value: 180 },
  ]

  return (
    <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur p-6 fixed inset-4 lg:inset-auto lg:w-80 max-h-[90vh] overflow-y-auto z-50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-foreground">Configuration</h3>
        <button onClick={onClose} className="p-1 hover:bg-slate-800/50 rounded-lg transition-colors">
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Timeout Period */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-foreground">Timeout Period (Days)</Label>
          <Input
            type="number"
            min="1"
            max="365"
            value={timeout}
            onChange={(e) => setTimeout(Math.max(1, Number.parseInt(e.target.value) || 1))}
            className="bg-slate-800/50 border-slate-700/50 text-foreground"
          />
          <div className="grid grid-cols-2 gap-2">
            {presets.map((preset) => (
              <button
                key={preset.value}
                onClick={() => setTimeout(preset.value)}
                className={`py-2 px-3 text-xs font-medium rounded-lg transition-colors ${
                  timeout === preset.value
                    ? "bg-cyan-500 text-white"
                    : "bg-slate-800/50 border border-slate-700/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            You must check in at least every {timeout} days or funds transfer to beneficiary.
          </p>
        </div>

        {/* Beneficiary */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-foreground">Beneficiary Address</Label>
          <Input
            type="text"
            placeholder="0x..."
            value={beneficiary}
            onChange={(e) => setBeneficiary(e.target.value)}
            className="bg-slate-800/50 border-slate-700/50 text-foreground font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">This address will receive funds if deadline passes.</p>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-4">
          <Button
            onClick={handleSave}
            disabled={isSaving || !beneficiary.startsWith("0x")}
            className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white"
          >
            {isSaving ? "Saving..." : "Save Configuration"}
          </Button>
          <Button onClick={onClose} variant="outline" className="w-full bg-transparent">
            Cancel
          </Button>
        </div>
      </div>
    </Card>
  )
}

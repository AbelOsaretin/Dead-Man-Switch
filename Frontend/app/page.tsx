"use client";

import { useState } from "react";
import {
  HeartHandshake,
  Settings,
  Clock,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ConfigPanel from "@/components/config-panel";
import PingButton from "@/components/ping-button";
import CountdownTimer from "@/components/countdown-timer";
import PingHistory from "@/components/ping-history";

export default function DeadMansSwitchPage() {
  const [showConfig, setShowConfig] = useState(false);
  const [timeoutPeriod, setTimeoutPeriod] = useState(7776000); // 90 days in seconds
  const [beneficiary, setBeneficiary] = useState("0x...");
  const [lastPing, setLastPing] = useState(new Date());
  const [pingHistory, setPingHistory] = useState<Date[]>([]);
  const [funds, setFunds] = useState("2.5");

  const handlePing = () => {
    const newPing = new Date();
    setLastPing(newPing);
    setPingHistory([newPing, ...pingHistory.slice(0, 9)]);
  };

  const handleConfigSave = (period: number, address: string) => {
    setTimeoutPeriod(period);
    setBeneficiary(address);
    setShowConfig(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-slate-950/50">
      {/* Header */}
      <header className="border-b border-slate-800/50 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg">
                <HeartHandshake className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Dead Man's Switch
                </h1>
                <p className="text-sm text-muted-foreground">
                  Automated Estate Protection
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setShowConfig(!showConfig)}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Button>
              <appkit-button />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Ping Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-sm font-semibold text-emerald-400 flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Contract Status
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Your funds are secure
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-foreground">
                    {funds} ETH
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Total Deposited
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <p className="text-xs text-muted-foreground mb-1">
                    Last Check-in
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {lastPing.toLocaleDateString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {lastPing.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <p className="text-xs text-muted-foreground mb-1">
                    Next Deadline
                  </p>
                  <p className="text-sm font-semibold text-cyan-400">
                    {new Date(
                      lastPing.getTime() + timeoutPeriod * 1000
                    ).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-emerald-400/70 mt-1">
                    90 days away
                  </p>
                </div>
              </div>
            </Card>

            {/* Main Ping Section */}
            <div className="space-y-4">
              <div className="text-center space-y-2 mb-6">
                <h2 className="text-3xl font-bold text-foreground">
                  I'm Still Here
                </h2>
                <p className="text-muted-foreground">
                  Confirm your wellbeing and reset the timer. Your beneficiary
                  will be notified if you don't check in.
                </p>
              </div>

              {/* Ping Button */}
              <PingButton onPing={handlePing} />

              {/* Countdown */}
              <CountdownTimer
                lastPing={lastPing}
                timeoutPeriod={timeoutPeriod}
              />
            </div>

            {/* Info Cards */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Card className="bg-slate-900/30 border-slate-800/50 p-4">
                <div className="flex gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg h-fit">
                    <Zap className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">
                      How It Works
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Check in regularly to confirm you're alive. If you miss a
                      deadline, funds transfer automatically.
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="bg-slate-900/30 border-slate-800/50 p-4">
                <div className="flex gap-3">
                  <div className="p-2 bg-emerald-500/20 rounded-lg h-fit">
                    <Clock className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">
                      Security
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Powered by smart contracts. No middlemen. Always in your
                      control.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-6">
            {/* Config Panel */}
            {showConfig && (
              <ConfigPanel
                currentTimeout={timeoutPeriod}
                currentBeneficiary={beneficiary}
                onSave={handleConfigSave}
                onClose={() => setShowConfig(false)}
              />
            )}

            {/* Recent Activity */}
            <PingHistory history={pingHistory} />

            {/* Quick Stats */}
            <Card className="bg-gradient-to-br from-slate-900/50 to-slate-900/30 border-slate-800/50 p-4">
              <h3 className="font-semibold text-sm text-foreground mb-3">
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Beneficiary
                  </p>
                  <p className="text-xs font-mono text-cyan-400/80 truncate">
                    {beneficiary}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Timeout Period
                  </p>
                  <p className="text-xs font-semibold text-foreground">
                    {Math.round(timeoutPeriod / 86400)} days
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Contract Balance
                  </p>
                  <p className="text-xs font-semibold text-emerald-400">
                    {funds} ETH
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Settings, Save, AlertTriangle, Lock } from "lucide-react"

export function AllocationControls() {
  const [stablecoinAllocation, setStablecoinAllocation] = useState([60])
  const [fiatAllocation, setFiatAllocation] = useState([25])
  const [yieldAllocation, setYieldAllocation] = useState([15])
  const [hasChanges, setHasChanges] = useState(false)
  const [isLocked, setIsLocked] = useState(true)

  const totalAllocation = stablecoinAllocation[0] + fiatAllocation[0] + yieldAllocation[0]
  const isValidAllocation = totalAllocation === 100

  const handleAllocationChange = (type: string, value: number[]) => {
    setHasChanges(true)

    switch (type) {
      case "stablecoin":
        setStablecoinAllocation(value)
        break
      case "fiat":
        setFiatAllocation(value)
        break
      case "yield":
        setYieldAllocation(value)
        break
    }
  }

  const handleSave = async () => {
    if (!isValidAllocation) return

    try {
      // Here you would call an API to save the allocation changes
      console.log("[v0] Saving allocation changes:", {
        stablecoins: stablecoinAllocation[0],
        fiat: fiatAllocation[0],
        yield_strategies: yieldAllocation[0],
      })

      setHasChanges(false)
      // Show success message
    } catch (error) {
      console.error("[v0] Failed to save allocation changes:", error)
    }
  }

  const resetAllocations = () => {
    setStablecoinAllocation([60])
    setFiatAllocation([25])
    setYieldAllocation([15])
    setHasChanges(false)
  }

  return (
    <Card className="treasury-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            Allocation Controls
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLocked(!isLocked)}
              className="flex items-center gap-2"
            >
              <Lock className={`h-4 w-4 ${isLocked ? "text-red-500" : "text-green-500"}`} />
              {isLocked ? "Locked" : "Unlocked"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLocked && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Allocation controls are locked for security. Unlock to make changes.</AlertDescription>
          </Alert>
        )}

        {!isValidAllocation && !isLocked && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Total allocation must equal 100%. Current total: {totalAllocation}%</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Stablecoin Allocation */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Stablecoin Allocation</label>
              <Badge variant="outline">{stablecoinAllocation[0]}%</Badge>
            </div>
            <Slider
              value={stablecoinAllocation}
              onValueChange={(value) => handleAllocationChange("stablecoin", value)}
              max={100}
              step={1}
              disabled={isLocked}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">Conservative yield with high liquidity. Target APY: 2.5%</p>
          </div>

          {/* Fiat Allocation */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Fiat Reserve Allocation</label>
              <Badge variant="outline">{fiatAllocation[0]}%</Badge>
            </div>
            <Slider
              value={fiatAllocation}
              onValueChange={(value) => handleAllocationChange("fiat", value)}
              max={100}
              step={1}
              disabled={isLocked}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Emergency reserves in traditional banking. No yield but maximum security.
            </p>
          </div>

          {/* Yield Strategies Allocation */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Yield Strategy Allocation</label>
              <Badge variant="outline">{yieldAllocation[0]}%</Badge>
            </div>
            <Slider
              value={yieldAllocation}
              onValueChange={(value) => handleAllocationChange("yield", value)}
              max={100}
              step={1}
              disabled={isLocked}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Higher-yield DeFi strategies with managed risk. Target APY: 4.8%
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        {!isLocked && (
          <div className="flex items-center gap-3 pt-4 border-t">
            <Button
              onClick={handleSave}
              disabled={!hasChanges || !isValidAllocation}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
            <Button variant="outline" onClick={resetAllocations} disabled={!hasChanges}>
              Reset
            </Button>
          </div>
        )}

        {/* Impact Preview */}
        {hasChanges && isValidAllocation && !isLocked && (
          <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">Projected Impact</h4>
            <p className="text-sm text-green-700 dark:text-green-300">
              Changes require trustee approval and will take effect within 24 hours. Estimated new blended APY:{" "}
              {((stablecoinAllocation[0] * 2.5 + yieldAllocation[0] * 4.8) / 100).toFixed(2)}%
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

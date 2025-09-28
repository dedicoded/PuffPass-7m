"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Shield, FileText, Camera, CheckCircle, AlertTriangle, Clock } from "lucide-react"

interface KycPromptProps {
  currentLevel: "basic" | "enhanced" | "full"
  requiredLevel: "basic" | "enhanced" | "full"
  reason: "transaction_limit" | "merchant_verification" | "admin_access" | "compliance"
  onStartKyc?: (level: string) => void
  onSkip?: () => void
}

const KYC_LEVELS = {
  basic: {
    name: "Basic",
    progress: 33,
    icon: Shield,
    requirements: ["Email verification", "Phone number"],
    limits: "Up to $500/month",
  },
  enhanced: {
    name: "Enhanced",
    progress: 66,
    icon: FileText,
    requirements: ["Government ID", "Address verification", "Selfie verification"],
    limits: "Up to $5,000/month",
  },
  full: {
    name: "Full",
    progress: 100,
    icon: Camera,
    requirements: ["Enhanced verification", "Biometric verification", "Background check"],
    limits: "Unlimited transactions",
  },
}

const REASON_MESSAGES = {
  transaction_limit: "Your recent transactions require enhanced verification to continue.",
  merchant_verification: "Merchant accounts require enhanced identity verification.",
  admin_access: "Administrative access requires full identity verification and trustee wallet.",
  compliance: "Regulatory compliance requires additional verification.",
}

export function KycPrompt({ currentLevel, requiredLevel, reason, onStartKyc, onSkip }: KycPromptProps) {
  const [isStarting, setIsStarting] = useState(false)

  const current = KYC_LEVELS[currentLevel]
  const required = KYC_LEVELS[requiredLevel]

  const handleStartKyc = async () => {
    setIsStarting(true)
    try {
      onStartKyc?.(requiredLevel)
    } finally {
      setIsStarting(false)
    }
  }

  const getUrgencyColor = () => {
    switch (reason) {
      case "admin_access":
        return "border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800"
      case "compliance":
        return "border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800"
      default:
        return "border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800"
    }
  }

  const getUrgencyIcon = () => {
    switch (reason) {
      case "admin_access":
        return <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
      case "compliance":
        return <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
      default:
        return <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
    }
  }

  return (
    <Card className={getUrgencyColor()}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getUrgencyIcon()}
            <CardTitle>Identity Verification Required</CardTitle>
          </div>
          <Badge variant="outline" className="font-mono">
            {current.name} → {required.name}
          </Badge>
        </div>
        <CardDescription>{REASON_MESSAGES[reason]}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current vs Required Progress */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Current Level: {current.name}</span>
            <span>Required: {required.name}</span>
          </div>
          <Progress value={required.progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{current.limits}</span>
            <span>{required.limits}</span>
          </div>
        </div>

        {/* Requirements */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center">
            <required.icon className="w-4 h-4 mr-2" />
            {required.name} Verification Requirements
          </h4>
          <ul className="space-y-2">
            {required.requirements.map((req, index) => (
              <li key={index} className="flex items-center text-sm">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                {req}
              </li>
            ))}
          </ul>
        </div>

        {/* Estimated Time */}
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Estimated completion time:</span>
            <span className="text-muted-foreground">
              {requiredLevel === "enhanced" ? "5-10 minutes" : "10-15 minutes"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <Button onClick={handleStartKyc} disabled={isStarting} className="flex-1" size="lg">
            {isStarting ? "Starting..." : `Start ${required.name} Verification`}
          </Button>
          {reason !== "admin_access" && reason !== "compliance" && (
            <Button variant="outline" onClick={onSkip} className="px-6 bg-transparent">
              Skip for now
            </Button>
          )}
        </div>

        {(reason === "admin_access" || reason === "compliance") && (
          <p className="text-xs text-muted-foreground text-center">
            This verification is required and cannot be skipped.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

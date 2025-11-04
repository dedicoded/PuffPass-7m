"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { QRCodeSVG } from "qrcode.react"
import { Link2, Copy, Share2, Download, Mail, MessageSquare } from "lucide-react"
import { toast } from "sonner"

interface PaymentRequestGeneratorProps {
  merchantName?: string
  merchantAddress?: string
  currency?: string
}

export function PaymentRequestGenerator({
  merchantName = "PuffPass Merchant",
  merchantAddress,
  currency = "USDC",
}: PaymentRequestGeneratorProps) {
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [expiresIn, setExpiresIn] = useState("24")
  const [paymentLink, setPaymentLink] = useState("")
  const [requestId, setRequestId] = useState("")
  const [showResult, setShowResult] = useState(false)

  const generatePaymentRequest = async () => {
    if (!amount || Number.parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    if (!merchantAddress) {
      toast.error("Merchant address not configured")
      return
    }

    // Generate unique request ID
    const id = `PR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    setRequestId(id)

    // Create payment link
    const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
    const params = new URLSearchParams({
      id,
      to: merchantAddress,
      amount,
      currency,
      description: description || "Payment Request",
      expires: new Date(Date.now() + Number.parseInt(expiresIn) * 60 * 60 * 1000).toISOString(),
    })

    const link = `${baseUrl}/pay?${params.toString()}`
    setPaymentLink(link)
    setShowResult(true)

    // In production, save to database
    try {
      await fetch("/api/payment-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          merchantAddress,
          amount: Number.parseFloat(amount),
          currency,
          description,
          expiresAt: new Date(Date.now() + Number.parseInt(expiresIn) * 60 * 60 * 1000),
          status: "pending",
        }),
      })
    } catch (error) {
      console.error("Failed to save payment request:", error)
    }

    toast.success("Payment request generated!")
  }

  const copyLink = () => {
    navigator.clipboard.writeText(paymentLink)
    toast.success("Payment link copied to clipboard")
  }

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Payment Request from ${merchantName}`)
    const body = encodeURIComponent(
      `You have a payment request for ${amount} ${currency}.\n\n${description}\n\nPay now: ${paymentLink}`,
    )
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  const shareViaSMS = () => {
    const message = encodeURIComponent(`Payment request: ${amount} ${currency}. ${description}. Pay: ${paymentLink}`)
    window.open(`sms:?body=${message}`)
  }

  const shareViaWeb = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Payment Request - ${amount} ${currency}`,
          text: description,
          url: paymentLink,
        })
        toast.success("Payment request shared")
      } catch (error) {
        console.error("Share failed:", error)
      }
    } else {
      copyLink()
    }
  }

  const downloadQR = () => {
    const svg = document.getElementById("payment-request-qr")
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      const pngFile = canvas.toDataURL("image/png")

      const downloadLink = document.createElement("a")
      downloadLink.download = `payment-request-${requestId}.png`
      downloadLink.href = pngFile
      downloadLink.click()
      toast.success("QR code downloaded")
    }

    img.src = "data:image/svg+xml;base64," + btoa(svgData)
  }

  if (showResult) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            Payment Request Created
          </CardTitle>
          <CardDescription>Share this link or QR code with your customer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* QR Code */}
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-white rounded-lg">
              <QRCodeSVG id="payment-request-qr" value={paymentLink} size={256} level="H" includeMargin />
            </div>

            <div className="text-center space-y-2">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {amount} {currency}
              </Badge>
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
              <p className="text-xs text-muted-foreground">Request ID: {requestId}</p>
            </div>
          </div>

          {/* Payment Link */}
          <div className="space-y-2">
            <Label>Payment Link</Label>
            <div className="flex gap-2">
              <Input value={paymentLink} readOnly className="font-mono text-xs" />
              <Button variant="outline" size="sm" onClick={copyLink}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Share Options */}
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={shareViaEmail}>
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>
            <Button variant="outline" onClick={shareViaSMS}>
              <MessageSquare className="w-4 h-4 mr-2" />
              SMS
            </Button>
            <Button variant="outline" onClick={shareViaWeb}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" onClick={downloadQR}>
              <Download className="w-4 h-4 mr-2" />
              QR Code
            </Button>
          </div>

          <Button variant="ghost" onClick={() => setShowResult(false)} className="w-full">
            Create Another Request
          </Button>

          {/* Info */}
          <div className="p-3 bg-muted rounded-lg text-xs space-y-1">
            <p className="font-medium">Payment Request Details:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Expires in {expiresIn} hours</li>
              <li>Customer can pay with any Web3 wallet</li>
              <li>You'll receive notification when paid</li>
              <li>Link can be used only once</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="w-5 h-5" />
          Create Payment Request
        </CardTitle>
        <CardDescription>Generate a shareable payment link or QR code</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="request-amount">Amount ({currency})</Label>
          <Input
            id="request-amount"
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.01"
            min="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="request-description">Description</Label>
          <Textarea
            id="request-description"
            placeholder="What is this payment for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={200}
          />
          <p className="text-xs text-muted-foreground">{description.length}/200 characters</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="request-expires">Expires In (hours)</Label>
          <Input
            id="request-expires"
            type="number"
            value={expiresIn}
            onChange={(e) => setExpiresIn(e.target.value)}
            min="1"
            max="168"
          />
          <p className="text-xs text-muted-foreground">Link will expire after this time</p>
        </div>

        {merchantAddress && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Payment will be sent to:</p>
            <p className="font-mono text-xs break-all">{merchantAddress}</p>
          </div>
        )}

        <Button onClick={generatePaymentRequest} disabled={!amount || !merchantAddress} className="w-full">
          <Link2 className="w-4 h-4 mr-2" />
          Generate Payment Request
        </Button>

        <div className="p-3 bg-muted rounded-lg text-xs space-y-1">
          <p className="font-medium">How it works:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Create a payment request with amount and description</li>
            <li>Share the link or QR code with your customer</li>
            <li>Customer clicks link or scans QR to pay</li>
            <li>Receive instant notification when payment is complete</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { QRCodeSVG } from "qrcode.react"
import { QrCode, Copy, Download, Share2 } from "lucide-react"
import { toast } from "sonner"

interface QRPaymentGeneratorProps {
  walletAddress?: string
  defaultAmount?: number
  currency?: string
}

export function QRPaymentGenerator({ walletAddress, defaultAmount = 0, currency = "USDC" }: QRPaymentGeneratorProps) {
  const [amount, setAmount] = useState(defaultAmount.toString())
  const [memo, setMemo] = useState("")
  const [paymentUrl, setPaymentUrl] = useState("")
  const [showQR, setShowQR] = useState(false)

  const generatePaymentUrl = () => {
    if (!walletAddress || !amount || Number.parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    // Generate payment URL (EIP-681 format for Ethereum)
    const url = `ethereum:${walletAddress}@1?value=${Number.parseFloat(amount) * 1e18}&token=${currency}${memo ? `&memo=${encodeURIComponent(memo)}` : ""}`
    setPaymentUrl(url)
    setShowQR(true)
    toast.success("Payment QR code generated!")
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(paymentUrl)
    toast.success("Payment link copied to clipboard")
  }

  const downloadQR = () => {
    const svg = document.getElementById("payment-qr-code")
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
      downloadLink.download = `payment-qr-${Date.now()}.png`
      downloadLink.href = pngFile
      downloadLink.click()
      toast.success("QR code downloaded")
    }

    img.src = "data:image/svg+xml;base64," + btoa(svgData)
  }

  const sharePayment = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Payment Request",
          text: `Payment request for ${amount} ${currency}`,
          url: paymentUrl,
        })
        toast.success("Payment link shared")
      } catch (error) {
        console.error("Share failed:", error)
      }
    } else {
      copyToClipboard()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="w-5 h-5" />
          Generate Payment QR Code
        </CardTitle>
        <CardDescription>Create a scannable QR code for mobile/in-person payments</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!showQR ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="payment-amount">Amount ({currency})</Label>
              <Input
                id="payment-amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.01"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-memo">Memo (Optional)</Label>
              <Input
                id="payment-memo"
                placeholder="Payment for..."
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                maxLength={100}
              />
            </div>

            {walletAddress && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Receiving Address:</p>
                <p className="font-mono text-xs break-all">{walletAddress}</p>
              </div>
            )}

            <Button onClick={generatePaymentUrl} disabled={!walletAddress} className="w-full">
              <QrCode className="w-4 h-4 mr-2" />
              Generate QR Code
            </Button>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-white rounded-lg">
                <QRCodeSVG id="payment-qr-code" value={paymentUrl} size={256} level="H" includeMargin />
              </div>

              <div className="text-center space-y-2">
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {amount} {currency}
                </Badge>
                {memo && <p className="text-sm text-muted-foreground">{memo}</p>}
              </div>

              <div className="flex gap-2 w-full">
                <Button variant="outline" onClick={copyToClipboard} className="flex-1 bg-transparent">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
                <Button variant="outline" onClick={downloadQR} className="flex-1 bg-transparent">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" onClick={sharePayment} className="flex-1 bg-transparent">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>

              <Button variant="ghost" onClick={() => setShowQR(false)} className="w-full">
                Generate New QR Code
              </Button>
            </div>

            <div className="p-3 bg-muted rounded-lg text-xs space-y-1">
              <p className="font-medium">How to use:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Customer scans QR code with mobile wallet</li>
                <li>Payment details auto-fill in their wallet</li>
                <li>Customer confirms and sends payment</li>
                <li>Transaction appears in your wallet instantly</li>
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

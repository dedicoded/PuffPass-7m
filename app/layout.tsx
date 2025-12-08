import "@/lib/polyfills"
import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { ConditionalWeb3Provider } from "@/components/conditional-web3-provider"
import { Toaster } from "sonner"
import "./globals.css"

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: "PuffPass",
  description: "Your PuffPass application",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="font-sans">
        <ConditionalWeb3Provider>
          <Suspense fallback={null}>{children}</Suspense>
          <Toaster position="top-right" />
        </ConditionalWeb3Provider>
        <Analytics />
      </body>
    </html>
  )
}

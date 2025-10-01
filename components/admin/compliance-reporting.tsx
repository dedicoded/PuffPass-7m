"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Download, FileText, Shield, AlertTriangle, CheckCircle } from "lucide-react"

interface ComplianceReport {
  id: string
  type: "audit" | "security" | "kyc" | "treasury"
  title: string
  period: string
  status: "ready" | "generating" | "scheduled"
  size: string
  lastGenerated: string
  description: string
}

const mockReports: ComplianceReport[] = [
  {
    id: "1",
    type: "audit",
    title: "Quarterly Audit Trail",
    period: "Q4 2024",
    status: "ready",
    size: "2.4 MB",
    lastGenerated: "2024-12-31T23:59:59Z",
    description: "Complete audit log export with hash verification",
  },
  {
    id: "2",
    type: "security",
    title: "Security Incident Report",
    period: "December 2024",
    status: "ready",
    size: "856 KB",
    lastGenerated: "2024-12-31T18:00:00Z",
    description: "Authentication failures, rate limiting events, and security alerts",
  },
  {
    id: "3",
    type: "kyc",
    title: "KYC Compliance Summary",
    period: "Q4 2024",
    status: "generating",
    size: "Pending",
    lastGenerated: "In progress",
    description: "Age verification and progressive KYC compliance metrics",
  },
  {
    id: "4",
    type: "treasury",
    title: "Treasury Float Report",
    period: "December 2024",
    status: "scheduled",
    size: "Scheduled",
    lastGenerated: "Jan 1, 2025 00:00",
    description: "Float allocations, yield performance, and redemption coverage",
  },
]

const getTypeIcon = (type: string) => {
  switch (type) {
    case "audit":
      return <FileText className="h-4 w-4" />
    case "security":
      return <Shield className="h-4 w-4" />
    case "kyc":
      return <CheckCircle className="h-4 w-4" />
    case "treasury":
      return <AlertTriangle className="h-4 w-4" />
    default:
      return <FileText className="h-4 w-4" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "ready":
      return "bg-green-500/10 text-green-400 border-green-500/20"
    case "generating":
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
    case "scheduled":
      return "bg-blue-500/10 text-blue-400 border-blue-500/20"
    default:
      return "bg-gray-500/10 text-gray-400 border-gray-500/20"
  }
}

export function ComplianceReporting() {
  const [selectedPeriod, setSelectedPeriod] = useState("q4-2024")
  const [selectedType, setSelectedType] = useState("all")

  const filteredReports = mockReports.filter((report) => {
    if (selectedType !== "all" && report.type !== selectedType) return false
    return true
  })

  const handleDownload = (report: ComplianceReport) => {
    console.log(`Downloading ${report.title}...`)
    // In real implementation, this would trigger the actual download
  }

  const handleGenerateReport = (type: string) => {
    console.log(`Generating ${type} report...`)
    // In real implementation, this would trigger backend report generation
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-full sm:w-48 bg-gray-900/50 border-gray-700">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-700">
            <SelectItem value="q4-2024">Q4 2024</SelectItem>
            <SelectItem value="q3-2024">Q3 2024</SelectItem>
            <SelectItem value="q2-2024">Q2 2024</SelectItem>
            <SelectItem value="december-2024">December 2024</SelectItem>
            <SelectItem value="november-2024">November 2024</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-full sm:w-48 bg-gray-900/50 border-gray-700">
            <SelectValue placeholder="Report type" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-700">
            <SelectItem value="all">All Reports</SelectItem>
            <SelectItem value="audit">Audit Trail</SelectItem>
            <SelectItem value="security">Security</SelectItem>
            <SelectItem value="kyc">KYC Compliance</SelectItem>
            <SelectItem value="treasury">Treasury</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={() => handleGenerateReport("custom")} className="bg-blue-600 hover:bg-blue-700 text-white">
          <FileText className="h-4 w-4 mr-2" />
          Generate Custom Report
        </Button>
      </div>

      {/* Reports Grid */}
      <div className="grid gap-4">
        {filteredReports.map((report) => (
          <Card key={report.id} className="bg-gray-900/50 border-gray-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-800">{getTypeIcon(report.type)}</div>
                  <div>
                    <CardTitle className="text-white text-lg">{report.title}</CardTitle>
                    <CardDescription className="text-gray-400">{report.description}</CardDescription>
                  </div>
                </div>
                <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{report.period}</span>
                  </div>
                  <div>Size: {report.size}</div>
                  <div>
                    Last:{" "}
                    {report.lastGenerated === "In progress"
                      ? "In progress"
                      : report.lastGenerated === "Jan 1, 2025 00:00"
                        ? "Scheduled for Jan 1"
                        : new Date(report.lastGenerated).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  {report.status === "ready" && (
                    <Button
                      size="sm"
                      onClick={() => handleDownload(report)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  )}
                  {report.status === "generating" && (
                    <Button size="sm" disabled className="bg-gray-600 text-gray-300">
                      Generating...
                    </Button>
                  )}
                  {report.status === "scheduled" && (
                    <Button size="sm" disabled className="bg-blue-600/50 text-blue-300">
                      Scheduled
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Compliance Summary */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Compliance Summary</CardTitle>
          <CardDescription className="text-gray-400">
            Current compliance status and upcoming requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-green-400 font-medium">Audit Trail</span>
              </div>
              <p className="text-2xl font-bold text-white">100%</p>
              <p className="text-sm text-gray-400">Complete coverage</p>
            </div>

            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-green-400" />
                <span className="text-green-400 font-medium">Security</span>
              </div>
              <p className="text-2xl font-bold text-white">98.7%</p>
              <p className="text-sm text-gray-400">Compliance score</p>
            </div>

            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                <span className="text-yellow-400 font-medium">KYC</span>
              </div>
              <p className="text-2xl font-bold text-white">94.2%</p>
              <p className="text-sm text-gray-400">Verification rate</p>
            </div>

            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-blue-400" />
                <span className="text-blue-400 font-medium">Treasury</span>
              </div>
              <p className="text-2xl font-bold text-white">$2.4M</p>
              <p className="text-sm text-gray-400">Float coverage</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

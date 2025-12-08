"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, FileText, BookOpen, Users, CheckCircle, ExternalLink } from "lucide-react"

const documents = [
  {
    id: "whitepaper",
    title: "PuffPass Whitepaper",
    description: "Complete protocol overview including architecture, smart contracts, fee economics, and roadmap",
    version: "1.0",
    lastUpdated: "December 2025",
    icon: BookOpen,
    pages: 15,
    category: "Protocol",
  },
  {
    id: "stack-core",
    title: "Technical Stack Documentation",
    description: "Full technical reference including API documentation, database schemas, and deployment guides",
    version: "1.0",
    lastUpdated: "December 2025",
    icon: FileText,
    pages: 12,
    category: "Technical",
  },
  {
    id: "project-status",
    title: "Project Status Report",
    description: "Current completion status, priorities, known issues, and action items for the team",
    version: "1.0",
    lastUpdated: "December 2025",
    icon: CheckCircle,
    pages: 5,
    category: "Management",
  },
  {
    id: "team-onboarding",
    title: "Team Onboarding Guide",
    description: "Quick start guide for new developers joining the PuffPass project",
    version: "1.0",
    lastUpdated: "December 2025",
    icon: Users,
    pages: 4,
    category: "Onboarding",
  },
]

export default function DocsPage() {
  const [downloading, setDownloading] = useState<string | null>(null)

  const downloadDocument = async (docId: string) => {
    setDownloading(docId)
    try {
      const response = await fetch(`/api/docs/download?doc=${docId}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `puffpass-${docId}.md`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Download failed:", error)
    } finally {
      setDownloading(null)
    }
  }

  const downloadAll = async () => {
    setDownloading("all")
    for (const doc of documents) {
      await downloadDocument(doc.id)
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
    setDownloading(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">PuffPass Documentation</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Download comprehensive documentation for the PuffPass protocol including whitepaper, technical specs, and
            team resources.
          </p>
          <div className="mt-6">
            <Button size="lg" onClick={downloadAll} disabled={downloading !== null}>
              <Download className="mr-2 h-5 w-5" />
              {downloading === "all" ? "Downloading..." : "Download All Documents"}
            </Button>
          </div>
        </div>

        {/* Document Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {documents.map((doc) => {
            const Icon = doc.icon
            return (
              <Card key={doc.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{doc.title}</CardTitle>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="secondary">{doc.category}</Badge>
                          <Badge variant="outline">v{doc.version}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="mt-3">{doc.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-end">
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <span>{doc.pages} pages</span>
                    <span>Updated: {doc.lastUpdated}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={() => downloadDocument(doc.id)} disabled={downloading !== null}>
                      <Download className="mr-2 h-4 w-4" />
                      {downloading === doc.id ? "Downloading..." : "Download .md"}
                    </Button>
                    <Button variant="outline" asChild>
                      <a href={`/docs/${doc.id}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-primary">4</div>
            <div className="text-sm text-muted-foreground">Documents</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-primary">36</div>
            <div className="text-sm text-muted-foreground">Total Pages</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-primary">70%</div>
            <div className="text-sm text-muted-foreground">MVP Complete</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-primary">v1.0</div>
            <div className="text-sm text-muted-foreground">Current Version</div>
          </Card>
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>For questions or access to additional documentation, contact the project lead.</p>
          <p className="mt-2">Copyright 2025 PuffPass Protocol. All Rights Reserved.</p>
        </div>
      </div>
    </div>
  )
}

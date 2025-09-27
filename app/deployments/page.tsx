import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { GitBranch, Clock, Globe, CheckCircle, ExternalLink, Copy, MoreHorizontal, BarChart3 } from "lucide-react"

export default function DeploymentsPage() {
  const deployments = [
    {
      id: "8JfpicWAW",
      environment: "Preview",
      status: "Ready",
      branch: "max/05-10-image-ui",
      commit: "15852de",
      message: "fix",
      duration: "7m 24s",
      timeAgo: "12m ago",
      author: "MaxLeiter",
      url: "https://mycora-8jfpicwaw.vercel.app",
    },
    {
      id: "BOotKPg4n",
      environment: "Production",
      status: "Ready",
      branch: "main",
      commit: "b76b5a7",
      message: "set metadata on project creation (#1...",
      duration: "5m 2s",
      timeAgo: "38m ago",
      author: "aryamankha",
      url: "https://mycora.vercel.app",
    },
    {
      id: "ti3VpKTef",
      environment: "Preview",
      status: "Ready",
      branch: "set-metadata",
      commit: "67d0c9f",
      message: "set metadata on project creation",
      duration: "6m 19s",
      timeAgo: "1h ago",
      author: "aryamankha",
      url: "https://mycora-ti3vpktef.vercel.app",
    },
  ]

  const metrics = [
    { label: "Total Deployments", value: "247", change: "+12%" },
    { label: "Success Rate", value: "98.7%", change: "+0.3%" },
    { label: "Avg Build Time", value: "4m 32s", change: "-15%" },
    { label: "Active Previews", value: "8", change: "+2" },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/30">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Deployments</h1>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <GitBranch className="w-4 h-4" />
                <span>Continuously generated from</span>
                <span className="text-foreground font-mono">vercel/v0</span>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <Card key={index} className="metric-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <p className="text-2xl font-semibold text-foreground mt-1">{metric.value}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-green-400">{metric.change}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-sm bg-transparent">
              All Branches
            </Button>
            <Button variant="outline" size="sm" className="text-sm bg-transparent">
              Select Date Range
            </Button>
            <Button variant="outline" size="sm" className="text-sm bg-transparent">
              All Environments
            </Button>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="secondary" className="status-ready">
              <CheckCircle className="w-3 h-3 mr-1" />
              Status 6/6
            </Badge>
          </div>
        </div>

        {/* Deployments List */}
        <div className="space-y-3">
          {deployments.map((deployment) => (
            <Card key={deployment.id} className="deployment-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="status-ready px-2 py-1">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {deployment.status}
                      </Badge>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-foreground">{deployment.id}</span>
                          <Badge variant="outline" className="text-xs">
                            {deployment.environment}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <GitBranch className="w-3 h-3" />
                          <span className="font-mono">{deployment.branch}</span>
                          <span className="font-mono">{deployment.commit}</span>
                          <span>{deployment.message}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{deployment.duration}</span>
                      </div>
                      <div className="text-muted-foreground mt-1">
                        {deployment.timeAgo} by {deployment.author}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Deployment Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
          {/* Build Performance */}
          <Card className="bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Build Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Average Build Time</span>
                  <span className="font-mono text-sm">4m 32s</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Fastest Build</span>
                  <span className="font-mono text-sm text-green-400">2m 18s</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Cache Hit Rate</span>
                  <span className="font-mono text-sm">87%</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Bundle Size</span>
                  <span className="font-mono text-sm">2.4 MB</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Environment Status */}
          <Card className="bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Environment Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm">Production</span>
                  </div>
                  <Badge variant="secondary" className="status-ready">
                    Healthy
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-sm">Preview</span>
                  </div>
                  <Badge variant="secondary" className="status-ready">
                    8 Active
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span className="text-sm">Development</span>
                  </div>
                  <Badge variant="secondary" className="status-building">
                    Building
                  </Badge>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Requests (24h)</span>
                  <span className="font-mono text-sm">12.4K</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

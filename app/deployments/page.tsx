import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  GitBranch,
  Clock,
  Globe,
  CheckCircle,
  MoreHorizontal,
  BarChart3,
  Activity,
  TrendingUp,
  Database,
  Server,
} from "lucide-react"
import { DeploymentsList } from "@/components/deployments/deployments-list"
import { DeploymentMetrics } from "@/components/deployments/deployment-metrics"
import { RealTimeMonitor } from "@/components/deployments/real-time-monitor"
import { AnalyticsCharts } from "@/components/deployments/analytics-charts"

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
      <div className="border-b border-border bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">Deployment Dashboard</h1>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <GitBranch className="w-4 h-4" />
                  <span>PuffPass Platform</span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  <span>Real-time monitoring</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Database className="w-4 h-4 mr-2" />
                View Logs
              </Button>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">Active Deployments</p>
                  <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-1">12</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400 mr-1" />
                <span className="text-green-600 dark:text-green-400 font-medium">+2 from yesterday</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Success Rate</p>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-1">98.7%</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-1" />
                <span className="text-blue-600 dark:text-blue-400 font-medium">+0.3% this week</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border-purple-200 dark:border-purple-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Avg Build Time</p>
                  <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-1">4m 32s</p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                  <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400 mr-1" />
                <span className="text-green-600 dark:text-green-400 font-medium">-15% faster</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-orange-200 dark:border-orange-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Preview Branches</p>
                  <p className="text-3xl font-bold text-orange-900 dark:text-orange-100 mt-1">8</p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                  <GitBranch className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <TrendingUp className="w-4 h-4 text-orange-600 dark:text-orange-400 mr-1" />
                <span className="text-orange-600 dark:text-orange-400 font-medium">+2 active</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="deployments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-fit lg:grid-cols-5">
            <TabsTrigger value="deployments" className="flex items-center gap-2">
              <Server className="w-4 h-4" />
              Deployments
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Metrics
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="monitor" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Monitor
            </TabsTrigger>
            <TabsTrigger value="environments" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Environments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deployments" className="space-y-6">
            <DeploymentsList />
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6">
            <DeploymentMetrics />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsCharts />
          </TabsContent>

          <TabsContent value="monitor" className="space-y-6">
            <RealTimeMonitor />
          </TabsContent>

          <TabsContent value="environments" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    Production
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                    >
                      Healthy
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Last Deploy</span>
                    <span className="text-sm font-mono">2h ago</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Uptime</span>
                    <span className="text-sm font-mono">99.9%</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Active Branches</span>
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                    >
                      8 Active
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Auto Deploy</span>
                    <span className="text-sm font-mono">Enabled</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Last Build</span>
                    <span className="text-sm font-mono">12m ago</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                    Development
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge
                      variant="secondary"
                      className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                    >
                      Building
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Progress</span>
                    <span className="text-sm font-mono">67%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">ETA</span>
                    <span className="text-sm font-mono">3m 15s</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

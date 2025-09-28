"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, Calendar, Users, GitBranch, Clock, Zap, AlertTriangle } from "lucide-react"

export function DeploymentAnalytics() {
  const deploymentStats = [
    { period: "Today", deployments: 12, success: 11, failed: 1 },
    { period: "This Week", deployments: 89, success: 86, failed: 3 },
    { period: "This Month", deployments: 347, success: 341, failed: 6 },
    { period: "Last 3 Months", deployments: 1024, success: 1009, failed: 15 },
  ]

  const topContributors = [
    { name: "MaxLeiter", deployments: 45, success: 44, avatar: "ML" },
    { name: "aryamankha", deployments: 38, success: 37, avatar: "AK" },
    { name: "devteam", deployments: 32, success: 31, avatar: "DT" },
    { name: "admin", deployments: 28, success: 28, avatar: "AD" },
  ]

  const branchActivity = [
    { branch: "main", deployments: 156, lastDeploy: "2h ago", status: "success" },
    { branch: "develop", deployments: 89, lastDeploy: "4h ago", status: "success" },
    { branch: "feature/rewards", deployments: 23, lastDeploy: "1d ago", status: "building" },
    { branch: "hotfix/auth", deployments: 12, lastDeploy: "3d ago", status: "success" },
  ]

  const recentIssues = [
    {
      type: "Build Failure",
      message: "TypeScript compilation error in auth module",
      branch: "feature/new-auth",
      time: "2h ago",
      severity: "high",
    },
    {
      type: "Performance",
      message: "Bundle size increased by 15% in latest build",
      branch: "main",
      time: "6h ago",
      severity: "medium",
    },
    {
      type: "Dependency",
      message: "Security vulnerability in lodash dependency",
      branch: "develop",
      time: "1d ago",
      severity: "high",
    },
  ]

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
      case "low":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
    }
  }

  return (
    <div className="space-y-6">
      {/* Deployment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {deploymentStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">{stat.period}</h3>
                <Calendar className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-foreground">{stat.deployments}</span>
                  <span className="text-sm text-muted-foreground">total</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-600 dark:text-green-400">{stat.success} success</span>
                  <span className="text-red-600 dark:text-red-400">{stat.failed} failed</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${(stat.success / stat.deployments) * 100}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="contributors" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="contributors">Contributors</TabsTrigger>
          <TabsTrigger value="branches">Branches</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
        </TabsList>

        <TabsContent value="contributors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Top Contributors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topContributors.map((contributor, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">{contributor.avatar}</span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{contributor.name}</p>
                        <p className="text-sm text-muted-foreground">{contributor.deployments} deployments</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      >
                        {((contributor.success / contributor.deployments) * 100).toFixed(1)}% success
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branches" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="w-5 h-5" />
                Branch Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {branchActivity.map((branch, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <GitBranch className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-foreground font-mono">{branch.branch}</p>
                        <p className="text-sm text-muted-foreground">
                          {branch.deployments} deployments • Last: {branch.lastDeploy}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={
                        branch.status === "success"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : branch.status === "building"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                      }
                    >
                      {branch.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Build Times
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Average</span>
                    <span className="font-mono text-sm">4m 32s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Fastest</span>
                    <span className="font-mono text-sm text-green-600">2m 18s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Slowest</span>
                    <span className="font-mono text-sm text-red-600">8m 45s</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Success Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">This Week</span>
                    <span className="font-mono text-sm text-green-600">98.7%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">This Month</span>
                    <span className="font-mono text-sm text-green-600">97.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">All Time</span>
                    <span className="font-mono text-sm text-green-600">96.8%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Deploy Frequency</span>
                    <span className="font-mono text-sm text-green-600">+12%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Build Speed</span>
                    <span className="font-mono text-sm text-green-600">+8%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Bundle Size</span>
                    <span className="font-mono text-sm text-red-600">+3%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="issues" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Recent Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentIssues.map((issue, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-foreground">{issue.type}</span>
                        <Badge className={getSeverityColor(issue.severity)}>{issue.severity}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{issue.message}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <GitBranch className="w-3 h-3" />
                        <span className="font-mono">{issue.branch}</span>
                        <span>•</span>
                        <span>{issue.time}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

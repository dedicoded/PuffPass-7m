import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileCode, Folder, ExternalLink } from "lucide-react"

interface DeploymentSourceProps {
  deployment: {
    branch: string
    commit_hash: string
    commit_message?: string
  }
}

export function DeploymentSource({ deployment }: DeploymentSourceProps) {
  const sourceFiles = [
    { name: "app/page.tsx", size: "4.2 KB", type: "file" },
    { name: "app/layout.tsx", size: "1.8 KB", type: "file" },
    { name: "components/", size: "—", type: "folder" },
    { name: "lib/", size: "—", type: "folder" },
    { name: "public/", size: "—", type: "folder" },
    { name: "package.json", size: "892 B", type: "file" },
    { name: "next.config.mjs", size: "156 B", type: "file" },
    { name: "tsconfig.json", size: "445 B", type: "file" },
  ]

  return (
    <Card className="deployment-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileCode className="w-5 h-5" />
            Source Files
          </CardTitle>
          <Button variant="outline" size="sm" asChild>
            <a
              href={`https://github.com/vercel/v0/tree/${deployment.commit_hash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View on GitHub
            </a>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {sourceFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                {file.type === "folder" ? (
                  <Folder className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <FileCode className="w-4 h-4 text-muted-foreground" />
                )}
                <span className="text-sm font-mono text-foreground">{file.name}</span>
              </div>
              <span className="text-xs text-muted-foreground">{file.size}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

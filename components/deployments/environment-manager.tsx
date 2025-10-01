"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Globe,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  CheckCircle,
  XCircle,
  Settings,
  Database,
  Server,
} from "lucide-react"

interface Environment {
  id: string
  project_name: string
  name: string
  description: string | null
  variables: Record<string, string>
  is_active: boolean
  created_at: string
  updated_at: string
}

interface EnvironmentManagerProps {
  projectName?: string
}

export function EnvironmentManager({ projectName }: EnvironmentManagerProps) {
  const [environments, setEnvironments] = useState<Environment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEnvironment, setSelectedEnvironment] = useState<Environment | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})

  // Form state
  const [formData, setFormData] = useState({
    project_name: projectName || "",
    name: "",
    description: "",
    variables: {} as Record<string, string>,
    is_active: true,
  })

  useEffect(() => {
    fetchEnvironments()
  }, [projectName])

  const fetchEnvironments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (projectName) params.append("project_name", projectName)

      const response = await fetch(`/api/environments?${params}`)
      const data = await response.json()

      if (response.ok) {
        setEnvironments(data.environments)
      }
    } catch (error) {
      console.error("Error fetching environments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEnvironment = async () => {
    try {
      const response = await fetch("/api/environments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchEnvironments()
        setIsCreateDialogOpen(false)
        resetForm()
      }
    } catch (error) {
      console.error("Error creating environment:", error)
    }
  }

  const handleUpdateEnvironment = async () => {
    if (!selectedEnvironment) return

    try {
      const response = await fetch("/api/environments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedEnvironment.id, ...formData }),
      })

      if (response.ok) {
        await fetchEnvironments()
        setIsEditDialogOpen(false)
        resetForm()
      }
    } catch (error) {
      console.error("Error updating environment:", error)
    }
  }

  const handleDeleteEnvironment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this environment?")) return

    try {
      const response = await fetch(`/api/environments?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchEnvironments()
      }
    } catch (error) {
      console.error("Error deleting environment:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      project_name: projectName || "",
      name: "",
      description: "",
      variables: {},
      is_active: true,
    })
    setSelectedEnvironment(null)
  }

  const openEditDialog = (environment: Environment) => {
    setSelectedEnvironment(environment)
    setFormData({
      project_name: environment.project_name,
      name: environment.name,
      description: environment.description || "",
      variables: environment.variables,
      is_active: environment.is_active,
    })
    setIsEditDialogOpen(true)
  }

  const addVariable = () => {
    const key = prompt("Enter variable name:")
    if (key && !formData.variables[key]) {
      const value = prompt("Enter variable value:")
      if (value !== null) {
        setFormData({
          ...formData,
          variables: { ...formData.variables, [key]: value },
        })
      }
    }
  }

  const removeVariable = (key: string) => {
    const { [key]: removed, ...rest } = formData.variables
    setFormData({ ...formData, variables: rest })
  }

  const toggleSecretVisibility = (envId: string, key: string) => {
    const secretKey = `${envId}-${key}`
    setShowSecrets((prev) => ({ ...prev, [secretKey]: !prev[secretKey] }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getEnvironmentIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case "production":
        return <Server className="w-4 h-4 text-green-600" />
      case "staging":
        return <Database className="w-4 h-4 text-yellow-600" />
      case "development":
        return <Settings className="w-4 h-4 text-blue-600" />
      default:
        return <Globe className="w-4 h-4 text-gray-600" />
    }
  }

  const getEnvironmentColor = (name: string) => {
    switch (name.toLowerCase()) {
      case "production":
        return "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-800"
      case "staging":
        return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-300 dark:border-yellow-800"
      case "development":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/30 dark:text-gray-300 dark:border-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Environment Management</h2>
          <p className="text-muted-foreground">Manage environment variables and configurations</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Environment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Environment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="project_name">Project Name</Label>
                  <Input
                    id="project_name"
                    value={formData.project_name}
                    onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                    placeholder="e.g., puffpass-frontend"
                  />
                </div>
                <div>
                  <Label htmlFor="name">Environment Name</Label>
                  <Select value={formData.name} onValueChange={(value) => setFormData({ ...formData, name: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select environment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="production">Production</SelectItem>
                      <SelectItem value="staging">Staging</SelectItem>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="preview">Preview</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Environment description..."
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Environment Variables</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addVariable}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Variable
                  </Button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {Object.entries(formData.variables).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2 p-2 border rounded">
                      <Input value={key} readOnly className="flex-1" />
                      <Input value={value} readOnly className="flex-1" />
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeVariable(key)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active Environment</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateEnvironment}>Create Environment</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Environments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {environments.map((environment) => (
          <Card key={environment.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getEnvironmentIcon(environment.name)}
                  <CardTitle className="text-lg">{environment.name}</CardTitle>
                </div>
                <div className="flex items-center gap-1">
                  <Badge className={getEnvironmentColor(environment.name)}>{environment.project_name}</Badge>
                  {environment.is_active ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
              {environment.description && <p className="text-sm text-muted-foreground">{environment.description}</p>}
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Environment Variables</span>
                  <span className="text-xs text-muted-foreground">
                    {Object.keys(environment.variables).length} variables
                  </span>
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {Object.entries(environment.variables).map(([key, value]) => {
                    const secretKey = `${environment.id}-${key}`
                    const isSecret =
                      key.toLowerCase().includes("secret") ||
                      key.toLowerCase().includes("key") ||
                      key.toLowerCase().includes("password")
                    const showValue = !isSecret || showSecrets[secretKey]

                    return (
                      <div key={key} className="flex items-center gap-2 p-2 bg-muted/50 rounded text-xs">
                        <span className="font-mono text-muted-foreground min-w-0 flex-1 truncate">{key}</span>
                        <div className="flex items-center gap-1">
                          <span className="font-mono min-w-0 flex-1 truncate">{showValue ? value : "••••••••"}</span>
                          {isSecret && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => toggleSecretVisibility(environment.id, key)}
                            >
                              {showValue ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => copyToClipboard(value)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-xs text-muted-foreground">
                  Updated {new Date(environment.updated_at).toLocaleDateString()}
                </span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEditDialog(environment)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteEnvironment(environment.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Environment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_project_name">Project Name</Label>
                <Input
                  id="edit_project_name"
                  value={formData.project_name}
                  onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_name">Environment Name</Label>
                <Input
                  id="edit_name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit_description">Description</Label>
              <Textarea
                id="edit_description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Environment Variables</Label>
                <Button type="button" variant="outline" size="sm" onClick={addVariable}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Variable
                </Button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {Object.entries(formData.variables).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2 p-2 border rounded">
                    <Input value={key} readOnly className="flex-1" />
                    <Input value={value} readOnly className="flex-1" />
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeVariable(key)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit_is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="edit_is_active">Active Environment</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateEnvironment}>Update Environment</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

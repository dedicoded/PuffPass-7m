"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Upload, CheckCircle, Clock, AlertTriangle, User, FileText, Camera, ArrowRight } from "lucide-react"

interface KYCStatus {
  status: string
  verification?: any
  documents?: any[]
  auditLog?: any[]
  completionPercentage?: number
}

export default function KYCPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [kycStatus, setKycStatus] = useState<KYCStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    ssnLastFour: "",
    phone: "",
    email: "",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    documentType: "drivers_license",
    documentNumber: "",
    documentExpiry: "",
    documentIssuingState: "",
  })

  useEffect(() => {
    fetchUserSession()
  }, [])

  useEffect(() => {
    if (userId) {
      fetchKYCStatus()
    }
  }, [userId])

  const fetchUserSession = async () => {
    try {
      const response = await fetch("/api/auth/session")
      if (response.ok) {
        const data = await response.json()
        if (data.user?.id) {
          setUserId(data.user.id)
        }
      }
    } catch (error) {
      console.error("Failed to fetch user session:", error)
    }
  }

  const fetchKYCStatus = async () => {
    if (!userId) return

    try {
      const response = await fetch(`/api/kyc/status?userId=${userId}`)
      const data = await response.json()
      setKycStatus(data)
    } catch (error) {
      console.error("Failed to fetch KYC status:", error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmitPersonalInfo = async () => {
    setIsLoading(true)
    try {
      if (!userId) {
        alert("Please log in to continue")
        return
      }

      const response = await fetch("/api/kyc/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          ...formData,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setCurrentStep(2)
        fetchKYCStatus()
      } else {
        alert(result.error || "Failed to submit information")
      }
    } catch (error) {
      console.error("Submission error:", error)
      alert("Failed to submit information")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (file: File, documentType: string) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("verificationId", kycStatus?.verification?.id || "")
    formData.append("documentType", documentType)

    try {
      const response = await fetch("/api/kyc/upload-document", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        fetchKYCStatus()
        alert("Document uploaded successfully")
      } else {
        alert(result.error || "Failed to upload document")
      }
    } catch (error) {
      console.error("Upload error:", error)
      alert("Failed to upload document")
    }
  }

  // If user already has verification in progress or completed
  if (kycStatus && kycStatus.status !== "not_started") {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="w-6 h-6 text-primary" />
                <span className="font-semibold text-lg">Identity Verification</span>
              </div>
              <Badge
                variant={
                  kycStatus.verification?.status === "approved"
                    ? "default"
                    : kycStatus.verification?.status === "rejected"
                      ? "destructive"
                      : "secondary"
                }
              >
                {kycStatus.verification?.status?.toUpperCase() || "PENDING"}
              </Badge>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Verification Status</span>
                </CardTitle>
                <CardDescription>Track your identity verification progress</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Overall Progress</span>
                  <span className="font-medium">{kycStatus.completionPercentage || 0}%</span>
                </div>
                <Progress value={kycStatus.completionPercentage || 0} />

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="flex items-center space-x-2">
                    {kycStatus.verification?.identity_verified ? (
                      <CheckCircle className="w-4 h-4 text-success" />
                    ) : (
                      <Clock className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="text-sm">Identity Verified</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {kycStatus.verification?.address_verified ? (
                      <CheckCircle className="w-4 h-4 text-success" />
                    ) : (
                      <Clock className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="text-sm">Address Verified</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {kycStatus.verification?.age_verified ? (
                      <CheckCircle className="w-4 h-4 text-success" />
                    ) : (
                      <Clock className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="text-sm">Age Verified</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {kycStatus.verification?.document_verified ? (
                      <CheckCircle className="w-4 h-4 text-success" />
                    ) : (
                      <Clock className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="text-sm">Documents Verified</span>
                  </div>
                </div>

                {kycStatus.verification?.status === "approved" && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Your identity has been successfully verified! You can now access all platform features.
                    </AlertDescription>
                  </Alert>
                )}

                {kycStatus.verification?.status === "rejected" && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Your verification was rejected. {kycStatus.verification?.verification_notes}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {kycStatus.auditLog && kycStatus.auditLog.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Verification History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {kycStatus.auditLog.map((entry, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <div>
                          <span className="font-medium capitalize">{entry.action.replace("_", " ")}</span>
                          {entry.reason && <p className="text-sm text-muted-foreground">{entry.reason}</p>}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(entry.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    )
  }

  // New verification flow
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-primary" />
              <span className="font-semibold text-lg">Identity Verification</span>
            </div>
            <Badge variant="secondary">Required for Cannabis Purchases</Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {currentStep > 1 ? <CheckCircle className="w-4 h-4" /> : "1"}
              </div>
              <div className="w-16 h-0.5 bg-border"></div>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {currentStep > 2 ? <CheckCircle className="w-4 h-4" /> : "2"}
              </div>
              <div className="w-16 h-0.5 bg-border"></div>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                3
              </div>
            </div>
          </div>

          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Personal Information</span>
                </CardTitle>
                <CardDescription>Provide your personal details for identity verification</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="streetAddress">Street Address</Label>
                  <Input
                    id="streetAddress"
                    value={formData.streetAddress}
                    onChange={(e) => handleInputChange("streetAddress", e.target.value)}
                    placeholder="123 Main St"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      placeholder="San Francisco"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Select value={formData.state} onValueChange={(value) => handleInputChange("state", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CA">California</SelectItem>
                        <SelectItem value="NY">New York</SelectItem>
                        <SelectItem value="TX">Texas</SelectItem>
                        <SelectItem value="FL">Florida</SelectItem>
                        {/* Add more states as needed */}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange("zipCode", e.target.value)}
                      placeholder="94102"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleSubmitPersonalInfo}
                  disabled={isLoading || !formData.firstName || !formData.lastName || !formData.dateOfBirth}
                  className="w-full"
                >
                  {isLoading ? "Submitting..." : "Continue"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Document Upload</span>
                </CardTitle>
                <CardDescription>Upload your government-issued ID and a selfie for verification</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Your documents are encrypted and stored securely. We never share your personal information.
                  </AlertDescription>
                </Alert>

                <Tabs defaultValue="id-front" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="id-front">ID Front</TabsTrigger>
                    <TabsTrigger value="id-back">ID Back</TabsTrigger>
                    <TabsTrigger value="selfie">Selfie</TabsTrigger>
                  </TabsList>

                  <TabsContent value="id-front" className="space-y-4">
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                      <Upload className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-4">
                        Upload the front of your driver's license or state ID
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileUpload(file, "id_front")
                        }}
                        className="hidden"
                        id="id-front-upload"
                      />
                      <Button asChild variant="outline">
                        <label htmlFor="id-front-upload" className="cursor-pointer">
                          Choose File
                        </label>
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="id-back" className="space-y-4">
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                      <Upload className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-4">
                        Upload the back of your driver's license or state ID
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileUpload(file, "id_back")
                        }}
                        className="hidden"
                        id="id-back-upload"
                      />
                      <Button asChild variant="outline">
                        <label htmlFor="id-back-upload" className="cursor-pointer">
                          Choose File
                        </label>
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="selfie" className="space-y-4">
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                      <Camera className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-4">
                        Take a clear selfie holding your ID next to your face
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        capture="user"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileUpload(file, "selfie")
                        }}
                        className="hidden"
                        id="selfie-upload"
                      />
                      <Button asChild variant="outline">
                        <label htmlFor="selfie-upload" className="cursor-pointer">
                          Take Selfie
                        </label>
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>

                <Button onClick={() => setCurrentStep(3)} className="w-full">
                  Complete Verification
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )}

          {currentStep === 3 && (
            <Card>
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>Verification Submitted</CardTitle>
                <CardDescription>Your identity verification has been submitted for review</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    Our team will review your documents within 1-2 business days. You'll receive an email notification
                    once the review is complete.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <h4 className="font-medium">What happens next?</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Document verification (automated)</li>
                    <li>• Identity matching and age verification</li>
                    <li>• Manual review by our compliance team</li>
                    <li>• Email notification with results</li>
                  </ul>
                </div>

                <Button className="w-full" asChild>
                  <a href="/customer">Return to Dashboard</a>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getMerchantProfile, createMerchantProfile } from "@/lib/db"

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== "merchant") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const profile = await getMerchantProfile(session.id)
    return NextResponse.json({ profile })
  } catch (error) {
    console.error("[v0] Get merchant profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== "merchant") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if profile already exists
    const existingProfile = await getMerchantProfile(session.id)
    if (existingProfile) {
      return NextResponse.json({ error: "Profile already exists" }, { status: 409 })
    }

    const profileData = await request.json()

    // Validate required fields
    const requiredFields = ["business_name", "license_number", "business_address"]
    for (const field of requiredFields) {
      if (!profileData[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    profileData.user_id = session.id
    profileData.approval_status = "pending"

    const profile = await createMerchantProfile(profileData)
    return NextResponse.json({ success: true, profile })
  } catch (error) {
    console.error("[v0] Create merchant profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

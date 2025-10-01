import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { paymentRegistry } from "@/lib/payment-providers/registry"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { userId, personalDetails } = await request.json()

    console.log("[v0] Creating Cybrid customer for user:", userId)

    // Get Cybrid provider from registry
    const cybridProvider = paymentRegistry.get("cybrid")
    if (!cybridProvider) {
      return NextResponse.json({ error: "Cybrid provider not available" }, { status: 500 })
    }

    // Create customer through provider
    const result = await cybridProvider.createCustomer({
      userId,
      email: personalDetails.email,
      firstName: personalDetails.firstName,
      lastName: personalDetails.lastName,
      phoneNumber: personalDetails.phoneNumber,
      dateOfBirth: personalDetails.dateOfBirth,
      address: personalDetails.address
        ? {
            street: personalDetails.address,
            city: personalDetails.city,
            state: personalDetails.state,
            zipCode: personalDetails.zipCode,
            country: personalDetails.country || "US",
          }
        : undefined,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    // Store Cybrid customer ID in database
    await sql`
      UPDATE users 
      SET cybrid_customer_id = ${result.customerId}
      WHERE id = ${userId}
    `

    console.log("[v0] Cybrid customer created successfully:", result.customerId)

    return NextResponse.json({
      success: true,
      cybridCustomerId: result.customerId,
    })
  } catch (error: any) {
    console.error("[v0] Error creating Cybrid customer:", error)
    return NextResponse.json({ error: error.message || "Failed to create customer" }, { status: 500 })
  }
}

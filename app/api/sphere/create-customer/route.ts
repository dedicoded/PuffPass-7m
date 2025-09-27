import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { userId, personalDetails } = await request.json()

    const response = await fetch("https://api.spherepay.co/v1/customers", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SPHERE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: personalDetails.email,
        first_name: personalDetails.firstName,
        last_name: personalDetails.lastName,
        phone: personalDetails.phoneNumber,
        address: {
          line1: personalDetails.address,
          city: personalDetails.city,
          state: personalDetails.state,
          postal_code: personalDetails.zipCode,
          country: personalDetails.country || "US",
        },
        date_of_birth: personalDetails.dateOfBirth,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to create Sphere customer")
    }

    const sphereCustomer = await response.json()

    // Store Sphere customer ID
    await sql`
      UPDATE users 
      SET sphere_customer_id = ${sphereCustomer.id}
      WHERE id = ${userId}
    `

    return NextResponse.json({
      success: true,
      sphereCustomerId: sphereCustomer.id,
    })
  } catch (error) {
    console.error("Error creating Sphere customer:", error)
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 })
  }
}

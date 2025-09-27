import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { userId, personalDetails } = await request.json()

    // Create customer in Cybrid
    const cybridResponse = await fetch("https://bank.sandbox.cybrid.app/api/customers", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CYBRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "individual",
        name: {
          first: personalDetails.firstName,
          last: personalDetails.lastName,
        },
        address: {
          street: personalDetails.address,
          city: personalDetails.city,
          subdivision: personalDetails.state,
          postal_code: personalDetails.zipCode,
          country_code: personalDetails.country || "US",
        },
        date_of_birth: personalDetails.dateOfBirth,
        phone_number: personalDetails.phoneNumber,
        email_address: personalDetails.email,
      }),
    })

    if (!cybridResponse.ok) {
      throw new Error("Failed to create Cybrid customer")
    }

    const cybridCustomer = await cybridResponse.json()

    // Store Cybrid customer ID in database
    await sql`
      UPDATE users 
      SET cybrid_customer_id = ${cybridCustomer.guid}
      WHERE id = ${userId}
    `

    return NextResponse.json({
      success: true,
      cybridCustomerId: cybridCustomer.guid,
    })
  } catch (error) {
    console.error("Error creating Cybrid customer:", error)
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 })
  }
}

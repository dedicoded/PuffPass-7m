import { type NextRequest, NextResponse } from "next/server"
import { getSql } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, merchantAddress, amount, currency, description, expiresAt, status } = body

    if (!id || !merchantAddress || !amount || !currency) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const sql = await getSql()

    // Create payment request in database
    await sql`
      INSERT INTO payment_requests (
        id,
        merchant_address,
        amount,
        currency,
        description,
        expires_at,
        status,
        created_at
      ) VALUES (
        ${id},
        ${merchantAddress},
        ${amount},
        ${currency},
        ${description || ""},
        ${expiresAt},
        ${status || "pending"},
        NOW()
      )
    `

    return NextResponse.json({ success: true, id })
  } catch (error: any) {
    console.error("[v0] Payment request creation error:", error)
    return NextResponse.json({ error: error.message || "Failed to create payment request" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const merchantAddress = searchParams.get("merchantAddress")

    const sql = await getSql()

    if (id) {
      // Get specific payment request
      const result = await sql`
        SELECT * FROM payment_requests
        WHERE id = ${id}
      `

      if (result.length === 0) {
        return NextResponse.json({ error: "Payment request not found" }, { status: 404 })
      }

      const request = result[0]

      // Check if expired
      if (new Date(request.expires_at) < new Date()) {
        return NextResponse.json({ error: "Payment request expired" }, { status: 410 })
      }

      // Check if already paid
      if (request.status === "paid") {
        return NextResponse.json({ error: "Payment request already paid" }, { status: 410 })
      }

      return NextResponse.json({ success: true, request })
    } else if (merchantAddress) {
      // Get all requests for merchant
      const requests = await sql`
        SELECT * FROM payment_requests
        WHERE merchant_address = ${merchantAddress}
        ORDER BY created_at DESC
        LIMIT 50
      `

      return NextResponse.json({ success: true, requests })
    } else {
      return NextResponse.json({ error: "Missing id or merchantAddress parameter" }, { status: 400 })
    }
  } catch (error: any) {
    console.error("[v0] Payment request fetch error:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch payment request" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, transactionHash } = body

    if (!id || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const sql = await getSql()

    // Update payment request status
    await sql`
      UPDATE payment_requests
      SET 
        status = ${status},
        transaction_hash = ${transactionHash || null},
        paid_at = ${status === "paid" ? sql`NOW()` : null},
        updated_at = NOW()
      WHERE id = ${id}
    `

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Payment request update error:", error)
    return NextResponse.json({ error: error.message || "Failed to update payment request" }, { status: 500 })
  }
}

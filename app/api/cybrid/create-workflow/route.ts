import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { customerId, workflowType = "plaid_link_token" } = await request.json()

    const response = await fetch("https://bank.sandbox.cybrid.app/api/workflows", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CYBRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: workflowType,
        customer_guid: customerId,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to create workflow")
    }

    const workflow = await response.json()

    return NextResponse.json({
      success: true,
      workflowId: workflow.guid,
      plaidLinkToken: workflow.plaid_link_token,
    })
  } catch (error) {
    console.error("Error creating workflow:", error)
    return NextResponse.json({ error: "Failed to create workflow" }, { status: 500 })
  }
}

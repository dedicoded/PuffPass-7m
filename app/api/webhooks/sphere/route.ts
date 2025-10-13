import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(req: Request) {
  const payload = await req.json()

  try {
    console.log("[v0] Sphere webhook received:", payload.event)

    const { event, data } = payload

    let newStatus: string | null = null
    if (event.includes("success")) newStatus = "confirmed"
    if (event.includes("failed")) newStatus = "failed"
    if (event.includes("cancelled")) newStatus = "cancelled"

    if (newStatus) {
      await sql`
        UPDATE transactions
        SET status = ${newStatus}, updated_at = now()
        WHERE provider = 'sphere' AND provider_txn_id = ${data.id};
      `

      console.log("[v0] Updated transaction status:", { txnId: data.id, newStatus })
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 })
  } catch (err: any) {
    console.error("Sphere webhook error:", err)
    return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 500 })
  }
}

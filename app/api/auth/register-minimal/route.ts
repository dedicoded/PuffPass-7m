console.log("[v0] Register API route loaded at", new Date().toISOString())

export const runtime = "nodejs"

export async function GET() {
  return new Response(
    JSON.stringify({
      message: "Ultra-minimal API route working",
      timestamp: new Date().toISOString(),
      status: "basic_test",
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    },
  )
}

export async function POST() {
  return new Response(
    JSON.stringify({
      success: true,
      message: "Ultra-minimal POST working",
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    },
  )
}

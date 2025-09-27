import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const categories = [
      { value: "flower", label: "Flower", description: "Cannabis flower products" },
      { value: "edibles", label: "Edibles", description: "Cannabis-infused food products" },
      { value: "concentrates", label: "Concentrates", description: "Cannabis extracts and concentrates" },
      { value: "topicals", label: "Topicals", description: "Cannabis-infused topical products" },
      { value: "accessories", label: "Accessories", description: "Cannabis-related accessories" },
      { value: "pre-rolls", label: "Pre-rolls", description: "Pre-rolled cannabis joints" },
      { value: "vapes", label: "Vapes", description: "Vape cartridges and devices" },
      { value: "tinctures", label: "Tinctures", description: "Cannabis tinctures and oils" },
    ]

    const strainTypes = [
      { value: "indica", label: "Indica", description: "Relaxing, body-focused effects" },
      { value: "sativa", label: "Sativa", description: "Energizing, mind-focused effects" },
      { value: "hybrid", label: "Hybrid", description: "Balanced indica and sativa effects" },
    ]

    const unitTypes = [
      { value: "gram", label: "Gram" },
      { value: "eighth", label: "Eighth (3.5g)" },
      { value: "quarter", label: "Quarter (7g)" },
      { value: "half", label: "Half Ounce (14g)" },
      { value: "ounce", label: "Ounce (28g)" },
      { value: "package", label: "Package" },
      { value: "cartridge", label: "Cartridge" },
      { value: "bottle", label: "Bottle" },
      { value: "piece", label: "Piece" },
    ]

    return NextResponse.json({
      categories,
      strainTypes,
      unitTypes,
    })
  } catch (error) {
    console.error("[v0] Get categories error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

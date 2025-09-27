import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Mock analytics data for now - in a real app this would come from the database
    const analytics = {
      totalSales: 15420.5,
      totalOrders: 127,
      averageOrderValue: 121.42,
      topProducts: [
        { name: "Blue Dream", sales: 45, revenue: 2250 },
        { name: "OG Kush", sales: 38, revenue: 1900 },
        { name: "Sour Diesel", sales: 32, revenue: 1600 },
      ],
      salesByDay: [
        { date: "2024-01-01", sales: 1200 },
        { date: "2024-01-02", sales: 1500 },
        { date: "2024-01-03", sales: 1100 },
        { date: "2024-01-04", sales: 1800 },
        { date: "2024-01-05", sales: 1300 },
        { date: "2024-01-06", sales: 1600 },
        { date: "2024-01-07", sales: 1400 },
      ],
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error("Error fetching merchant analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}

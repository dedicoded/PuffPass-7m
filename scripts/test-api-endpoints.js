// Test script to verify API endpoints are returning proper JSON responses
console.log("[v0] Testing API endpoints...")

import { getBaseUrl, createApiUrl } from "../lib/base-url.js"

const BASE_URL = getBaseUrl()
console.log(`[v0] Using base URL: ${BASE_URL}`)

async function testEndpoint(endpoint, description) {
  try {
    console.log(`\n[v0] Testing ${description} (${endpoint})...`)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const url = createApiUrl(endpoint)
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })

    clearTimeout(timeoutId)

    console.log(`[v0] Status: ${response.status} ${response.statusText}`)
    console.log(`[v0] Content-Type: ${response.headers.get("content-type")}`)

    if (!response.ok) {
      const text = await response.text()
      console.error(`[v0] ❌ ${description} failed with status ${response.status}`)
      console.error(`[v0] Response body: ${text.substring(0, 200)}...`)
      return false
    }

    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text()
      console.error(`[v0] ❌ ${description} returned non-JSON content-type: ${contentType}`)
      console.error(`[v0] Response body: ${text.substring(0, 200)}...`)
      return false
    }

    const data = await response.json()
    console.log(`[v0] ✅ ${description} returned valid JSON:`, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    if (error.name === "AbortError") {
      console.error(`[v0] ❌ ${description} timed out after 10 seconds`)
    } else {
      console.error(`[v0] ❌ ${description} failed with error:`, error.message)
    }
    return false
  }
}

async function runTests() {
  console.log("[v0] Starting API endpoint tests...")

  const tests = [
    ["/api/puff-balance", "Puff Balance API"],
    ["/api/transactions", "Transactions API"],
    ["/api/puff-points", "Puff Points API"],
    ["/api/products", "Products API"],
    ["/api/orders", "Orders API"],
  ]

  let passed = 0
  const total = tests.length

  for (const [endpoint, description] of tests) {
    const success = await testEndpoint(endpoint, description)
    if (success) passed++
  }

  console.log(`\n[v0] Test Results: ${passed}/${total} endpoints passed`)

  if (passed === total) {
    console.log("[v0] 🎉 All API endpoints are working correctly!")
  } else {
    console.log("[v0] ⚠️  Some API endpoints need attention")
  }
}

// Run the tests
runTests().catch(console.error)

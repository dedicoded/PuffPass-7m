#!/usr/bin/env node

/**
 * Cybrid Configuration Validator
 *
 * Validates Cybrid API credentials and checks connectivity
 * Run: node --loader ts-node/esm scripts/validate-cybrid-config.ts
 */

interface CybridConfig {
  apiUrl: string
  orgGuid: string
  bankGuid: string
  clientId: string
  clientSecret: string
}

interface ValidationResult {
  step: string
  status: "success" | "error" | "warning"
  message: string
  details?: any
}

async function getAccessToken(config: CybridConfig): Promise<string> {
  const response = await fetch(`${config.apiUrl}/api/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: config.clientId,
      client_secret: config.clientSecret,
      scope: `organizations:${config.orgGuid} banks:${config.bankGuid}`,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Token request failed: ${response.status} - ${error}`)
  }

  const data = await response.json()
  return data.access_token
}

async function validateConfig(): Promise<ValidationResult[]> {
  const results: ValidationResult[] = []

  // Step 1: Check environment variables
  console.log("🔍 Step 1: Checking environment variables...\n")

  const requiredVars = [
    "CYBRID_API_URL",
    "CYBRID_ORG_GUID",
    "CYBRID_BANK_GUID",
    "CYBRID_CLIENT_ID",
    "CYBRID_CLIENT_SECRET",
  ]

  const missingVars = requiredVars.filter((v) => !process.env[v])

  if (missingVars.length > 0) {
    results.push({
      step: "Environment Variables",
      status: "error",
      message: `Missing required environment variables: ${missingVars.join(", ")}`,
    })
    return results
  }

  results.push({
    step: "Environment Variables",
    status: "success",
    message: "All required environment variables are set",
    details: {
      CYBRID_API_URL: process.env.CYBRID_API_URL,
      CYBRID_ORG_GUID: process.env.CYBRID_ORG_GUID,
      CYBRID_BANK_GUID: process.env.CYBRID_BANK_GUID,
      CYBRID_CLIENT_ID: process.env.CYBRID_CLIENT_ID?.substring(0, 10) + "...",
      CYBRID_CLIENT_SECRET: "***" + process.env.CYBRID_CLIENT_SECRET?.slice(-4),
    },
  })

  const config: CybridConfig = {
    apiUrl: process.env.CYBRID_API_URL!,
    orgGuid: process.env.CYBRID_ORG_GUID!,
    bankGuid: process.env.CYBRID_BANK_GUID!,
    clientId: process.env.CYBRID_CLIENT_ID!,
    clientSecret: process.env.CYBRID_CLIENT_SECRET!,
  }

  // Step 2: Test OAuth token generation
  console.log("\n🔐 Step 2: Testing OAuth token generation...\n")

  try {
    const token = await getAccessToken(config)
    results.push({
      step: "OAuth Authentication",
      status: "success",
      message: "Successfully obtained access token",
      details: {
        tokenPrefix: token.substring(0, 20) + "...",
        tokenLength: token.length,
      },
    })

    // Step 3: Verify bank access
    console.log("\n🏦 Step 3: Verifying bank access...\n")

    const bankResponse = await fetch(`${config.apiUrl}/api/banks/${config.bankGuid}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!bankResponse.ok) {
      throw new Error(`Bank verification failed: ${bankResponse.status}`)
    }

    const bankData = await bankResponse.json()
    results.push({
      step: "Bank Verification",
      status: "success",
      message: "Successfully verified bank access",
      details: {
        bankName: bankData.name,
        bankGuid: bankData.guid,
        type: bankData.type,
        supportedFiatAssets: bankData.supported_fiat_account_assets,
        supportedTradingPairs: bankData.supported_trading_symbols?.slice(0, 5),
      },
    })

    // Step 4: List bank accounts
    console.log("\n💰 Step 4: Checking bank accounts...\n")

    const accountsResponse = await fetch(`${config.apiUrl}/api/accounts?bank_guid=${config.bankGuid}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!accountsResponse.ok) {
      throw new Error(`Accounts list failed: ${accountsResponse.status}`)
    }

    const accountsData = await accountsResponse.json()

    const accounts = accountsData.objects || []
    const requiredAccountTypes = ["reserve", "gas", "fee"]
    const foundAccountTypes = accounts.map((acc: any) => acc.type.toLowerCase())
    const missingAccountTypes = requiredAccountTypes.filter((type) => !foundAccountTypes.includes(type))

    let accountStatus: "success" | "warning" | "error" = "success"
    let accountMessage = `Found ${accountsData.total} bank account(s)`

    if (missingAccountTypes.length > 0) {
      accountStatus = "error"
      accountMessage = `Missing required account types: ${missingAccountTypes.join(", ")}`
    } else if (accounts.length === 0) {
      accountStatus = "warning"
      accountMessage = "No bank accounts found"
    } else {
      // Check account balances
      const zeroBalanceAccounts = accounts.filter((acc: any) => acc.platform_balance === "0" || !acc.platform_balance)
      if (zeroBalanceAccounts.length > 0) {
        accountStatus = "warning"
        accountMessage = `Found all required accounts, but ${zeroBalanceAccounts.length} have zero balance`
      }
    }

    results.push({
      step: "Bank Accounts",
      status: accountStatus,
      message: accountMessage,
      details: {
        totalAccounts: accountsData.total,
        requiredTypes: requiredAccountTypes,
        foundTypes: foundAccountTypes,
        accounts: accounts.map((acc: any) => ({
          guid: acc.guid,
          name: acc.name,
          type: acc.type,
          asset: acc.asset,
          state: acc.state,
          balance: acc.platform_balance || "0",
          availableBalance: acc.platform_available || "0",
        })),
      },
    })

    // Step 5: Check supported assets
    console.log("\n🪙 Step 5: Checking supported assets...\n")

    const assetsResponse = await fetch(`${config.apiUrl}/api/assets`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!assetsResponse.ok) {
      throw new Error(`Assets list failed: ${assetsResponse.status}`)
    }

    const assetsData = await assetsResponse.json()
    const cryptoAssets = assetsData.objects?.filter((a: any) => a.type === "crypto")

    results.push({
      step: "Supported Assets",
      status: "success",
      message: `Found ${cryptoAssets?.length || 0} supported crypto assets`,
      details: {
        assets: cryptoAssets?.slice(0, 10).map((a: any) => ({
          code: a.code,
          name: a.name,
          type: a.type,
        })),
      },
    })
  } catch (error) {
    results.push({
      step: "API Connection",
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error occurred",
    })
  }

  return results
}

// Run validation
console.log("🚀 Cybrid Configuration Validator\n")
console.log("=".repeat(60))

validateConfig()
  .then((results) => {
    console.log("\n" + "=".repeat(60))
    console.log("\n📊 VALIDATION SUMMARY\n")

    results.forEach((result) => {
      const icon = result.status === "success" ? "✅" : result.status === "warning" ? "⚠️" : "❌"
      console.log(`${icon} ${result.step}: ${result.message}`)

      if (result.details) {
        console.log("   Details:", JSON.stringify(result.details, null, 2))
      }
      console.log()
    })

    const hasErrors = results.some((r) => r.status === "error")
    const hasWarnings = results.some((r) => r.status === "warning")

    if (hasErrors) {
      console.log("❌ Configuration validation FAILED")
      console.log("\nPlease check your environment variables and try again.")
      process.exit(1)
    } else if (hasWarnings) {
      console.log("⚠️  Configuration validation completed with warnings")
      console.log("\nYour credentials are valid, but some setup may be incomplete.")
      console.log("\n📝 NEXT STEPS:")
      console.log("   1. Fund your Gas account to pay for blockchain transaction fees")
      console.log("   2. Fund your Reserve account to hold customer deposits")
      console.log("   3. The Fee account will automatically collect platform fees")
      console.log("\n   See docs/CYBRID_PRODUCTION_SETUP.md for funding instructions")
      process.exit(0)
    } else {
      console.log("✅ Configuration validation PASSED")
      console.log("\nYour Cybrid integration is ready for transactions!")
      process.exit(0)
    }
  })
  .catch((error) => {
    console.error("\n❌ Validation failed with error:", error)
    process.exit(1)
  })

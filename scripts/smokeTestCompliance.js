import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL)

async function smokeTestCompliance() {
  console.log("🧪 Starting PuffPass Compliance Smoke Test...\n")

  const testOrg = "smoke-test-dispensary"
  const testIP = "192.0.2.1" // TEST-NET-1 (RFC 5737)
  const testSessionId = `smoke-${Date.now()}`

  try {
    // Step 1: Insert a fake verification event
    console.log("1️⃣  Inserting test verification event...")
    await sql`
      INSERT INTO age_verification_logs (
        session_id,
        ip_address,
        user_agent,
        verified,
        method,
        organization,
        created_at
      ) VALUES (
        ${testSessionId},
        ${testIP},
        'PuffPass-Smoke-Test/1.0',
        true,
        'id_scan',
        ${testOrg},
        NOW()
      )
    `
    console.log("   ✅ Test event inserted\n")

    // Step 2: Verify it landed in age_verification_logs
    console.log("2️⃣  Verifying event in age_verification_logs...")
    const logCheck = await sql`
      SELECT * FROM age_verification_logs 
      WHERE session_id = ${testSessionId}
    `

    if (logCheck.length === 0) {
      throw new Error("Test event not found in age_verification_logs")
    }
    console.log(`   ✅ Found event: ${logCheck[0].session_id}\n`)

    // Step 3: Check org_compliance_summary view
    console.log("3️⃣  Checking org_compliance_summary view...")
    const summaryCheck = await sql`
      SELECT * FROM org_compliance_summary 
      WHERE organization = ${testOrg}
      ORDER BY day DESC
      LIMIT 1
    `

    if (summaryCheck.length === 0) {
      throw new Error("Test organization not found in org_compliance_summary")
    }

    console.log(`   ✅ Found in compliance summary:`)
    console.log(`      Organization: ${summaryCheck[0].organization}`)
    console.log(`      Total attempts: ${summaryCheck[0].total_attempts}`)
    console.log(`      Pass rate: ${summaryCheck[0].pass_rate}%\n`)

    // Step 4: Insert failed attempts to test suspicious IPs view
    console.log("4️⃣  Testing suspicious IPs detection...")
    for (let i = 0; i < 6; i++) {
      await sql`
        INSERT INTO age_verification_logs (
          session_id,
          ip_address,
          user_agent,
          verified,
          method,
          organization,
          created_at
        ) VALUES (
          ${`smoke-fail-${Date.now()}-${i}`},
          ${testIP},
          'PuffPass-Smoke-Test/1.0',
          false,
          'id_scan',
          ${testOrg},
          NOW()
        )
      `
    }

    const suspiciousCheck = await sql`
      SELECT * FROM org_suspicious_ips 
      WHERE organization = ${testOrg} 
      AND ip_address = ${testIP}
    `

    if (suspiciousCheck.length === 0) {
      throw new Error("Suspicious IP not detected in org_suspicious_ips view")
    }

    console.log(`   ✅ Suspicious IP detected:`)
    console.log(`      IP: ${suspiciousCheck[0].ip_address}`)
    console.log(`      Failures: ${suspiciousCheck[0].failures}\n`)

    // Step 5: Cleanup test data
    console.log("5️⃣  Cleaning up test data...")
    await sql`
      DELETE FROM age_verification_logs 
      WHERE organization = ${testOrg}
    `
    console.log("   ✅ Test data cleaned up\n")

    // Final summary
    console.log("═══════════════════════════════════════════════════════")
    console.log("✅ SMOKE TEST PASSED")
    console.log("═══════════════════════════════════════════════════════")
    console.log("Your PuffPass compliance system is fully operational:")
    console.log("  • age_verification_logs table: ✅")
    console.log("  • org_compliance_summary view: ✅")
    console.log("  • org_suspicious_ips view: ✅")
    console.log("  • End-to-end data flow: ✅")
    console.log("═══════════════════════════════════════════════════════\n")
  } catch (error) {
    console.error("\n❌ SMOKE TEST FAILED")
    console.error("═══════════════════════════════════════════════════════")
    console.error("Error:", error.message)
    console.error("\nTroubleshooting:")
    console.error("  1. Run: pnpm setup:compliance")
    console.error("  2. Check DATABASE_URL is set correctly")
    console.error("  3. Verify migrations ran successfully")
    console.error("═══════════════════════════════════════════════════════\n")
    process.exit(1)
  }
}

smokeTestCompliance()

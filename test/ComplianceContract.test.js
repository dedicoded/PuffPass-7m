const { expect } = require("chai")
const { ethers } = require("hardhat")
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers")

describe("ComplianceContract", () => {
  async function deployComplianceFixture() {
    const [owner, officer, verifier, merchant, user1, user2] = await ethers.getSigners()

    const Compliance = await ethers.getContractFactory("ComplianceContract")
    const compliance = await Compliance.deploy()

    // Grant roles
    const COMPLIANCE_OFFICER_ROLE = await compliance.COMPLIANCE_OFFICER_ROLE()
    const VERIFIER_ROLE = await compliance.VERIFIER_ROLE()

    await compliance.grantRole(COMPLIANCE_OFFICER_ROLE, officer.address)
    await compliance.grantRole(VERIFIER_ROLE, verifier.address)

    return { compliance, owner, officer, verifier, merchant, user1, user2, COMPLIANCE_OFFICER_ROLE, VERIFIER_ROLE }
  }

  describe("Deployment", () => {
    it("Should grant admin role to deployer", async () => {
      const { compliance, owner } = await loadFixture(deployComplianceFixture)

      const DEFAULT_ADMIN_ROLE = await compliance.DEFAULT_ADMIN_ROLE()
      expect(await compliance.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true
    })

    it("Should set correct limits", async () => {
      const { compliance } = await loadFixture(deployComplianceFixture)

      expect(await compliance.MAX_DAILY_LIMIT()).to.equal(5000n * 10n ** 6n)
      expect(await compliance.MAX_MONTHLY_LIMIT()).to.equal(50000n * 10n ** 6n)
    })
  })

  describe("Age Verification", () => {
    it("Should allow verifier to verify age", async () => {
      const { compliance, verifier, user1 } = await loadFixture(deployComplianceFixture)

      await compliance.connect(verifier).verifyAge(user1.address, "ID")

      const verification = await compliance.ageVerifications(user1.address)
      expect(verification.verified).to.be.true
      expect(verification.verificationMethod).to.equal("ID")
    })

    it("Should emit AgeVerified event", async () => {
      const { compliance, verifier, user1 } = await loadFixture(deployComplianceFixture)

      await expect(compliance.connect(verifier).verifyAge(user1.address, "Biometric"))
        .to.emit(compliance, "AgeVerified")
        .withArgs(user1.address, "Biometric", (await time.latest()) + 365 * 24 * 60 * 60)
    })

    it("Should not allow non-verifier to verify age", async () => {
      const { compliance, user1, user2 } = await loadFixture(deployComplianceFixture)

      await expect(compliance.connect(user1).verifyAge(user2.address, "ID")).to.be.reverted
    })

    it("Should set expiration date correctly", async () => {
      const { compliance, verifier, user1 } = await loadFixture(deployComplianceFixture)

      const tx = await compliance.connect(verifier).verifyAge(user1.address, "ID")
      const receipt = await tx.wait()
      const blockTime = (await ethers.provider.getBlock(receipt.blockNumber)).timestamp

      const verification = await compliance.ageVerifications(user1.address)
      const expectedExpiry = blockTime + 365 * 24 * 60 * 60

      expect(verification.expiresAt).to.equal(expectedExpiry)
    })
  })

  describe("Merchant Licensing", () => {
    it("Should allow officer to issue merchant license", async () => {
      const { compliance, officer, merchant } = await loadFixture(deployComplianceFixture)

      const validityPeriod = 365 * 24 * 60 * 60 // 1 year
      const dailyLimit = ethers.parseUnits("1000", 6) // $1,000
      const monthlyLimit = ethers.parseUnits("10000", 6) // $10,000

      await compliance
        .connect(officer)
        .issueMerchantLicense(merchant.address, "LIC-12345", "DC", validityPeriod, dailyLimit, monthlyLimit)

      const license = await compliance.merchantLicenses(merchant.address)
      expect(license.active).to.be.true
      expect(license.licenseNumber).to.equal("LIC-12345")
      expect(license.jurisdiction).to.equal("DC")
    })

    it("Should emit MerchantLicenseIssued event", async () => {
      const { compliance, officer, merchant } = await loadFixture(deployComplianceFixture)

      const validityPeriod = 365 * 24 * 60 * 60
      const dailyLimit = ethers.parseUnits("1000", 6)
      const monthlyLimit = ethers.parseUnits("10000", 6)

      await expect(
        compliance
          .connect(officer)
          .issueMerchantLicense(merchant.address, "LIC-12345", "DC", validityPeriod, dailyLimit, monthlyLimit),
      )
        .to.emit(compliance, "MerchantLicenseIssued")
        .withArgs(merchant.address, "LIC-12345", "DC")
    })

    it("Should not allow issuing license with excessive limits", async () => {
      const { compliance, officer, merchant } = await loadFixture(deployComplianceFixture)

      const validityPeriod = 365 * 24 * 60 * 60
      const excessiveDaily = ethers.parseUnits("10000", 6) // Over $5,000 max
      const monthlyLimit = ethers.parseUnits("10000", 6)

      await expect(
        compliance
          .connect(officer)
          .issueMerchantLicense(merchant.address, "LIC-12345", "DC", validityPeriod, excessiveDaily, monthlyLimit),
      ).to.be.revertedWith("Daily limit exceeds maximum")
    })

    it("Should allow officer to revoke license", async () => {
      const { compliance, officer, merchant } = await loadFixture(deployComplianceFixture)

      // Issue license first
      const validityPeriod = 365 * 24 * 60 * 60
      const dailyLimit = ethers.parseUnits("1000", 6)
      const monthlyLimit = ethers.parseUnits("10000", 6)

      await compliance
        .connect(officer)
        .issueMerchantLicense(merchant.address, "LIC-12345", "DC", validityPeriod, dailyLimit, monthlyLimit)

      // Revoke license
      await compliance.connect(officer).revokeMerchantLicense(merchant.address, "Violation")

      const license = await compliance.merchantLicenses(merchant.address)
      expect(license.active).to.be.false
    })
  })

  describe("KYC", () => {
    it("Should allow verifier to complete KYC", async () => {
      const { compliance, verifier, user1 } = await loadFixture(deployComplianceFixture)

      await compliance.connect(verifier).completeKYC(user1.address, 2) // Enhanced KYC

      const userComp = await compliance.userCompliance(user1.address)
      expect(userComp.kycCompleted).to.be.true
      expect(userComp.kycLevel).to.equal(2)
    })

    it("Should emit KYCCompleted event", async () => {
      const { compliance, verifier, user1 } = await loadFixture(deployComplianceFixture)

      await expect(compliance.connect(verifier).completeKYC(user1.address, 3))
        .to.emit(compliance, "KYCCompleted")
        .withArgs(user1.address, 3)
    })

    it("Should not allow invalid KYC level", async () => {
      const { compliance, verifier, user1 } = await loadFixture(deployComplianceFixture)

      await expect(compliance.connect(verifier).completeKYC(user1.address, 0)).to.be.revertedWith("Invalid KYC level")

      await expect(compliance.connect(verifier).completeKYC(user1.address, 4)).to.be.revertedWith("Invalid KYC level")
    })
  })

  describe("Transaction Compliance", () => {
    it("Should pass compliance check for verified user", async () => {
      const { compliance, verifier, user1 } = await loadFixture(deployComplianceFixture)

      // Setup user
      await compliance.connect(verifier).verifyAge(user1.address, "ID")
      await compliance.connect(verifier).completeKYC(user1.address, 1)

      const amount = ethers.parseUnits("100", 6) // $100
      const [compliant, reason] = await compliance.checkTransactionCompliance(user1.address, amount)

      expect(compliant).to.be.true
      expect(reason).to.equal("")
    })

    it("Should fail if age not verified", async () => {
      const { compliance, verifier, user1 } = await loadFixture(deployComplianceFixture)

      await compliance.connect(verifier).completeKYC(user1.address, 1)

      const amount = ethers.parseUnits("100", 6)
      const [compliant, reason] = await compliance.checkTransactionCompliance(user1.address, amount)

      expect(compliant).to.be.false
      expect(reason).to.equal("Age not verified")
    })

    it("Should fail if KYC not completed", async () => {
      const { compliance, verifier, user1 } = await loadFixture(deployComplianceFixture)

      await compliance.connect(verifier).verifyAge(user1.address, "ID")

      const amount = ethers.parseUnits("100", 6)
      const [compliant, reason] = await compliance.checkTransactionCompliance(user1.address, amount)

      expect(compliant).to.be.false
      expect(reason).to.equal("KYC not completed")
    })

    it("Should fail if daily limit exceeded", async () => {
      const { compliance, verifier, user1 } = await loadFixture(deployComplianceFixture)

      await compliance.connect(verifier).verifyAge(user1.address, "ID")
      await compliance.connect(verifier).completeKYC(user1.address, 1)

      const excessiveAmount = ethers.parseUnits("6000", 6) // Over $5,000 daily limit
      const [compliant, reason] = await compliance.checkTransactionCompliance(user1.address, excessiveAmount)

      expect(compliant).to.be.false
      expect(reason).to.equal("Daily limit exceeded")
    })
  })

  describe("Merchant Compliance", () => {
    it("Should pass for active licensed merchant", async () => {
      const { compliance, officer, merchant } = await loadFixture(deployComplianceFixture)

      const validityPeriod = 365 * 24 * 60 * 60
      const dailyLimit = ethers.parseUnits("1000", 6)
      const monthlyLimit = ethers.parseUnits("10000", 6)

      await compliance
        .connect(officer)
        .issueMerchantLicense(merchant.address, "LIC-12345", "DC", validityPeriod, dailyLimit, monthlyLimit)

      const [compliant, reason] = await compliance.checkMerchantCompliance(merchant.address)

      expect(compliant).to.be.true
      expect(reason).to.equal("")
    })

    it("Should fail for unlicensed merchant", async () => {
      const { compliance, merchant } = await loadFixture(deployComplianceFixture)

      const [compliant, reason] = await compliance.checkMerchantCompliance(merchant.address)

      expect(compliant).to.be.false
      expect(reason).to.equal("License not active")
    })
  })
})

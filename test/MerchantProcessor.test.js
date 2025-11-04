const { expect } = require("chai")
const { ethers } = require("hardhat")
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers")

describe("MerchantProcessor", () => {
  async function deployMerchantProcessorFixture() {
    const [owner, merchant, customer, feeCollector] = await ethers.getSigners()

    // Deploy mock USDC
    const MockUSDC = await ethers.getContractFactory("MockERC20")
    const usdc = await MockUSDC.deploy("USD Coin", "USDC", 6)

    // Deploy MerchantProcessor
    const MerchantProcessor = await ethers.getContractFactory("MerchantProcessor")
    const processor = await MerchantProcessor.deploy(await usdc.getAddress(), feeCollector.address)

    // Mint USDC to customer
    await usdc.mint(customer.address, ethers.parseUnits("10000", 6))

    return { processor, usdc, owner, merchant, customer, feeCollector }
  }

  describe("Deployment", () => {
    it("Should set correct USDC address", async () => {
      const { processor, usdc } = await loadFixture(deployMerchantProcessorFixture)

      expect(await processor.usdcToken()).to.equal(await usdc.getAddress())
    })

    it("Should set correct fee collector", async () => {
      const { processor, feeCollector } = await loadFixture(deployMerchantProcessorFixture)

      expect(await processor.feeCollector()).to.equal(feeCollector.address)
    })

    it("Should set default platform fee to 2.5%", async () => {
      const { processor } = await loadFixture(deployMerchantProcessorFixture)

      expect(await processor.platformFeePercent()).to.equal(250) // 2.5% = 250 basis points
    })
  })

  describe("Payment Processing", () => {
    it("Should process payment correctly", async () => {
      const { processor, usdc, merchant, customer } = await loadFixture(deployMerchantProcessorFixture)

      const amount = ethers.parseUnits("100", 6) // $100

      // Approve processor to spend USDC
      await usdc.connect(customer).approve(await processor.getAddress(), amount)

      // Process payment
      await processor.connect(customer).processPayment(merchant.address, amount, "ORDER-123")

      // Check balances
      const merchantBalance = await processor.merchantBalances(merchant.address)
      const expectedFee = (amount * 250n) / 10000n // 2.5% fee
      const expectedMerchantAmount = amount - expectedFee

      expect(merchantBalance).to.equal(expectedMerchantAmount)
    })

    it("Should emit PaymentProcessed event", async () => {
      const { processor, usdc, merchant, customer } = await loadFixture(deployMerchantProcessorFixture)

      const amount = ethers.parseUnits("100", 6)
      await usdc.connect(customer).approve(await processor.getAddress(), amount)

      const expectedFee = (amount * 250n) / 10000n
      const expectedMerchantAmount = amount - expectedFee

      await expect(processor.connect(customer).processPayment(merchant.address, amount, "ORDER-123"))
        .to.emit(processor, "PaymentProcessed")
        .withArgs(customer.address, merchant.address, amount, expectedFee, "ORDER-123")
    })

    it("Should collect fees correctly", async () => {
      const { processor, usdc, merchant, customer, feeCollector } = await loadFixture(deployMerchantProcessorFixture)

      const amount = ethers.parseUnits("100", 6)
      await usdc.connect(customer).approve(await processor.getAddress(), amount)

      await processor.connect(customer).processPayment(merchant.address, amount, "ORDER-123")

      const expectedFee = (amount * 250n) / 10000n
      expect(await processor.collectedFees()).to.equal(expectedFee)
    })
  })

  describe("Merchant Withdrawals", () => {
    it("Should allow merchant to withdraw balance", async () => {
      const { processor, usdc, merchant, customer } = await loadFixture(deployMerchantProcessorFixture)

      // Process payment first
      const amount = ethers.parseUnits("100", 6)
      await usdc.connect(customer).approve(await processor.getAddress(), amount)
      await processor.connect(customer).processPayment(merchant.address, amount, "ORDER-123")

      const merchantBalance = await processor.merchantBalances(merchant.address)
      const initialUSDCBalance = await usdc.balanceOf(merchant.address)

      // Withdraw
      await processor.connect(merchant).withdrawMerchantBalance()

      expect(await processor.merchantBalances(merchant.address)).to.equal(0)
      expect(await usdc.balanceOf(merchant.address)).to.equal(initialUSDCBalance + merchantBalance)
    })

    it("Should emit MerchantWithdrawal event", async () => {
      const { processor, usdc, merchant, customer } = await loadFixture(deployMerchantProcessorFixture)

      const amount = ethers.parseUnits("100", 6)
      await usdc.connect(customer).approve(await processor.getAddress(), amount)
      await processor.connect(customer).processPayment(merchant.address, amount, "ORDER-123")

      const merchantBalance = await processor.merchantBalances(merchant.address)

      await expect(processor.connect(merchant).withdrawMerchantBalance())
        .to.emit(processor, "MerchantWithdrawal")
        .withArgs(merchant.address, merchantBalance)
    })

    it("Should not allow withdrawal with zero balance", async () => {
      const { processor, merchant } = await loadFixture(deployMerchantProcessorFixture)

      await expect(processor.connect(merchant).withdrawMerchantBalance()).to.be.revertedWith("No balance to withdraw")
    })
  })

  describe("Fee Management", () => {
    it("Should allow admin to update platform fee", async () => {
      const { processor, owner } = await loadFixture(deployMerchantProcessorFixture)

      await processor.connect(owner).updatePlatformFee(300) // 3%

      expect(await processor.platformFeePercent()).to.equal(300)
    })

    it("Should not allow fee over 10%", async () => {
      const { processor, owner } = await loadFixture(deployMerchantProcessorFixture)

      await expect(
        processor
          .connect(owner)
          .updatePlatformFee(1001), // 10.01%
      ).to.be.revertedWith("Fee too high")
    })

    it("Should allow admin to withdraw collected fees", async () => {
      const { processor, usdc, owner, merchant, customer, feeCollector } =
        await loadFixture(deployMerchantProcessorFixture)

      // Process payment to collect fees
      const amount = ethers.parseUnits("100", 6)
      await usdc.connect(customer).approve(await processor.getAddress(), amount)
      await processor.connect(customer).processPayment(merchant.address, amount, "ORDER-123")

      const collectedFees = await processor.collectedFees()
      const initialBalance = await usdc.balanceOf(feeCollector.address)

      await processor.connect(owner).withdrawFees()

      expect(await processor.collectedFees()).to.equal(0)
      expect(await usdc.balanceOf(feeCollector.address)).to.equal(initialBalance + collectedFees)
    })
  })
})

// Mock ERC20 for testing

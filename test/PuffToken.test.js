const { expect } = require("chai")
const { ethers } = require("hardhat")
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers")

describe("PuffToken", () => {
  // Fixture to deploy contract
  async function deployPuffTokenFixture() {
    const [owner, minter, user1, user2] = await ethers.getSigners()

    const PuffToken = await ethers.getContractFactory("PuffToken")
    const puffToken = await PuffToken.deploy()

    // Grant minter role
    const MINTER_ROLE = await puffToken.MINTER_ROLE()
    await puffToken.grantRole(MINTER_ROLE, minter.address)

    return { puffToken, owner, minter, user1, user2, MINTER_ROLE }
  }

  describe("Deployment", () => {
    it("Should set the correct name and symbol", async () => {
      const { puffToken } = await loadFixture(deployPuffTokenFixture)

      expect(await puffToken.name()).to.equal("PuffPass Rewards")
      expect(await puffToken.symbol()).to.equal("PUFF")
    })

    it("Should set the correct decimals", async () => {
      const { puffToken } = await loadFixture(deployPuffTokenFixture)

      expect(await puffToken.decimals()).to.equal(18)
    })

    it("Should have zero initial supply", async () => {
      const { puffToken } = await loadFixture(deployPuffTokenFixture)

      expect(await puffToken.totalSupply()).to.equal(0)
    })

    it("Should set the correct max supply", async () => {
      const { puffToken } = await loadFixture(deployPuffTokenFixture)

      const maxSupply = ethers.parseEther("100000000") // 100 million
      expect(await puffToken.MAX_SUPPLY()).to.equal(maxSupply)
    })

    it("Should grant admin role to deployer", async () => {
      const { puffToken, owner } = await loadFixture(deployPuffTokenFixture)

      const DEFAULT_ADMIN_ROLE = await puffToken.DEFAULT_ADMIN_ROLE()
      expect(await puffToken.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true
    })
  })

  describe("Minting", () => {
    it("Should allow minter to mint tokens", async () => {
      const { puffToken, minter, user1 } = await loadFixture(deployPuffTokenFixture)

      const amount = ethers.parseEther("1000")
      await puffToken.connect(minter).mint(user1.address, amount, "Purchase reward")

      expect(await puffToken.balanceOf(user1.address)).to.equal(amount)
      expect(await puffToken.totalMinted()).to.equal(amount)
    })

    it("Should emit TokensMinted event", async () => {
      const { puffToken, minter, user1 } = await loadFixture(deployPuffTokenFixture)

      const amount = ethers.parseEther("1000")
      await expect(puffToken.connect(minter).mint(user1.address, amount, "Purchase reward"))
        .to.emit(puffToken, "TokensMinted")
        .withArgs(user1.address, amount, "Purchase reward")
    })

    it("Should not allow non-minter to mint", async () => {
      const { puffToken, user1, user2 } = await loadFixture(deployPuffTokenFixture)

      const amount = ethers.parseEther("1000")
      await expect(puffToken.connect(user1).mint(user2.address, amount, "Unauthorized")).to.be.reverted
    })

    it("Should not allow minting to zero address", async () => {
      const { puffToken, minter } = await loadFixture(deployPuffTokenFixture)

      const amount = ethers.parseEther("1000")
      await expect(puffToken.connect(minter).mint(ethers.ZeroAddress, amount, "Invalid")).to.be.revertedWith(
        "Cannot mint to zero address",
      )
    })

    it("Should not allow minting zero amount", async () => {
      const { puffToken, minter, user1 } = await loadFixture(deployPuffTokenFixture)

      await expect(puffToken.connect(minter).mint(user1.address, 0, "Zero amount")).to.be.revertedWith(
        "Amount must be greater than 0",
      )
    })

    it("Should not allow minting beyond max supply", async () => {
      const { puffToken, minter, user1 } = await loadFixture(deployPuffTokenFixture)

      const maxSupply = await puffToken.MAX_SUPPLY()
      const overMax = maxSupply + ethers.parseEther("1")

      await expect(puffToken.connect(minter).mint(user1.address, overMax, "Over max")).to.be.revertedWith(
        "Exceeds maximum supply",
      )
    })

    it("Should track total minted correctly", async () => {
      const { puffToken, minter, user1, user2 } = await loadFixture(deployPuffTokenFixture)

      const amount1 = ethers.parseEther("1000")
      const amount2 = ethers.parseEther("2000")

      await puffToken.connect(minter).mint(user1.address, amount1, "Mint 1")
      await puffToken.connect(minter).mint(user2.address, amount2, "Mint 2")

      expect(await puffToken.totalMinted()).to.equal(amount1 + amount2)
    })
  })

  describe("Burning", () => {
    it("Should allow users to burn their tokens", async () => {
      const { puffToken, minter, user1 } = await loadFixture(deployPuffTokenFixture)

      const mintAmount = ethers.parseEther("1000")
      const burnAmount = ethers.parseEther("500")

      await puffToken.connect(minter).mint(user1.address, mintAmount, "Mint")
      await puffToken.connect(user1).burnWithReason(burnAmount, "Redemption")

      expect(await puffToken.balanceOf(user1.address)).to.equal(mintAmount - burnAmount)
      expect(await puffToken.totalBurned()).to.equal(burnAmount)
    })

    it("Should emit TokensBurned event", async () => {
      const { puffToken, minter, user1 } = await loadFixture(deployPuffTokenFixture)

      const mintAmount = ethers.parseEther("1000")
      const burnAmount = ethers.parseEther("500")

      await puffToken.connect(minter).mint(user1.address, mintAmount, "Mint")

      await expect(puffToken.connect(user1).burnWithReason(burnAmount, "Redemption"))
        .to.emit(puffToken, "TokensBurned")
        .withArgs(user1.address, burnAmount, "Redemption")
    })

    it("Should not allow burning more than balance", async () => {
      const { puffToken, minter, user1 } = await loadFixture(deployPuffTokenFixture)

      const mintAmount = ethers.parseEther("1000")
      const burnAmount = ethers.parseEther("2000")

      await puffToken.connect(minter).mint(user1.address, mintAmount, "Mint")

      await expect(puffToken.connect(user1).burnWithReason(burnAmount, "Over balance")).to.be.reverted
    })

    it("Should not allow burning zero amount", async () => {
      const { puffToken, user1 } = await loadFixture(deployPuffTokenFixture)

      await expect(puffToken.connect(user1).burnWithReason(0, "Zero")).to.be.revertedWith(
        "Amount must be greater than 0",
      )
    })
  })

  describe("Supply Tracking", () => {
    it("Should return correct circulating supply", async () => {
      const { puffToken, minter, user1 } = await loadFixture(deployPuffTokenFixture)

      const mintAmount = ethers.parseEther("1000")
      const burnAmount = ethers.parseEther("300")

      await puffToken.connect(minter).mint(user1.address, mintAmount, "Mint")
      await puffToken.connect(user1).burnWithReason(burnAmount, "Burn")

      expect(await puffToken.circulatingSupply()).to.equal(mintAmount - burnAmount)
    })

    it("Should return correct remaining supply", async () => {
      const { puffToken, minter, user1 } = await loadFixture(deployPuffTokenFixture)

      const mintAmount = ethers.parseEther("1000000")
      await puffToken.connect(minter).mint(user1.address, mintAmount, "Mint")

      const maxSupply = await puffToken.MAX_SUPPLY()
      expect(await puffToken.remainingSupply()).to.equal(maxSupply - mintAmount)
    })
  })

  describe("Pausable", () => {
    it("Should allow pauser to pause transfers", async () => {
      const { puffToken, owner } = await loadFixture(deployPuffTokenFixture)

      await puffToken.connect(owner).pause()
      expect(await puffToken.paused()).to.be.true
    })

    it("Should not allow transfers when paused", async () => {
      const { puffToken, minter, owner, user1, user2 } = await loadFixture(deployPuffTokenFixture)

      const amount = ethers.parseEther("1000")
      await puffToken.connect(minter).mint(user1.address, amount, "Mint")

      await puffToken.connect(owner).pause()

      await expect(puffToken.connect(user1).transfer(user2.address, amount)).to.be.reverted
    })

    it("Should not allow minting when paused", async () => {
      const { puffToken, minter, owner, user1 } = await loadFixture(deployPuffTokenFixture)

      await puffToken.connect(owner).pause()

      const amount = ethers.parseEther("1000")
      await expect(puffToken.connect(minter).mint(user1.address, amount, "Paused mint")).to.be.reverted
    })

    it("Should allow unpausing", async () => {
      const { puffToken, owner } = await loadFixture(deployPuffTokenFixture)

      await puffToken.connect(owner).pause()
      await puffToken.connect(owner).unpause()

      expect(await puffToken.paused()).to.be.false
    })
  })

  describe("Transfers", () => {
    it("Should allow token transfers", async () => {
      const { puffToken, minter, user1, user2 } = await loadFixture(deployPuffTokenFixture)

      const amount = ethers.parseEther("1000")
      const transferAmount = ethers.parseEther("300")

      await puffToken.connect(minter).mint(user1.address, amount, "Mint")
      await puffToken.connect(user1).transfer(user2.address, transferAmount)

      expect(await puffToken.balanceOf(user1.address)).to.equal(amount - transferAmount)
      expect(await puffToken.balanceOf(user2.address)).to.equal(transferAmount)
    })
  })
})

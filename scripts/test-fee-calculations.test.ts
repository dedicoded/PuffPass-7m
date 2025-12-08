/**
 * Unit tests for fee calculations
 */

import { calculateIncomingFee, calculateInstantWithdrawal, calculateDelayedWithdrawal } from "./test-fee-calculations"

describe("PuffPass Fee Calculations", () => {
  describe("calculateIncomingFee", () => {
    it("should calculate 3% fee on $100 payment", () => {
      const result = calculateIncomingFee(100)
      expect(result.grossAmount).toBe(100)
      expect(result.incomingFee).toBe(3)
      expect(result.netToVault).toBe(97)
    })

    it("should handle decimal amounts correctly", () => {
      const result = calculateIncomingFee(25.5)
      expect(result.grossAmount).toBe(25.5)
      expect(result.incomingFee).toBeCloseTo(0.765, 2)
      expect(result.netToVault).toBeCloseTo(24.735, 2)
    })
  })

  describe("calculateInstantWithdrawal", () => {
    it("should calculate 7% fee on instant withdrawal", () => {
      const result = calculateInstantWithdrawal(97)
      expect(result.vaultBalance).toBe(97)
      expect(result.withdrawalFee).toBeCloseTo(6.79, 2)
      expect(result.netToMerchant).toBeCloseTo(90.21, 2)
    })

    it("should result in ~9.79% total revenue for PuffPass", () => {
      const incoming = calculateIncomingFee(100)
      const withdrawal = calculateInstantWithdrawal(incoming.netToVault)
      const totalRevenue = incoming.incomingFee + withdrawal.withdrawalFee
      expect(totalRevenue).toBeCloseTo(9.79, 2)
    })
  })

  describe("calculateDelayedWithdrawal", () => {
    it("should calculate 5% fee on delayed withdrawal", () => {
      const result = calculateDelayedWithdrawal(97)
      expect(result.vaultBalance).toBe(97)
      expect(result.withdrawalFee).toBeCloseTo(4.85, 2)
      expect(result.netToMerchant).toBeCloseTo(92.15, 2)
    })

    it("should result in ~7.85% total revenue for PuffPass", () => {
      const incoming = calculateIncomingFee(100)
      const withdrawal = calculateDelayedWithdrawal(incoming.netToVault)
      const totalRevenue = incoming.incomingFee + withdrawal.withdrawalFee
      expect(totalRevenue).toBeCloseTo(7.85, 2)
    })
  })

  describe("Edge cases", () => {
    it("should handle small amounts", () => {
      const incoming = calculateIncomingFee(1)
      expect(incoming.incomingFee).toBeCloseTo(0.03, 2)
      expect(incoming.netToVault).toBeCloseTo(0.97, 2)
    })

    it("should handle large amounts", () => {
      const incoming = calculateIncomingFee(10000)
      expect(incoming.incomingFee).toBe(300)
      expect(incoming.netToVault).toBe(9700)
    })
  })
})

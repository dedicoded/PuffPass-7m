export interface CannabisContract {
  address: string
  abi: any[]
}

export interface ContractMethods {
  verifyProduct(productId: string): Promise<boolean>
  trackSupplyChain(batchId: string): Promise<SupplyChainData>
  verifyAge(userAddress: string): Promise<boolean>
}

export interface SupplyChainData {
  batchId: string
  grower: string
  processor: string
  distributor: string
  retailer: string
  testResults: TestResult[]
  timestamps: number[]
}

export interface TestResult {
  testType: string
  result: string
  certifiedBy: string
  timestamp: number
}

export interface Web3Config {
  chainId: number
  rpcUrl: string
  contractAddress: string
  blockExplorer: string
}

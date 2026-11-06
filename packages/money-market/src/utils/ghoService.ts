import { GhoReserveData, GhoUserData } from "@aave/math-utils"
import { Contract, providers } from "ethers"

const UI_GHO_DATA_PROVIDER_ABI = [
  "function POOL() view returns (address)",
  "function GHO() view returns (address)",
]
const POOL_ABI = [
  "function getReserveData(address) view returns (tuple(uint256 configuration, uint128 liquidityIndex, uint128 currentLiquidityRate, uint128 variableBorrowIndex, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, uint16 id, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint128 accruedToTreasury, uint128 unbacked, uint128 isolationModeTotalDebt))",
]
const GHO_TOKEN_ABI = [
  "function getFacilitatorBucket(address) view returns (uint256, uint256)",
]
const GHO_VARIABLE_DEBT_TOKEN_ABI = [
  "function getPreviousIndex(address) view returns (uint256)",
  "function scaledBalanceOf(address) view returns (uint256)",
]

/**
 * Drop-in for `GhoService` from `@aave/contract-helpers`. It reads the same data
 * straight from the pool, HOLLAR token and HOLLAR debt token instead of
 * `UiGhoDataProvider.getGhoReserveData()`, which reverts since block 16,683,446:
 * the new discount strategy doesn't have the getters that provider calls.
 *
 * Discount fields are hardcoded to 0. They were 0 before the switch, and since
 * then only Juicer strategy contracts have a discount, never a user wallet.
 */
export class GhoService {
  private readonly provider: providers.Provider
  private readonly uiGhoDataProviderAddress: string
  private addresses?: Promise<{
    gho: string
    aToken: string
    variableDebtToken: string
    pool: Contract
  }>

  constructor({
    provider,
    uiGhoDataProviderAddress,
  }: {
    provider: providers.Provider
    uiGhoDataProviderAddress: string
  }) {
    this.provider = provider
    this.uiGhoDataProviderAddress = uiGhoDataProviderAddress
  }

  // POOL() and GHO() on the provider still work; reading them keeps the same
  // pool and token the provider used, on every network.
  private getAddresses() {
    this.addresses ??= (async () => {
      const ui = new Contract(
        this.uiGhoDataProviderAddress,
        UI_GHO_DATA_PROVIDER_ABI,
        this.provider,
      )
      const [poolAddress, gho]: [string, string] = await Promise.all([
        ui.POOL(),
        ui.GHO(),
      ])
      const pool = new Contract(poolAddress, POOL_ABI, this.provider)
      const reserve = await pool.getReserveData(gho)
      return {
        gho,
        pool,
        aToken: reserve.aTokenAddress as string,
        variableDebtToken: reserve.variableDebtTokenAddress as string,
      }
    })().catch((error) => {
      this.addresses = undefined
      throw error
    })
    return this.addresses
  }

  async getGhoReserveData(): Promise<GhoReserveData> {
    const { gho, pool, aToken } = await this.getAddresses()
    const ghoToken = new Contract(gho, GHO_TOKEN_ABI, this.provider)

    const [reserve, [capacity, level]] = await Promise.all([
      pool.getReserveData(gho),
      ghoToken.getFacilitatorBucket(aToken),
    ])

    return {
      ghoBaseVariableBorrowRate: reserve.currentVariableBorrowRate.toString(),
      ghoDiscountedPerToken: "0",
      ghoDiscountRate: "0",
      ghoMinDebtTokenBalanceForDiscount: "0",
      ghoMinDiscountTokenBalanceForDiscount: "0",
      ghoReserveLastUpdateTimestamp: reserve.lastUpdateTimestamp.toString(),
      ghoCurrentBorrowIndex: reserve.variableBorrowIndex.toString(),
      aaveFacilitatorBucketLevel: level.toString(),
      aaveFacilitatorBucketMaxCapacity: capacity.toString(),
    }
  }

  async getGhoUserData(userAddress: string): Promise<GhoUserData> {
    const { variableDebtToken } = await this.getAddresses()
    const debtToken = new Contract(
      variableDebtToken,
      GHO_VARIABLE_DEBT_TOKEN_ABI,
      this.provider,
    )

    const [previousIndex, scaledBalance] = await Promise.all([
      debtToken.getPreviousIndex(userAddress),
      debtToken.scaledBalanceOf(userAddress),
    ])

    return {
      userGhoDiscountPercent: "0",
      userDiscountTokenBalance: "0",
      userPreviousGhoBorrowIndex: previousIndex.toString(),
      userGhoScaledBorrowBalance: scaledBalance.toString(),
    }
  }
}

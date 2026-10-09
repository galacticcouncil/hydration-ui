import { getAddressFromAssetId } from "@galacticcouncil/utils"
import { queryOptions } from "@tanstack/react-query"
import { erc20Abi, formatUnits, getContract, type Hex } from "viem"

import {
  DEBT_TOKEN_ABI,
  FEE_CONTROLLER_ABI,
  POOL_ABI,
  SUBLOOP_ABI,
  VAULT_ABI,
  YIELD_ACCOUNTING_ABI,
} from "@/modules/strategies/propeller/config/abi"
import { type PropellerVaultConfig } from "@/modules/strategies/propeller/config/vaults"
import {
  HOLLAR_ADDRESS,
  POOL_ADDRESS,
  SUBLOOP_ADDRESS,
} from "@/modules/strategies/propeller/constants"
import { readDepositCapacity } from "@/modules/strategies/propeller/utils/deposit"
import { propellerQueryKeys } from "@/modules/strategies/propeller/utils/queryKeys"
import { TProviderContext } from "@/providers/rpcProvider"

// No on-chain APR view; these are first-paint placeholders until chain reads load.
const FALLBACK_APR = 0
const FALLBACK_MIN_REDEEM = 0

export const depositCapacityQuery = (
  { isReady, evm }: TProviderContext,
  vault: PropellerVaultConfig,
) =>
  queryOptions({
    queryKey: propellerQueryKeys.depositCapacity(vault.vaultAddress),
    enabled: isReady,
    queryFn: () =>
      readDepositCapacity(
        evm,
        vault.vaultAddress,
        getAddressFromAssetId(vault.assetId) as Hex,
      ),
    refetchInterval: 10_000,
  })

/** Runs a read and returns fallback when it reverts, so one failed read does not blank the page. */
const safeRead = async <T, F = null>(
  label: string,
  read: () => Promise<T>,
  fallback: F = null as F,
): Promise<T | F> => {
  try {
    return await read()
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn(`[propeller-vault] ${label} reverted`, err)
    }
    return fallback
  }
}

export const vaultStatsQuery = (
  { isReady, evm }: TProviderContext,
  vault: PropellerVaultConfig,
  // CollateralVault has no decimals() override; shares use the collateral scale.
  decimals: number,
) =>
  queryOptions({
    queryKey: propellerQueryKeys.vaultStats(vault.vaultAddress),
    enabled: isReady,
    queryFn: async () => {
      const at = { blockNumber: await evm.getBlockNumber() }
      const contract = getContract({
        address: vault.vaultAddress,
        abi: VAULT_ABI,
        client: evm,
      })
      const pool = getContract({
        address: POOL_ADDRESS,
        abi: POOL_ABI,
        client: evm,
      })
      const [
        totalAssets,
        totalSupply,
        exchangeRateWad,
        tvlCap,
        paused,
        depositsPaused,
        queueHead,
        queueTail,
        collateralConfig,
        feeController,
        debtToken,
        withdrawalDelay,
        deficitStop,
        deferredDeployment,
        pendingDeployment,
      ] = await Promise.all([
        contract.read.totalAssets(at),
        contract.read.totalSupply(at),
        contract.read.exchangeRate(at),
        contract.read.tvlCap(at),
        contract.read.paused(at),
        contract.read.depositsPaused(at),
        contract.read.queueHead(at),
        contract.read.queueTail(at),
        safeRead("Pool.getConfiguration(collateral)", () =>
          pool.read.getConfiguration(
            [getAddressFromAssetId(vault.assetId) as Hex],
            at,
          ),
        ),
        contract.read.feeController(at),
        contract.read.hollarDebtToken(at),
        contract.read.withdrawalDelay(at),
        // null on a vault without the keeper stop, which leaves deposits unavailable
        safeRead("Vault.deficitStop", () => contract.read.deficitStop(at)),
        safeRead("Vault.deferredDeployment", () =>
          contract.read.deferredDeployment(at),
        ),
        safeRead("Vault.reinvestAssets", () =>
          contract.read.reinvestAssets(at),
        ),
      ])
      const [protocolFeeBps, mainDiscountBps] = await Promise.all([
        safeRead("FeeController.protocolFeeBps", () =>
          evm.readContract({
            address: feeController,
            abi: FEE_CONTROLLER_ABI,
            functionName: "protocolFeeBps",
            args: [vault.vaultAddress],
            ...at,
          }),
        ),
        safeRead("DebtToken.getDiscountPercent", () =>
          evm.readContract({
            address: debtToken,
            abi: DEBT_TOKEN_ABI,
            functionName: "getDiscountPercent",
            args: [vault.vaultAddress],
            ...at,
          }),
        ),
      ])

      const queueLength = queueTail > queueHead ? queueTail - queueHead : 0n

      // maxLtv comes from the collateral's reserve config bitmap. Do not derive
      // LTV from getUserAccountData(vault): synthetic collateral inflates
      // totalCollateralBase.
      const ltvBps =
        collateralConfig === null ? 0 : Number(collateralConfig & 0xffffn)

      return {
        totalAssets: Number(formatUnits(totalAssets, decimals)),
        totalSupply: Number(formatUnits(totalSupply, decimals)),
        // exchangeRate is WAD-scaled (1e18), not collateral decimals.
        exchangeRate: Number(formatUnits(exchangeRateWad, 18)),
        queueLength: Number(queueLength),
        tvlCap: Number(formatUnits(tvlCap, decimals)),
        paused,
        depositsPaused,
        maxLtv: ltvBps > 0 ? ltvBps / 1e4 : null,
        withdrawalDelay,
        deficitStop,
        pendingDeployment:
          deferredDeployment === true && pendingDeployment !== null
            ? formatUnits(pendingDeployment, decimals)
            : null,
        protocolFeeBps: protocolFeeBps === null ? null : Number(protocolFeeBps),
        mainDiscountBps:
          mainDiscountBps === null ? null : Number(mainDiscountBps),
        minRedeem: FALLBACK_MIN_REDEEM,
        apr: FALLBACK_APR,
      }
    },
    refetchInterval: 30_000,
  })

/** SubLoop reads; each call fails independently so a partial deploy does not blank the page. */
export const subLoopQuery = ({ isReady, evm }: TProviderContext) =>
  queryOptions({
    queryKey: propellerQueryKeys.subLoop(),
    enabled: isReady,
    queryFn: async () => {
      const subLoop = getContract({
        address: SUBLOOP_ADDRESS,
        abi: SUBLOOP_ABI,
        client: evm,
      })
      const pool = getContract({
        address: POOL_ADDRESS,
        abi: POOL_ABI,
        client: evm,
      })
      const [healthFactor, negativeCarryBps, targetHf, account, hollarRes] =
        await Promise.all([
          safeRead("SubLoop.healthFactor", () => subLoop.read.healthFactor()),
          safeRead("SubLoop.negativeCarryBps", () =>
            subLoop.read.negativeCarryBps(),
          ),
          safeRead("SubLoop.targetHf", () => subLoop.read.targetHf()),
          safeRead("Pool.getUserAccountData(SubLoop)", () =>
            pool.read.getUserAccountData([SUBLOOP_ADDRESS]),
          ),
          safeRead("Pool.getReserveData(HOLLAR)", () =>
            pool.read.getReserveData([HOLLAR_ADDRESS]),
          ),
        ])

      // loopLeverage is SubLoop-wide.
      let loopLeverage: number | null = null
      let borrowRate: number | null = null
      if (account) {
        const loopColl = account[0]
        const loopDebt = account[1]
        const loopEquity = loopColl - loopDebt // totalCollateralBase − totalDebtBase
        if (loopEquity > 0n)
          loopLeverage = Number(loopColl) / Number(loopEquity)
      }
      if (hollarRes) {
        borrowRate = Number(hollarRes.currentVariableBorrowRate) / 1e27
      }

      return {
        leverage: loopLeverage,
        healthFactor:
          healthFactor === null ? null : Number(formatUnits(healthFactor, 18)),
        targetHf: targetHf === null ? null : Number(formatUnits(targetHf, 18)),
        borrowRate,
        negativeCarry:
          negativeCarryBps === null ? null : Number(negativeCarryBps) / 1e4,
      }
    },
    refetchInterval: 30_000,
  })

/**
 * SubLoop equity for this vault. equity gates withdraw; pendingUnwind signals
 * settlement that is awaiting source funds.
 */
export const vaultLoopPositionQuery = (
  { isReady, evm }: TProviderContext,
  vault: PropellerVaultConfig,
) =>
  queryOptions({
    queryKey: propellerQueryKeys.vaultLoopPosition(vault.vaultAddress),
    enabled: isReady,
    queryFn: async () => {
      const subLoop = getContract({
        address: SUBLOOP_ADDRESS,
        abi: SUBLOOP_ABI,
        client: evm,
      })
      const [equity, pendingUnwind] = await Promise.all([
        safeRead("SubLoop.equityOf", () =>
          subLoop.read.equityOf([vault.vaultAddress]),
        ),
        safeRead("SubLoop.pendingUnwindOf", () =>
          subLoop.read.pendingUnwindOf([vault.vaultAddress]),
        ),
      ])
      return { equity, pendingUnwind }
    },
    refetchInterval: 30_000,
  })

export const vaultBalancesQuery = (
  { isReady, evm }: TProviderContext,
  vault: PropellerVaultConfig,
  decimals: number,
  evmAddress: Hex | undefined,
) =>
  queryOptions({
    queryKey: propellerQueryKeys.vaultBalances(vault.vaultAddress, evmAddress),
    enabled: isReady && !!evmAddress,
    queryFn: async () => {
      if (!evmAddress)
        return {
          eth: 0,
          shares: 0,
          sharesExact: "0",
          assetValue: 0,
          rewards: null,
        }
      const options = { blockNumber: await evm.getBlockNumber() }

      const collateralToken = getContract({
        address: getAddressFromAssetId(vault.assetId) as Hex,
        abi: erc20Abi,
        client: evm,
      })
      const contract = getContract({
        address: vault.vaultAddress,
        abi: VAULT_ABI,
        client: evm,
      })

      const [collateralBal, shareBal] = await Promise.all([
        collateralToken.read.balanceOf([evmAddress], options),
        contract.read.balanceOf([evmAddress], options),
      ])

      const assetValue = await contract.read.convertToAssets(
        [shareBal],
        options,
      )
      const rewards = await safeRead("vault earned collateral", async () => {
        const accounting = await contract.read.yieldAccounting(options)
        const fund = getContract({
          address: accounting,
          abi: YIELD_ACCOUNTING_ABI,
          client: evm,
        })
        const [ownedAssets, claimableShares] = await Promise.all([
          fund.read.earnedAssets([evmAddress], options),
          fund.read.claimableShares([evmAddress], options),
        ])
        const claimableAssets = await contract.read.convertToAssets(
          [claimableShares],
          options,
        )
        return {
          estimatedAssets: Number(formatUnits(ownedAssets, decimals)),
          claimableAssets: Number(formatUnits(claimableAssets, decimals)),
          claimableShares,
        }
      })

      return {
        rewards,
        sharesExact: formatUnits(shareBal, decimals),
        assetValue: Number(formatUnits(assetValue, decimals)),
        eth: Number(formatUnits(collateralBal, decimals)),
        shares: Number(formatUnits(shareBal, decimals)),
      }
    },
    refetchInterval: 15_000,
  })

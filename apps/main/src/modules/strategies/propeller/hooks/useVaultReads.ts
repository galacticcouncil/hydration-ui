import { PRIME_ASSET_ID } from "@galacticcouncil/utils"
import { useQuery } from "@tanstack/react-query"
import { isNullish } from "remeda"
import { formatUnits, getContract, type Hex } from "viem"

import { useBorrowAssetsApy } from "@/api/borrow"
import {
  ERC20_ABI,
  HOLLAR_ADDRESS,
  POOL_ABI,
  POOL_ADDRESS,
  SUBLOOP_ABI,
  SUBLOOP_ADDRESS,
  VAULT_ABI,
} from "@/modules/strategies/propeller/constants"
import { usePropellerVaultContract } from "@/modules/strategies/propeller/hooks/usePropellerVaultContract"
import { useActivePropellerVault } from "@/modules/strategies/propeller/PropellerVaultContext"
import { type PropellerVaultConfig } from "@/modules/strategies/propeller/vaults"
import { useRpcProvider } from "@/providers/rpcProvider"

// Propeller doesn't expose an on-chain APR view (no getAPYWad), and there's
// no Decentral-style maturity schedule — the redeem queue settles as the
// keeper unwinds the loop. These are first-paint UI fallbacks; the live
// numbers users care about (exchangeRate, queued shares) come from chain.
const FALLBACK_APR = 0
const FALLBACK_MIN_DEPOSIT = 0
const FALLBACK_MIN_REDEEM = 0

export function useVaultStats() {
  const { data: vault } = usePropellerVaultContract()
  const { vaultAddress } = useActivePropellerVault()
  return useQuery({
    queryKey: ["propeller-vault-stats", vaultAddress],
    enabled: !!vault,
    queryFn: async () => {
      if (!vault) throw new Error("Vault contract not found")
      const [
        totalAssets,
        totalSupply,
        exchangeRateWad,
        tvlCap,
        paused,
        depositsPaused,
        queueHead,
        queueTail,
      ] = await Promise.all([
        vault.read.totalAssets(),
        vault.read.totalSupply(),
        vault.read.exchangeRate(),
        vault.read.tvlCap(),
        vault.read.paused(),
        vault.read.depositsPaused(),
        vault.read.queueHead(),
        vault.read.queueTail(),
      ])

      const queueLength = queueTail > queueHead ? queueTail - queueHead : 0n

      return {
        totalAssets: Number(formatUnits(totalAssets, 18)),
        totalSupply: Number(formatUnits(totalSupply, 18)),
        exchangeRate: Number(formatUnits(exchangeRateWad, 18)),
        queueLength: Number(queueLength),
        tvlCap: Number(formatUnits(tvlCap, 18)),
        paused,
        depositsPaused,
        minDeposit: FALLBACK_MIN_DEPOSIT,
        minRedeem: FALLBACK_MIN_REDEEM,
        apr: FALLBACK_APR,
      }
    },
    refetchInterval: 30_000,
  })
}

/**
 * SubLoop leverage/health read — drives the optional "Health factor" detail
 * line. Both values are WAD-scaled (1e18). Wrapped independently so a revert
 * on a partial deploy doesn't wipe the strategy page.
 */
export function useSubLoopStats(override?: PropellerVaultConfig) {
  const { evm } = useRpcProvider()
  const { vaultAddress } = useActivePropellerVault(override)
  return useQuery({
    queryKey: ["propeller-subloop-stats", vaultAddress],
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
      const safe = async <T>(
        label: string,
        read: () => Promise<T>,
      ): Promise<T | null> => {
        try {
          return await read()
        } catch (err) {
          if (import.meta.env.DEV) {
            console.warn(`[propeller-vault] ${label} reverted`, err)
          }
          return null
        }
      }
      const [
        healthFactor,
        totalEquity,
        targetHf,
        account,
        vaultAccount,
        hollarRes,
      ] = await Promise.all([
        safe("SubLoop.healthFactor", () => subLoop.read.healthFactor()),
        safe("SubLoop.totalEquity", () => subLoop.read.totalEquity()),
        safe("SubLoop.targetHf", () => subLoop.read.targetHf()),
        safe("Pool.getUserAccountData(SubLoop)", () =>
          pool.read.getUserAccountData([SUBLOOP_ADDRESS]),
        ),
        safe("Pool.getUserAccountData(Vault)", () =>
          pool.read.getUserAccountData([vaultAddress]),
        ),
        safe("Pool.getReserveData(HOLLAR)", () =>
          pool.read.getReserveData([HOLLAR_ADDRESS]),
        ),
      ])

      // loopLeverage = the SHARED SubLoop's collateral / equity — the same for
      // every vault, since one SubLoop backs them all. mainLtv = THIS vault's
      // own Main-leg LTV (its HOLLAR debt / its collateral). The two must be
      // kept separate: attributing the loop's HOLLAR debt per-vault by the
      // aggregate (the old borrowExposure) penalised the larger/higher-LTV vault
      // as pure cost while crediting only the shared loop benefit — so a bigger
      // tBTC position showed a LOWER APY than ETH, backwards. The real per-deposit
      // carry is mainLtv·loopLeverage·(primeYield − borrowRate): set by the
      // vault's own LTV, not its dollar size. borrowRate = HOLLAR variable borrow
      // rate (ray, 1e27) as a fraction.
      let loopLeverage: number | null = null
      let mainLtv: number | null = null
      let borrowRate: number | null = null
      if (account) {
        const loopColl = account[0]
        const loopDebt = account[1]
        const loopEquity = loopColl - loopDebt // totalCollateralBase − totalDebtBase
        if (loopEquity > 0n)
          loopLeverage = Number(loopColl) / Number(loopEquity)
      }
      if (vaultAccount) {
        const vaultColl = vaultAccount[0] // this vault's collateral (base ccy)
        const mainDebt = vaultAccount[1] // this vault's HOLLAR debt
        if (vaultColl > 0n) mainLtv = Number(mainDebt) / Number(vaultColl)
      }
      if (hollarRes) {
        borrowRate = Number(hollarRes.currentVariableBorrowRate) / 1e27
      }

      return {
        healthFactor:
          healthFactor === null ? null : Number(formatUnits(healthFactor, 18)),
        targetHf: targetHf === null ? null : Number(formatUnits(targetHf, 18)),
        totalEquity:
          totalEquity === null ? null : Number(formatUnits(totalEquity, 18)),
        leverage: loopLeverage,
        mainLtv,
        borrowRate,
      }
    },
    refetchInterval: 30_000,
  })
}

/**
 * Live net APY on the deposit = mainLtv·loopLeverage·(primeYield − borrowRate).
 *
 * Derivation: a deposit of collateral C borrows mainLtv·C of HOLLAR (the Main
 * leg), which seeds the shared SubLoop and is levered loopLeverage×. Per unit of
 * C the loop holds mainLtv·loopLeverage of PRIME (earning primeYield) and owes
 * the same notional of HOLLAR (costing borrowRate), so the net carry on the
 * DEPOSIT is mainLtv·loopLeverage·(primeYield − borrowRate). This is the honest
 * yield-on-collateral; it rises with the vault's own LTV (so tBTC at 80% > ETH at
 * 75%) and is independent of position size. PRIME yield = the money market's
 * total PRIME supply APY (Aave base + Kamino + farms). Returns null — never 0 or
 * negative — when an input is missing or the carry isn't positive.
 */
export function usePropellerApy(
  override?: PropellerVaultConfig,
): number | null {
  const { data: subLoop } = useSubLoopStats(override)
  const { data: apyData } = useBorrowAssetsApy([PRIME_ASSET_ID])
  const primeSupplyApy = apyData?.find(
    (a) => a.assetId === PRIME_ASSET_ID,
  )?.totalSupplyApy

  const loopLeverage = subLoop?.leverage ?? null
  const mainLtv = subLoop?.mainLtv ?? null
  const borrowRate = subLoop?.borrowRate ?? null
  if (
    isNullish(loopLeverage) ||
    isNullish(mainLtv) ||
    isNullish(borrowRate) ||
    isNullish(primeSupplyApy)
  ) {
    return null
  }
  const primeYield = primeSupplyApy / 100 // percent → fraction
  const apr = mainLtv * loopLeverage * (primeYield - borrowRate)
  // return a PERCENT number (e.g. 9.4), the form `common:percent` expects
  // (it divides by 100 internally). null — never 0/negative — so the UI hides it.
  return apr > 0 ? apr * 100 : null
}

export function useUserBalances(evmAddress: Hex | undefined) {
  const { evm } = useRpcProvider()
  const { vaultAddress, assetAddress } = useActivePropellerVault()
  return useQuery({
    queryKey: ["propeller-vault-balances", vaultAddress, evmAddress],
    enabled: !!evmAddress,
    queryFn: async () => {
      if (!evmAddress) return { eth: 0, shares: 0 }

      const ethToken = getContract({
        address: assetAddress,
        abi: ERC20_ABI,
        client: evm,
      })
      const vault = getContract({
        address: vaultAddress,
        abi: VAULT_ABI,
        client: evm,
      })

      // Each balance read is wrapped independently — on partial-deploy
      // environments any one contract might not be reachable, and a single
      // revert in a Promise.all would wipe the whole query.
      const safeBalance = async (
        label: string,
        read: () => Promise<bigint>,
      ) => {
        try {
          return await read()
        } catch (err) {
          if (import.meta.env.DEV) {
            console.warn(
              `[propeller-vault] ${label}.balanceOf reverted — treating as 0.`,
              err,
            )
          }
          return 0n
        }
      }

      const [ethBal, shareBal] = await Promise.all([
        safeBalance("ETH", () => ethToken.read.balanceOf([evmAddress])),
        safeBalance("pETH vault", () => vault.read.balanceOf([evmAddress])),
      ] as const)

      return {
        eth: Number(formatUnits(ethBal, 18)),
        shares: Number(formatUnits(shareBal, 18)),
      }
    },
    refetchInterval: 15_000,
  })
}

export function useEthAllowance(evmAddress: Hex | undefined) {
  const { evm } = useRpcProvider()
  const { vaultAddress, assetAddress } = useActivePropellerVault()
  return useQuery({
    queryKey: ["propeller-vault-allowance", vaultAddress, evmAddress],
    enabled: !!evmAddress,
    queryFn: async () => {
      if (!evmAddress) return 0
      const ethToken = getContract({
        address: assetAddress,
        abi: ERC20_ABI,
        client: evm,
      })
      const allowance = await ethToken.read.allowance([
        evmAddress,
        vaultAddress,
      ])
      return Number(formatUnits(allowance, 18))
    },
    refetchInterval: 15_000,
  })
}

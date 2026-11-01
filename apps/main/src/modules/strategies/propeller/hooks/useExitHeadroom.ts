import { queryOptions } from "@tanstack/react-query"
import { erc20Abi, getContract, type Hex } from "viem"

import {
  MAIN_DEBT_ABI,
  POOL_ABI,
  SUBLOOP_ABI,
  VAULT_ABI,
  YIELD_ACCOUNTING_ABI,
} from "@/modules/strategies/propeller/config/abi"
import { type PropellerVaultConfig } from "@/modules/strategies/propeller/config/vaults"
import {
  POOL_ADDRESS,
  SUBLOOP_ADDRESS,
} from "@/modules/strategies/propeller/constants"
import { type HeadroomState } from "@/modules/strategies/propeller/utils/headroomExit"
import { propellerQueryKeys } from "@/modules/strategies/propeller/utils/queryKeys"
import { TProviderContext } from "@/providers/rpcProvider"

/** What a headroom exit is judged on, at one block; null while the vault has them off. */
export const exitHeadroomQuery = (
  { isReady, evm }: TProviderContext,
  vault: PropellerVaultConfig,
) =>
  queryOptions({
    queryKey: propellerQueryKeys.exitHeadroom(vault.vaultAddress),
    enabled: isReady,
    queryFn: async (): Promise<HeadroomState | null> => {
      const options = { blockNumber: await evm.getBlockNumber() }
      const subLoop = getContract({
        address: SUBLOOP_ADDRESS,
        abi: SUBLOOP_ABI,
        client: evm,
      })
      const [enabled, gapBps] = await subLoop.read.exitHeadroom(
        [vault.vaultAddress],
        options,
      )
      if (!enabled) return null
      const contract = getContract({
        address: vault.vaultAddress,
        abi: VAULT_ABI,
        client: evm,
      })
      const [collateral, aToken, mainDebt, accounting] = await Promise.all([
        contract.read.asset(),
        contract.read.collateralAToken(),
        contract.read.mainDebt(),
        contract.read.yieldAccounting(),
      ])
      const balanceOf = (token: Hex) =>
        evm.readContract({
          address: token,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [vault.vaultAddress],
          ...options,
        })
      const ledger = getContract({
        address: mainDebt,
        abi: MAIN_DEBT_ABI,
        client: evm,
      })
      const fund = getContract({
        address: accounting,
        abi: YIELD_ACCOUNTING_ABI,
        client: evm,
      })
      const [
        reserveConfig,
        account,
        supplied,
        idle,
        roundingReserve,
        totalAssets,
        queuedCollateral,
        totalSupply,
        queuedShares,
        syntheticSupplied,
        loopShares,
        queuedDebt,
        reservedShares,
        sourceEquity,
        sourceShares,
        [activeDebt, , activeCash],
        protocolReserve,
      ] = await Promise.all([
        evm.readContract({
          address: POOL_ADDRESS,
          abi: POOL_ABI,
          functionName: "getConfiguration",
          args: [collateral],
          ...options,
        }),
        evm.readContract({
          address: POOL_ADDRESS,
          abi: POOL_ABI,
          functionName: "getUserAccountData",
          args: [vault.vaultAddress],
          ...options,
        }),
        balanceOf(aToken),
        balanceOf(collateral),
        contract.read.roundingReserve(options),
        contract.read.totalAssets(options),
        contract.read.totalQueuedCollateral(options),
        contract.read.totalSupply(options),
        contract.read.totalQueuedShares(options),
        contract.read.syntheticSupplied(options),
        contract.read.loopShares(options),
        contract.read.totalQueuedDebt(options),
        fund.read.reservedShares(options),
        subLoop.read.equityOf([vault.vaultAddress], options),
        subLoop.read.sharesOf([vault.vaultAddress], options),
        ledger.read.activePosition(options),
        ledger.read.protocolReserve(options),
      ])
      return {
        gapBps,
        reserveConfig,
        supplied,
        idle,
        roundingReserve,
        totalAssets,
        queuedCollateral,
        supply: totalSupply - queuedShares,
        collateralBase: account[0],
        debtBase: account[1],
        syntheticSupplied,
        loopShares,
        reservedShares,
        sourceEquity,
        sourceShares,
        activeDebt,
        activeCash,
        queuedDebt,
        protocolReserve,
      }
    },
    refetchInterval: 30_000,
  })

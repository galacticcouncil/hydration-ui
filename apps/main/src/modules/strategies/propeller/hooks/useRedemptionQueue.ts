import { queryOptions } from "@tanstack/react-query"
import { formatUnits, getContract, type Hex, zeroAddress } from "viem"

import {
  MAIN_DEBT_ABI,
  VAULT_ABI,
} from "@/modules/strategies/propeller/config/abi"
import { type PropellerVaultConfig } from "@/modules/strategies/propeller/config/vaults"
import { propellerQueryKeys } from "@/modules/strategies/propeller/utils/queryKeys"
import { TProviderContext } from "@/providers/rpcProvider"

export interface QueueEntry {
  requestId: number
  owner: string
  shares: number
  collateralOwed: number
  collateralSettled: number
  claimedCollateral: number
  settledProgress: number
  active: boolean
  isUser: boolean
  started: boolean
  eligibleAt: number
  observedAt: number
  mainDebt: Hex
  surplusHollar: number
  sourcePending: boolean
}

export const vaultQueueQuery = (
  rpc: TProviderContext,
  vault: PropellerVaultConfig,
  decimals: number,
  evmAddress: Hex | undefined,
) =>
  queryOptions({
    enabled: rpc.isReady && !!evmAddress,
    queryKey: propellerQueryKeys.vaultQueue(vault.vaultAddress, evmAddress),
    queryFn: async () => {
      const contract = getContract({
        address: vault.vaultAddress,
        abi: VAULT_ABI,
        client: rpc.evm,
      })
      // Use one block so cooldown, debt and claimability cannot disagree across reads.
      const block = await rpc.evm.getBlock()
      const options = { blockNumber: block.number }
      const [tail, totalQueued, unwind, mainDebt] = await Promise.all([
        contract.read.queueTail(options),
        contract.read.totalQueuedShares(options),
        contract.read.queueUnwind(options),
        contract.read.mainDebt(options),
      ])
      const ledger = getContract({
        address: mainDebt,
        abi: MAIN_DEBT_ABI,
        client: rpc.evm,
      })
      const queue: QueueEntry[] = []
      // Historical requests may still own recoveries after collateral has been claimed.
      // Bound RPC fan-out while scanning; a user-request index can replace this scan.
      for (let start = 0n; start < tail; start += 32n) {
        const ids = Array.from(
          { length: Number(tail - start > 32n ? 32n : tail - start) },
          (_, i) => start + BigInt(i),
        )
        const rows = await Promise.all(
          ids.map(async (id) => {
            const [
              owner,
              shares,
              collateralOwed,
              debtShare,
              ,
              repaid,
              collateralSettled,
              ,
              active,
            ] = await contract.read.redemptions([id], options)
            if (
              owner === zeroAddress ||
              owner.toLowerCase() !== evmAddress?.toLowerCase()
            )
              return null
            const started = id < unwind
            const [eligibleAt, claimed, position, surplus] = await Promise.all([
              contract.read.unwindEligibleAt([id], options),
              contract.read.claimedCollateral([id], options),
              started && mainDebt !== zeroAddress
                ? ledger.read.positions([id + 1n], options)
                : null,
              started && mainDebt !== zeroAddress
                ? ledger.read.surplusOf([id], options)
                : 0n,
            ])
            return {
              requestId: Number(id),
              owner,
              active,
              isUser: true,
              started,
              mainDebt,
              shares: Number(formatUnits(shares, decimals)),
              collateralOwed: Number(formatUnits(collateralOwed, decimals)),
              collateralSettled: Number(
                formatUnits(collateralSettled, decimals),
              ),
              claimedCollateral: Number(formatUnits(claimed, decimals)),
              settledProgress: started
                ? debtShare > 0n
                  ? Number(repaid) / Number(debtShare)
                  : 1
                : 0,
              eligibleAt: Number(eligibleAt) * 1000,
              observedAt: Number(block.timestamp) * 1000,
              surplusHollar: Number(formatUnits(surplus, 18)),
              sourcePending: (position?.[3] ?? 0n) > 0n,
            }
          }),
        )
        queue.push(...rows.filter((row) => row !== null))
      }
      return {
        queue,
        totalQueuedShares: Number(formatUnits(totalQueued, decimals)),
      }
    },
    refetchInterval: 30_000,
  })

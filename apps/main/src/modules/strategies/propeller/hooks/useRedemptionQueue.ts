import { queryOptions } from "@tanstack/react-query"
import { formatUnits, getContract, type Hex, zeroAddress } from "viem"

import { VAULT_ABI } from "@/modules/strategies/propeller/config/abi"
import { type PropellerVaultConfig } from "@/modules/strategies/propeller/config/vaults"
import { propellerQueryKeys } from "@/modules/strategies/propeller/utils/queryKeys"
import { TProviderContext } from "@/providers/rpcProvider"

export interface QueueEntry {
  requestId: number
  owner: string
  shares: number
  collateralOwed: number
  collateralSettled: number
  /**
   * Unwind progress from repaid/debtShare. Not collateralSettled: a claim
   * resets that to 0 mid-settlement.
   */
  settledProgress: number
  /** True until the owner claims. */
  active: boolean
  isUser: boolean
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

      const [tail, totalQueued] = await Promise.all([
        contract.read.queueTail(),
        contract.read.totalQueuedShares(),
      ])

      const queueTail = Number(tail)
      const totalQueuedShares = Number(formatUnits(totalQueued, decimals))

      const addr = evmAddress?.toLowerCase()

      // ponytail: queue length × vaults reads every 30 s; no multicall on lark, index when queues grow
      // Scan from 0, not queueHead: settled-but-unclaimed requests sit below the head.
      const redemptions = await Promise.all(
        Array.from({ length: queueTail }, (_, i) =>
          contract.read.redemptions([BigInt(i)]),
        ),
      )

      const entries = redemptions.flatMap<QueueEntry>(
        (
          [
            owner,
            shares,
            collateralOwed,
            debtShare,
            ,
            repaid,
            collateralSettled,
            ,
            active,
          ],
          i,
        ) =>
          owner === zeroAddress
            ? []
            : [
                {
                  requestId: i,
                  owner,
                  shares: Number(formatUnits(shares, decimals)),
                  collateralOwed: Number(formatUnits(collateralOwed, decimals)),
                  collateralSettled: Number(
                    formatUnits(collateralSettled, decimals),
                  ),
                  settledProgress:
                    debtShare > 0n ? Number(repaid) / Number(debtShare) : 0,
                  active,
                  isUser: addr ? owner.toLowerCase() === addr : false,
                },
              ],
      )

      return {
        queue: entries,
        totalQueuedShares,
      }
    },
    refetchInterval: 30_000,
  })

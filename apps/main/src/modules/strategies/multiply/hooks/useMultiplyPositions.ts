import { useEvmAddress } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import { chunk, range } from "remeda"
import { type ContractFunctionName, type Hex } from "viem"

import { ERC20_ABI } from "@/modules/strategies/bil/config/abi"
import {
  type Ladder,
  LOOPER_FACTORY_ABI,
  LOOPER_POSITION_ABI,
  type Stall,
} from "@/modules/strategies/multiply/config/abi"
import { MULTIPLY_QUERY_KEY_PREFIX } from "@/modules/strategies/multiply/config/constants"
import {
  LOOPER_FACTORY_ADDRESS,
  type MultiplyPair,
} from "@/modules/strategies/multiply/config/pairs"
import { getMultiplyPositionStatus } from "@/modules/strategies/multiply/utils/status"
import { useRpcProvider } from "@/providers/rpcProvider"

// lark3 caps a JSON-RPC batch at 10 and Multicall3 is not deployed.
const SCAN_CHUNK = 10
const IDLE_REFETCH_MS = 30_000
// ponytail: a fixed interval stands in for "every block"; switch to the best-block subscription if 6 s lags
const RUNNING_REFETCH_MS = 6_000

export type MultiplyPosition = {
  id: bigint
  address: Hex
  ladder: Ladder
  closing: boolean
  stalled: Stall
  pendingKind: number
  pendingDeadline: number
  pendingSubmittedAt: number
  // collateral base units
  nav: bigint
  pnl: bigint
  principal: bigint
  // WAD
  aaveLeverage: bigint
  targetLeverage: bigint
  healthFactor: bigint
  // fee asset base units
  feeBudget: bigint
}

/**
 * The connected account's open positions for one pair. The factory NFT is not
 * enumerable, so this scans `ownerOf` over every id; ownership is read live
 * because the NFT can be transferred.
 */
export const useMultiplyPositions = (pair: MultiplyPair) => {
  const { evm, isReady } = useRpcProvider()
  const evmAddress = useEvmAddress()
  const factory = LOOPER_FACTORY_ADDRESS

  return useQuery({
    queryKey: [MULTIPLY_QUERY_KEY_PREFIX, "positions", factory, evmAddress],
    enabled: isReady && !!factory && !!evmAddress,
    queryFn: async (): Promise<MultiplyPosition[]> => {
      const read = <
        F extends ContractFunctionName<typeof LOOPER_POSITION_ABI, "view">,
      >(
        address: Hex,
        functionName: F,
      ) => evm.readContract({ address, abi: LOOPER_POSITION_ABI, functionName })

      const nextId = await evm.readContract({
        address: factory!,
        abi: LOOPER_FACTORY_ABI,
        functionName: "nextId",
      })

      const account = evmAddress?.toLowerCase()
      const owned: bigint[] = []
      for (const ids of chunk(range(1, Number(nextId)), SCAN_CHUNK)) {
        const owners = await Promise.all(
          ids.map((id) =>
            evm.readContract({
              address: factory!,
              abi: LOOPER_FACTORY_ABI,
              functionName: "ownerOf",
              args: [BigInt(id)],
            }),
          ),
        )
        owners.forEach((owner, i) => {
          if (owner.toLowerCase() === account) owned.push(BigInt(ids[i]!))
        })
      }

      const positions = await Promise.all(
        owned.map(async (id) => {
          const address = await evm.readContract({
            address: factory!,
            abi: LOOPER_FACTORY_ABI,
            functionName: "predict",
            args: [id],
          })

          const [params, isClosed] = await Promise.all([
            evm.readContract({
              address,
              abi: LOOPER_POSITION_ABI,
              functionName: "params",
            }),
            evm.readContract({
              address,
              abi: LOOPER_POSITION_ABI,
              functionName: "isClosed",
            }),
          ])

          const isPair =
            params.collateral.toLowerCase() === pair.collateral.toLowerCase() &&
            params.debt.toLowerCase() === pair.debt.toLowerCase()
          if (isClosed || !isPair) return null

          const [
            ladder,
            closing,
            stalled,
            pending,
            nav,
            pnl,
            principal,
            aaveLeverage,
            targetLeverage,
            healthFactor,
            feeBudget,
          ] = await Promise.all([
            read(address, "ladder"),
            read(address, "closing"),
            read(address, "stalled"),
            evm.readContract({
              address,
              abi: LOOPER_POSITION_ABI,
              functionName: "pending",
            }),
            read(address, "nav"),
            read(address, "pnl"),
            read(address, "principal"),
            read(address, "aaveLeverage"),
            read(address, "targetLeverage"),
            read(address, "effectiveHealthFactor"),
            evm.readContract({
              address: params.feeAsset,
              abi: ERC20_ABI,
              functionName: "balanceOf",
              args: [address],
            }),
          ])

          return {
            id,
            address,
            ladder: ladder as Ladder,
            closing,
            stalled: stalled as Stall,
            pendingKind: pending.kind,
            pendingDeadline: Number(pending.deadline),
            pendingSubmittedAt: Number(pending.submittedAt),
            nav,
            pnl,
            principal,
            aaveLeverage,
            targetLeverage,
            healthFactor,
            feeBudget,
          }
        }),
      )

      return positions.filter((p) => p !== null)
    },
    refetchInterval: (query) =>
      query.state.data?.some(
        (p) => getMultiplyPositionStatus(p, Date.now()) !== "active",
      )
        ? RUNNING_REFETCH_MS
        : IDLE_REFETCH_MS,
  })
}

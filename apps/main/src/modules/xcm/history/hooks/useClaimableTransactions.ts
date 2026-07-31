import { HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { type XcJourney, XcJourneyBuilder } from "@galacticcouncil/xc-scan"
import { useQuery } from "@tanstack/react-query"
import { minutesToMilliseconds } from "date-fns"
import { useMemo } from "react"
import { sortBy } from "remeda"

import { usePendingClaimsStore } from "@/modules/xcm/history/hooks/usePendingClaimsStore"
import { useWormholeClaimable } from "@/modules/xcm/history/hooks/useWormholeClaimable"
import { useXcScan } from "@/modules/xcm/history/useXcScan"
import {
  getClaimableJourneys,
  getJourneyVaaHeader,
  resolveChainFromUrn,
  resolveNttDeployment,
} from "@/modules/xcm/history/utils/claim"
import { journeyDate } from "@/modules/xcm/history/utils/journey"
import { xcScanHttpClient } from "@/modules/xcm/history/xcScanStore"
import { type TProviderContext, useRpcProvider } from "@/providers/rpcProvider"

const useClaimableBackfill = (address: string) => {
  return useQuery({
    queryKey: ["xcscan", "claimable-backfill", address],
    enabled: !!address,
    refetchOnWindowFocus: true,
    retry: false,
    select: getClaimableJourneys,
    staleTime: minutesToMilliseconds(5),
    queryFn: async () => {
      const req = XcJourneyBuilder.journeys()
        .address(address)
        .status(["waiting"])
        .build({ validate: true })

      const res = await xcScanHttpClient.queryCrosschain(req, { limit: 100 })
      return res.items
    },
  })
}

/**
 * Identity of a claim is the VAA it redeems, not the indexer's id for it.
 *
 * WormholeScan's operation id (emitterChain/emitterAddress/sequence) will never
 * equal an Ocelloids correlationId, so once Ocelloids ships Hydration<->Wormhole
 * indexing a correlationId-keyed merge would render every claim twice.
 */
const vaaKey = (journey: XcJourney) => {
  const header = getJourneyVaaHeader(journey)
  if (!header) return journey.correlationId
  return `${header.emitterChain}/${header.emitterAddress}/${header.sequence}`
}

const IS_VAA_CONSUMED_ABI = [
  {
    type: "function",
    name: "isVAAConsumed",
    stateMutability: "view",
    inputs: [{ name: "hash", type: "bytes32" }],
    outputs: [{ type: "bool" }],
  },
] as const

/**
 * Whether the destination transceiver has already redeemed this VAA.
 *
 * Fails open: an rpc hiccup must not hide a claim. Worst case the user submits
 * a tx that reverts, which is the behaviour without this check anyway.
 */
async function isVaaConsumed(rpc: TProviderContext, journey: XcJourney) {
  const toChain = resolveChainFromUrn(journey.destination)
  const header = getJourneyVaaHeader(journey)
  if (!toChain || !header) return false
  if (toChain.key !== HYDRATION_CHAIN_KEY) return false

  const transceiver = resolveNttDeployment(journey, toChain)?.transceiver
    .wormhole
  if (!transceiver) return false

  try {
    return await rpc.evm.readContract({
      abi: IS_VAA_CONSUMED_ABI,
      address: transceiver as `0x${string}`,
      functionName: "isVAAConsumed",
      args: [`0x${header.id}` as `0x${string}`],
    })
  } catch {
    return false
  }
}

const useConsumedVaas = (journeys: XcJourney[]) => {
  const rpc = useRpcProvider()
  const keys = journeys.map(vaaKey)

  return useQuery({
    queryKey: ["xcm", "vaa-consumed", keys],
    enabled: rpc.isApiLoaded && journeys.length > 0,
    staleTime: minutesToMilliseconds(5),
    queryFn: async () => {
      const consumed = await Promise.all(
        journeys.map((journey) => isVaaConsumed(rpc, journey)),
      )
      return new Set(keys.filter((_, i) => consumed[i]))
    },
  })
}

export const useClaimableTransactions = () => {
  const { account } = useAccount()
  const address = account?.address ?? ""

  const { data: claimable } = useXcScan(address, {
    claimableOnly: true,
  })
  const { data: claimableBackfill } = useClaimableBackfill(address)
  const { data: claimableWormhole } = useWormholeClaimable(address)

  const { pendingCorrelationIds } = usePendingClaimsStore()

  const merged = useMemo(() => {
    // Wormhole first, so xc-scan's richer rows win on a collision.
    const byVaa = new Map<string, XcJourney>()
    for (const journey of getClaimableJourneys(claimableWormhole ?? [])) {
      byVaa.set(vaaKey(journey), journey)
    }
    for (const journey of claimableBackfill ?? []) {
      byVaa.set(vaaKey(journey), journey)
    }
    for (const journey of claimable) {
      byVaa.set(vaaKey(journey), journey)
    }

    const sorted = sortBy([...byVaa.values()], [journeyDate, "desc"])

    const pending = new Set(pendingCorrelationIds)
    return sorted.filter(({ correlationId }) => !pending.has(correlationId))
  }, [claimable, claimableBackfill, claimableWormhole, pendingCorrelationIds])

  const { data: consumed } = useConsumedVaas(merged)

  return useMemo(
    () => (consumed ? merged.filter((j) => !consumed.has(vaaKey(j))) : merged),
    [merged, consumed],
  )
}

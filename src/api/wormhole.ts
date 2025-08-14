import { H160, HYDRADX_PARACHAIN_ID } from "@galacticcouncil/sdk"
import {
  assetsMap,
  chainsMap,
  HydrationConfigService,
  routesMap,
} from "@galacticcouncil/xcm-cfg"
import { WhTransfer, WormholeTransfer } from "@galacticcouncil/xcm-sdk"
import { useQuery } from "@tanstack/react-query"
import { minutesToMilliseconds } from "date-fns"
import { useMemo } from "react"
import { QUERY_KEYS } from "utils/queryKeys"

export const useWormholeTransfersApi = () => {
  return useMemo(() => {
    const configService = new HydrationConfigService({
      assets: assetsMap,
      chains: chainsMap,
      routes: routesMap,
    })
    return new WormholeTransfer(configService, HYDRADX_PARACHAIN_ID)
  }, [])
}

type WormholeTransfersFilter = "all" | "redeemable"

const sortTransfersByTimestamp = (a: WhTransfer, b: WhTransfer) =>
  new Date(b.operation.sourceChain.timestamp).getTime() -
  new Date(a.operation.sourceChain.timestamp).getTime()

export const useWormholeTransfersQuery = (
  address: string,
  filter: WormholeTransfersFilter = "all",
) => {
  const api = useWormholeTransfersApi()
  return useQuery({
    enabled: !!address,
    staleTime: minutesToMilliseconds(30),
    queryKey: QUERY_KEYS.wormholeTransfers(address),
    queryFn: async () => {
      const [deposits, withdraws] = await Promise.all([
        api.getDeposits(H160.fromAny(address)),
        api.getWithdraws(address),
      ])

      return [...deposits, ...withdraws].sort(sortTransfersByTimestamp)
    },
    select: (data) => {
      if (filter === "redeemable") {
        return data.filter(({ redeem }) => !!redeem)
      }
      return data
    },
  })
}

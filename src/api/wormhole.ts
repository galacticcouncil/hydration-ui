import { HYDRADX_PARACHAIN_ID } from "@galacticcouncil/sdk"
import { SolanaChain } from "@galacticcouncil/xcm-core"
import { WhTransfer, WormholeTransfer } from "@galacticcouncil/xcm-sdk"
import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import { useHydrationConfigService } from "api/xcm"
import { minutesToMilliseconds } from "date-fns"
import { useMemo } from "react"
import { QUERY_KEYS } from "utils/queryKeys"

type WormholeTransfersFilter = "all" | "redeemable"

const BLACKLISTED_SOLANA_ASSETS = [
  "So11111111111111111111111111111111111111112",
]

export const useWormholeTransfersApi = () => {
  const configService = useHydrationConfigService()
  return useMemo(
    () => new WormholeTransfer(configService, HYDRADX_PARACHAIN_ID),
    [configService],
  )
}

const sortTransfersByTimestamp = (a: WhTransfer, b: WhTransfer) =>
  new Date(b.operation.sourceChain.timestamp).getTime() -
  new Date(a.operation.sourceChain.timestamp).getTime()

export const useWormholeTransfersQuery = (
  address: string,
  filter: WormholeTransfersFilter = "all",
  options?: UseQueryOptions<WhTransfer[]>,
) => {
  const api = useWormholeTransfersApi()
  return useQuery({
    enabled: !!address,
    staleTime: minutesToMilliseconds(30),
    queryKey: QUERY_KEYS.wormholeTransfers(address),
    queryFn: async () => {
      const [deposits, withdraws] = await Promise.all([
        api.getDeposits(address),
        api.getWithdraws(address),
      ])

      const withdrawsFiltered = withdraws.filter(({ asset, toChain }) =>
        toChain instanceof SolanaChain
          ? !BLACKLISTED_SOLANA_ASSETS.includes(asset)
          : true,
      )

      return [...deposits, ...withdrawsFiltered].sort(sortTransfersByTimestamp)
    },
    select: (data) => {
      if (filter === "redeemable") {
        return data.filter(({ redeem }) => !!redeem)
      }
      return data
    },
    ...options,
  })
}

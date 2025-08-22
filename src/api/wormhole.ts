import { HYDRADX_PARACHAIN_ID } from "@galacticcouncil/sdk"
import { WhTransfer, WormholeTransfer } from "@galacticcouncil/xcm-sdk"
import { useQuery } from "@tanstack/react-query"
import { useHydrationConfigService } from "api/xcm"
import { minutesToMilliseconds } from "date-fns"
import { useMemo } from "react"
import { Account } from "sections/web3-connect/store/useWeb3ConnectStore"
import { QUERY_KEYS } from "utils/queryKeys"

export const useWormholeTransfersApi = () => {
  const configService = useHydrationConfigService()
  return useMemo(
    () => new WormholeTransfer(configService, HYDRADX_PARACHAIN_ID),
    [configService],
  )
}

type WormholeTransfersFilter = "all" | "redeemable"

const sortTransfersByTimestamp = (a: WhTransfer, b: WhTransfer) =>
  new Date(b.operation.sourceChain.timestamp).getTime() -
  new Date(a.operation.sourceChain.timestamp).getTime()

export const useWormholeTransfersQuery = (
  account: Account | null,
  filter: WormholeTransfersFilter = "all",
) => {
  const ss58Addr = account?.address ?? ""
  const api = useWormholeTransfersApi()
  return useQuery({
    enabled: !!account,
    staleTime: minutesToMilliseconds(30),
    queryKey: QUERY_KEYS.wormholeTransfers(ss58Addr),
    queryFn: async () => {
      const [deposits, withdraws] = await Promise.all([
        api.getDeposits(ss58Addr),
        api.getWithdraws(ss58Addr),
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

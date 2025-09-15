import { WhStatus } from "@galacticcouncil/xcm-sdk"
import { useWormholeTransfersQuery } from "api/wormhole"
import { secondsToMilliseconds } from "date-fns"
import { useRpcProvider } from "providers/rpcProvider"
import { RedeemTable } from "sections/wallet/assets/wormhole/components/RedeemTable"
import { useWormholeRedeemStore } from "sections/wallet/assets/wormhole/WalletWormholeRedeemTable.utils"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"

export const WalletWormholeRedeemTable = () => {
  const { isLoaded: isApiLoaded } = useRpcProvider()
  const { account } = useAccount()

  const { pendingRedeemIds, removePendingId } = useWormholeRedeemStore()
  const hasPendingRedeems = pendingRedeemIds.length > 0

  const { data: redeemableTransfers, isLoading: isTransfersLoading } =
    useWormholeTransfersQuery(
      account?.address ?? "",
      "redeemable",
      hasPendingRedeems
        ? {
            refetchInterval: secondsToMilliseconds(60),
            staleTime: 0,
            onSuccess: (transfers) => {
              for (const pendingId of pendingRedeemIds) {
                const transfer = transfers.find(
                  (transfer) => transfer.operation.id === pendingId,
                )

                // remove pending id if transfer is completed
                if (transfer && transfer.status === WhStatus.Completed) {
                  return removePendingId(transfer.operation.id)
                }

                // remove pending id if transfer is no longer  in WH Api
                if (!transfer) {
                  return removePendingId(pendingId)
                }
              }
            },
          }
        : undefined,
    )

  if (!redeemableTransfers?.length || !isApiLoaded || isTransfersLoading) {
    return null
  }
  return <RedeemTable transfers={redeemableTransfers} />
}

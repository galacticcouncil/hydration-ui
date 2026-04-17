import { Grid } from "@galacticcouncil/ui/components"
import { useAccount } from "@galacticcouncil/web3-connect"

import { useClaimableTransactions } from "@/modules/xcm/history/hooks/useClaimableTransactions"
import { useXcScan } from "@/modules/xcm/history/useXcScan"
import { XcmHistoryPanel } from "@/modules/xcm/history/XcmHistoryPanel"
import { XcScanJourneyListSkeleton } from "@/modules/xcm/history/XcScanJourneyListSkeleton"
import { XcmTransferApp } from "@/modules/xcm/transfer/XcmTransferApp"

export const XcmPage = () => {
  const { account } = useAccount()
  const address = account?.address ?? ""

  const claimable = useClaimableTransactions()
  const { data: all, dataUpdatedAt } = useXcScan(address)

  const isLoading = !!account && dataUpdatedAt === 0
  const isTwoColTemplate = !!account && (all.length > 0 || isLoading)

  return (
    <Grid
      columnGap="xl"
      rowGap={["xl", null, null, "xxxl"]}
      justifyContent="center"
      columnTemplate={
        isTwoColTemplate ? ["1fr", null, null, "1fr 1fr", "32rem 32rem"] : "1fr"
      }
    >
      <XcmTransferApp />
      {isLoading && <XcScanJourneyListSkeleton />}
      {!isLoading && all.length > 0 && (
        <XcmHistoryPanel key={address} all={all} claimable={claimable} />
      )}
    </Grid>
  )
}

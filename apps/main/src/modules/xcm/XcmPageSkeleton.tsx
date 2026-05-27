import { Grid } from "@galacticcouncil/ui/components"
import { useAccount } from "@galacticcouncil/web3-connect"

import { XcScanJourneyListSkeleton } from "@/modules/xcm/history/XcScanJourneyListSkeleton"
import { XcmTransferSkeleton } from "@/modules/xcm/transfer/XcmTransferSkeleton"

export const XcmPageSkeleton = () => {
  const { isConnected } = useAccount()
  return (
    <Grid
      columnGap="xl"
      rowGap={["xl", null, null, "xxxl"]}
      columnTemplate={
        isConnected ? ["1fr", null, null, "1fr 1fr", "32rem 32rem"] : "1fr"
      }
      align="start"
      justifyContent="center"
    >
      <XcmTransferSkeleton />
      {isConnected && <XcScanJourneyListSkeleton />}
    </Grid>
  )
}

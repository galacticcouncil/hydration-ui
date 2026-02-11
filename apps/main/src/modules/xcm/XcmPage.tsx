import { Grid } from "@galacticcouncil/ui/components"
import { useAccount } from "@galacticcouncil/web3-connect"

import { useXcScan } from "@/modules/xcm/history/useXcScan"
import { XcScanJourneyList } from "@/modules/xcm/history/XcScanJourneyList"
import { XcmTransferApp } from "@/modules/xcm/transfer/XcmTransferApp"

export const XcmPage = () => {
  const { account } = useAccount()
  const address = account?.address ?? ""
  const { data } = useXcScan(address)

  const shouldRenderJourneyList = !!account && data.length > 0

  return (
    <Grid
      columnGap="xl"
      rowGap={["xl", null, null, "xxxl"]}
      columnTemplate={
        shouldRenderJourneyList
          ? ["1fr", null, null, "1fr 1fr", "32rem 32rem"]
          : "1fr"
      }
      justifyContent="center"
    >
      <XcmTransferApp />
      {shouldRenderJourneyList && (
        <XcScanJourneyList data={data} pageSize={4} />
      )}
    </Grid>
  )
}

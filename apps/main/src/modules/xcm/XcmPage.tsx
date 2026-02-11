import { Alert, Grid, Stack } from "@galacticcouncil/ui/components"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useTranslation } from "react-i18next"

import { useXcScan } from "@/modules/xcm/history/useXcScan"
import { XcScanJourneyList } from "@/modules/xcm/history/XcScanJourneyList"
import { XcmTransferApp } from "@/modules/xcm/transfer/XcmTransferApp"

export const XcmPage = () => {
  const { t } = useTranslation(["xcm"])
  const { account } = useAccount()
  const address = account?.address ?? ""
  const { data } = useXcScan(address)

  const shouldRenderJourneyList = !!account && data.length > 0

  return (
    <Stack gap="xl" mx="auto">
      <Grid
        columnGap="xl"
        rowGap="xxxl"
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
      <Alert
        sx={{ mx: "auto", width: ["100%", null, "6xl"] }}
        title={t("xcm:beta.title")}
        description={t("xcm:beta.description")}
      />
    </Stack>
  )
}

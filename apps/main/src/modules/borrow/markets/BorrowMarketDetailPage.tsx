import {
  AssetCapsProvider,
  useMarketAssetsData,
} from "@galacticcouncil/money-market/hooks"
import {
  Box,
  Button,
  Grid,
  Paper,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getAssetIdFromAddress } from "@galacticcouncil/utils"
import { Navigate } from "@tanstack/react-router"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { LINKS } from "@/config/navigation"
import { AccountBindingBanner } from "@/modules/borrow/account/AccountBindingBanner"
import { ReserveActions } from "@/modules/borrow/reserve/components/ReserveActions"
import { ReserveHeader } from "@/modules/borrow/reserve/components/ReserveHeader"
import { ReserveLogo } from "@/modules/borrow/reserve/components/ReserveLogo"
import { ReserveConfiguration } from "@/modules/borrow/reserve/ReserveConfiguration"
import { useAssets } from "@/providers/assetsProvider"

export type BorrowMarketDetailPageProps = {
  assetId: string
}

export const BorrowMarketDetailPage: FC<BorrowMarketDetailPageProps> = ({
  assetId,
}) => {
  const { t } = useTranslation(["borrow"])
  const [mode, setMode] = useState<"overview" | "actions">("overview")
  const { data: reserves = [] } = useMarketAssetsData()
  const { gte } = useBreakpoints()

  const reserve = reserves.find(
    (reserve) => getAssetIdFromAddress(reserve.underlyingAsset) === assetId,
  )

  const { getAsset } = useAssets()

  const asset = getAsset(assetId)

  if (!asset) return <Navigate to={LINKS.borrowMarkets} />
  if (!reserve) return null

  const filterVisible = !gte("lg")
  const overviewVisible = mode === "overview" || !filterVisible
  const actionsVisible = mode === "actions" || !filterVisible

  return (
    <AssetCapsProvider asset={reserve}>
      <Stack gap={30} py={20}>
        <ReserveLogo
          assetId={assetId}
          name={reserve?.name}
          symbol={reserve?.symbol}
        />
        <ReserveHeader reserve={reserve} />
        <AccountBindingBanner />
        <Box>
          <Text fs="h7" fw={600} font="primary" sx={{ mb: 10 }}>
            {t("borrow:reserve.configuration")}
          </Text>
          {filterVisible && (
            <Grid columns={2} gap={10} mb={10}>
              <Button
                variant={mode === "overview" ? "secondary" : "tertiary"}
                onClick={() => setMode("overview")}
              >
                {t("borrow:reserve.overview")}
              </Button>
              <Button
                variant={mode === "actions" ? "secondary" : "tertiary"}
                onClick={() => setMode("actions")}
              >
                {t("borrow:reserve.yourInfo")}
              </Button>
            </Grid>
          )}
          <Grid
            columnTemplate={["1fr", null, null, "1fr 380px"]}
            gap={20}
            alignItems="start"
          >
            <Paper p={20} hidden={!overviewVisible}>
              <ReserveConfiguration reserve={reserve} />
            </Paper>
            <Paper p={20} hidden={!actionsVisible}>
              <ReserveActions reserve={reserve} />
            </Paper>
          </Grid>
        </Box>
      </Stack>
    </AssetCapsProvider>
  )
}

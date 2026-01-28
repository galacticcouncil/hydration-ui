import {
  AssetCapsProvider,
  useMarketAssetsData,
} from "@galacticcouncil/money-market/hooks"
import { isGho } from "@galacticcouncil/money-market/utils"
import {
  Box,
  Button,
  Grid,
  Paper,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getAssetIdFromAddress, HOLLAR_ASSET_ID } from "@galacticcouncil/utils"
import { Navigate } from "@tanstack/react-router"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { LINKS } from "@/config/navigation"
import { AccountBindingBanner } from "@/modules/borrow/account/AccountBindingBanner"
import { HollarReserveHeader } from "@/modules/borrow/reserve/components/HollarReserveHeader"
import { ReserveActions } from "@/modules/borrow/reserve/components/ReserveActions"
import { ReserveHeader } from "@/modules/borrow/reserve/components/ReserveHeader"
import { ReserveLabel } from "@/modules/borrow/reserve/components/ReserveLabel"
import { HollarReserveConfiguration } from "@/modules/borrow/reserve/HollarReserveConfiguration"
import { ReserveConfiguration } from "@/modules/borrow/reserve/ReserveConfiguration"
import { useAssets } from "@/providers/assetsProvider"

export type BorrowMarketDetailPageProps = {
  address: string
}

export const BorrowMarketDetailPage: FC<BorrowMarketDetailPageProps> = ({
  address,
}) => {
  const { t } = useTranslation(["borrow"])
  const [mode, setMode] = useState<"overview" | "actions">("overview")
  const { data: reserves, isLoading } = useMarketAssetsData()
  const { gte } = useBreakpoints()

  const reserve = reserves.find(
    (reserve) => reserve.underlyingAsset === address,
  )

  const isGhoReserve = !!reserve && isGho(reserve)

  const { getAsset } = useAssets()

  const asset = isGhoReserve
    ? getAsset(HOLLAR_ASSET_ID)
    : getAsset(getAssetIdFromAddress(address))

  if (!isLoading && !asset) return <Navigate to={LINKS.borrowMarkets} />
  if (!reserve) return null

  const filterVisible = !gte("lg")
  const overviewVisible = mode === "overview" || !filterVisible
  const actionsVisible = mode === "actions" || !filterVisible

  return (
    <AssetCapsProvider asset={reserve}>
      <Stack gap="xxl">
        <ReserveLabel reserve={reserve} withName size="large" />
        {isGhoReserve ? (
          <HollarReserveHeader reserve={reserve} />
        ) : (
          <ReserveHeader reserve={reserve} />
        )}
        <AccountBindingBanner />
        <Box>
          <Text fs="h7" fw={600} font="primary" sx={{ mb: "base" }}>
            {t("borrow:reserve.configuration")}
          </Text>
          {filterVisible && (
            <Grid columns={2} gap="base" mb="base">
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
            columnTemplate={["1fr", null, null, "1fr 24rem"]}
            gap="xl"
            alignItems="start"
          >
            <Paper p="xl" hidden={!overviewVisible}>
              {isGhoReserve ? (
                <HollarReserveConfiguration reserve={reserve} />
              ) : (
                <ReserveConfiguration reserve={reserve} />
              )}
            </Paper>
            <Paper p="xl" hidden={!actionsVisible}>
              <ReserveActions reserve={reserve} />
            </Paper>
          </Grid>
        </Box>
      </Stack>
    </AssetCapsProvider>
  )
}

import { useMarketAssetsData } from "@galacticcouncil/money-market/hooks"
import { Wallet } from "@galacticcouncil/ui/assets/icons"
import {
  Box,
  Button,
  Flex,
  Icon,
  Paper,
  Separator,
  Stack,
  Text,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { getAssetIdFromAddress } from "@galacticcouncil/utils"
import { Navigate } from "@tanstack/react-router"
import { t } from "i18next"
import { FC } from "react"

import { Logo } from "@/components"
import { LINKS } from "@/config/navigation"
import { ReserveHeader } from "@/modules/borrow/reserve/components/ReserveHeader"
import { ReserveConfiguration } from "@/modules/borrow/reserve/ReserveConfiguration"
import { useAssets } from "@/providers/assetsProvider"

import { SContent } from "./BorrowMarketDetailPage.styled"

export type BorrowMarketDetailPageProps = {
  assetId: string
}

export const BorrowMarketDetailPage: FC<BorrowMarketDetailPageProps> = ({
  assetId,
}) => {
  const isGho = false

  const { data: reserves = [] } = useMarketAssetsData()

  const reserve = reserves.find(
    (reserve) => getAssetIdFromAddress(reserve.underlyingAsset) === assetId,
  )

  const { getAsset } = useAssets()

  const asset = getAsset(assetId)

  if (!asset) return <Navigate to={LINKS.borrowMarkets} />
  if (!reserve) return null

  return (
    <Stack gap={30} py={20}>
      <Flex gap={8}>
        <Logo id={assetId} size="large" />
        <Stack>
          <Text fs="h7" lh={1} fw={600} font="primary">
            {reserve?.name}
          </Text>
          <Text fs="p6" color={getToken("text.medium")}>
            {reserve?.symbol}
          </Text>
        </Stack>
      </Flex>

      <ReserveHeader />

      <Box>
        <Text fs="h7" fw={600} font="primary" sx={{ mb: 10 }}>
          Reserve status and configuration
        </Text>

        <SContent>
          <Paper p={20}>
            {isGho ? <></> : <ReserveConfiguration reserve={reserve} />}
          </Paper>

          <Paper p={20}>
            <Stack separated gap={20} separator={<Separator mx={-20} />}>
              <Flex gap={20} align="center">
                <Icon component={Wallet} sx={{ color: getToken("text.low") }} />
                <ValueStats
                  label="Balance"
                  customValue={t("currency", {
                    value: 1000,
                    symbol: reserve?.symbol,
                  })}
                  alwaysWrap
                />
              </Flex>
              <Flex gap={20} justify="space-between" align="center">
                <ValueStats
                  label="Available to Supply"
                  customValue={t("currency", {
                    value: 5.132,
                    symbol: reserve?.symbol,
                  })}
                  alwaysWrap
                />
                <Button>Supply</Button>
              </Flex>
              <Flex gap={20} justify="space-between" align="center">
                <ValueStats
                  label="Available to Borrow"
                  customValue={t("currency", {
                    value: 0,
                    symbol: reserve?.symbol,
                  })}
                  alwaysWrap
                />
                <Button>Borrow</Button>
              </Flex>
            </Stack>
          </Paper>
        </SContent>
      </Box>
    </Stack>
  )
}

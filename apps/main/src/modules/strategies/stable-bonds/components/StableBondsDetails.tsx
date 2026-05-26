import {
  Box,
  Flex,
  Paper,
  ProgressBar,
  ResponsiveScope,
  SectionHeader,
  Separator,
  SummaryRow,
  Text,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { hoursToMilliseconds } from "date-fns"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import {
  SDetailsContainer,
  SDetailsSeparator,
  SRemaining,
  SRemainingItem,
  SRemainingList,
  SStatsGroup,
} from "@/modules/strategies/stable-bonds/components/StableBondsDetails.styled"
import { useStableBondsConfig } from "@/modules/strategies/stable-bonds/context/StableBondsConfigContext"
import { OtcOffer } from "@/modules/trade/otc/table/OtcTable.query"
import type { TAsset } from "@/providers/assetsProvider"

// @TODO: can be replaced with initial OTC value from mainnet indexer
const MAX_FUNDING_CAPACITY = 222_222

export type StableBondsDetailsProps = {
  orders?: OtcOffer[]
}

export const StableBondsDetails: React.FC<StableBondsDetailsProps> = ({
  orders,
}) => {
  const { t } = useTranslation(["common", "strategies"])
  const config = useStableBondsConfig()

  const fundingCapacities = useMemo(() => {
    if (!orders) return []

    const byAssetId = orders.reduce<
      Map<
        string,
        {
          asset: TAsset
          amount: string
        }
      >
    >((acc, order) => {
      const current = acc.get(order.assetIn.id)

      acc.set(order.assetIn.id, {
        asset: order.assetIn,
        amount: current
          ? Big(current.amount).plus(order.assetAmountIn).toString()
          : order.assetAmountIn,
      })

      return acc
    }, new Map())

    return [...byAssetId.values()]
  }, [orders])

  return (
    <Paper p="l">
      <SectionHeader
        title={t("strategies:details.title")}
        as="h2"
        noTopPadding
      />
      <Separator mx="-l" mb="l" />

      <ResponsiveScope>
        <SDetailsContainer justify="flex-start">
          {fundingCapacities.length > 0 && (
            <>
              <SRemaining>
                <Text fs="p5" color={getToken("text.medium")}>
                  {t("strategies:bonds.details.remainingCapacity")}
                </Text>
                <SRemainingList gap="xl">
                  {fundingCapacities.map(({ asset, amount }) => {
                    const remainingPct = Big(amount)
                      .div(MAX_FUNDING_CAPACITY)
                      .mul(100)
                      .toNumber()

                    return (
                      <SRemainingItem key={asset.id} gap="xs">
                        <Flex align="center" gap="base">
                          <AssetLogo id={asset.id} size="small" />
                          <Text
                            font="primary"
                            fs="h6"
                            fw={600}
                            color={getToken("text.high")}
                          >
                            {t("number", { value: amount })}
                          </Text>
                        </Flex>
                        <ProgressBar
                          value={remainingPct}
                          customLabel={
                            <Text
                              fs="p4"
                              as="span"
                              fw={600}
                              color={getToken("text.tint.quart")}
                            >
                              {t("percent", { value: remainingPct })}
                            </Text>
                          }
                        />
                      </SRemainingItem>
                    )
                  })}
                </SRemainingList>
              </SRemaining>
              <SDetailsSeparator />
            </>
          )}

          <SStatsGroup>
            <ValueStats
              sx={{ alignSelf: "center" }}
              wrap
              label={t("strategies:bonds.details.availableApr")}
              customValue={
                <Text
                  font="primary"
                  fs="h6"
                  fw={600}
                  color={getToken("accents.success.emphasis")}
                >
                  {t("percent", {
                    value: config.apr,
                    maximumFractionDigits: 1,
                  })}
                </Text>
              }
            />

            <Separator orientation="vertical" sx={{ alignSelf: "stretch" }} />

            <ValueStats
              sx={{ alignSelf: "center" }}
              wrap
              label={t("strategies:bonds.details.maturityPeriod")}
              customValue={
                <Text
                  font="primary"
                  fs="h6"
                  fw={600}
                  color={getToken("text.high")}
                >
                  {t("interval", {
                    value: hoursToMilliseconds(config.maturityPeriodDays * 24),
                    unit: "d",
                  })}
                </Text>
              }
            />
          </SStatsGroup>
        </SDetailsContainer>
      </ResponsiveScope>

      {fundingCapacities.length > 0 && (
        <>
          <Separator mx="-l" />
          <Box mb="-s" pt="s" asChild>
            <SummaryRow
              label={t("strategies:bonds.details.fundingCurrency")}
              content={
                <Flex align="center" wrap>
                  {fundingCapacities.map(({ asset }, index) => (
                    <Flex key={asset.id} align="center" wrap>
                      {index > 0 && <Text mr="base">{", "}</Text>}
                      <Flex align="center" gap="xs">
                        <AssetLogo id={asset.id} size="small" />
                        <Text fs="p4" lh={1.5}>
                          {asset.symbol}
                        </Text>
                      </Flex>
                    </Flex>
                  ))}
                </Flex>
              }
            />
          </Box>
        </>
      )}
    </Paper>
  )
}

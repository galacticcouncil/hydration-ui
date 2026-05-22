import {
  Box,
  Flex,
  Paper,
  SectionHeader,
  Separator,
  SummaryRow,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { hoursToMilliseconds } from "date-fns"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { useStableBondsConfig } from "@/modules/strategies/stable-bonds/context/StableBondsConfigContext"
import { OtcOffer } from "@/modules/trade/otc/table/OtcTable.query"
import type { TAsset } from "@/providers/assetsProvider"

export type StableBondsDetailsProps = {
  orders?: OtcOffer[]
}

const DetailSeparator = () => (
  <Separator
    orientation="vertical"
    sx={{
      alignSelf: "stretch",
      display: ["none", null, "block"],
      mx: "l",
    }}
  />
)

export const StableBondsDetails: React.FC<StableBondsDetailsProps> = ({
  orders,
}) => {
  const { t } = useTranslation("common")
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
      <SectionHeader title="Strategy details" as="h2" noTopPadding />
      <Separator mx="-l" mb="l" />

      <Flex align="stretch" gap={["xl", null, "xxxl"]} wrap>
        {fundingCapacities.length > 0 && (
          <>
            <Box>
              <Text fs="p5" color={getToken("text.medium")}>
                Remaining capacity
              </Text>
              <Flex gap="xl">
                {fundingCapacities.map(({ asset, amount }) => (
                  <Flex key={asset.id} align="center" gap="base">
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
                ))}
              </Flex>
            </Box>
            <DetailSeparator />
          </>
        )}

        <Box>
          <Text fs="p5" color={getToken("text.medium")}>
            Available APR
          </Text>
          <Text
            font="primary"
            fs="h6"
            fw={600}
            color={getToken("accents.success.emphasis")}
            mt="xs"
          >
            {t("percent", {
              value: config.apr,
              maximumFractionDigits: 1,
            })}
          </Text>
        </Box>

        <DetailSeparator />

        <Box>
          <Text fs="p5" color={getToken("text.medium")}>
            Maturity period
          </Text>
          <Text
            font="primary"
            fs="h6"
            fw={500}
            color={getToken("text.high")}
            mt="xs"
          >
            {t("interval", {
              value: hoursToMilliseconds(config.maturityPeriodDays * 24),
              unit: "d",
            })}
          </Text>
        </Box>
      </Flex>

      {fundingCapacities.length > 0 && (
        <>
          <Separator mx="-l" />
          <Box mb="-s" pt="s" asChild>
            <SummaryRow
              label="Funding currency"
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

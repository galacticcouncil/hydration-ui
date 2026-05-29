import {
  Box,
  Flex,
  Paper,
  ResponsiveScope,
  SectionHeader,
  Separator,
  SummaryRow,
  Text,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { millisecondsInDay } from "date-fns/constants"
import { useTranslation } from "react-i18next"

import { useBondData } from "@/api/bonds"
import { AssetLogo } from "@/components/AssetLogo"
import { StableBondsCurrency } from "@/modules/strategies/stable-bonds/components/StableBondsCurrency"
import {
  SDetailsContainer,
  SDetailsSeparator,
  SRemaining,
  SRemainingList,
  SStatsGroup,
} from "@/modules/strategies/stable-bonds/components/StableBondsDetails.styled"
import { useStableBondsConfig } from "@/modules/strategies/stable-bonds/context/StableBondsConfigContext"
import { OtcOffer } from "@/modules/trade/otc/table/OtcTable.query"

export type StableBondsDetailsProps = {
  orders?: OtcOffer[]
}

export const StableBondsDetails: React.FC<StableBondsDetailsProps> = ({
  orders,
}) => {
  const { t } = useTranslation(["common", "strategies"])
  const config = useStableBondsConfig()
  const { timeLeft } = useBondData(config.bondId)

  const daysLeft = timeLeft > 0 ? Math.ceil(timeLeft / millisecondsInDay) : 0
  const currentApr = daysLeft > 0 ? (config.fixedYield / daysLeft) * 365 : null

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
          {!!orders?.length && (
            <>
              <SRemaining>
                <Text fs="p5" color={getToken("text.medium")}>
                  {t("strategies:bonds.details.remainingCapacity")}
                </Text>
                <SRemainingList gap="xl">
                  {orders.map((order) => (
                    <StableBondsCurrency key={order.id} order={order} />
                  ))}
                </SRemainingList>
              </SRemaining>
              <SDetailsSeparator />
            </>
          )}

          {currentApr && timeLeft > 0 && (
            <SStatsGroup>
              <ValueStats
                sx={{ alignSelf: "center" }}
                wrap
                label={t("apr")}
                customValue={
                  <Text
                    font="primary"
                    fs="h6"
                    fw={600}
                    color={getToken("accents.success.emphasis")}
                  >
                    {t("percent", {
                      value: currentApr,
                      minimumFractionDigits: 2,
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
                    {t("interval.remaining", {
                      value: timeLeft,
                      largest: 1,
                      ...(timeLeft > millisecondsInDay && { unit: "d" }),
                    })}
                  </Text>
                }
              />
            </SStatsGroup>
          )}
        </SDetailsContainer>
      </ResponsiveScope>

      {!!orders?.length && (
        <>
          <Separator mx="-l" />
          <Box mb="-s" pt="s" asChild>
            <SummaryRow
              label={t("strategies:bonds.details.fundingCurrency")}
              content={
                <Flex align="center" wrap>
                  {orders.map((order, index) => (
                    <Flex
                      key={order.id ?? order.assetIn.id}
                      align="center"
                      wrap
                    >
                      {index > 0 && <Text mr="base">{", "}</Text>}
                      <Flex align="center" gap="xs">
                        <AssetLogo id={order.assetIn.id} size="small" />
                        <Text fs="p4" lh={1.5}>
                          {order.assetIn.symbol}
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

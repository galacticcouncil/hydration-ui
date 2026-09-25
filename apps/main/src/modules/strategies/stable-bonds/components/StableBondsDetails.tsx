import {
  Box,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Flex,
  Separator,
  SummaryRow,
  Text,
  ValueStats,
  ValueStatsGroup,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { millisecondsInDay } from "date-fns/constants"
import { useTranslation } from "react-i18next"

import { useBondData } from "@/api/bonds"
import { AssetLogo } from "@/components/AssetLogo"
import { StableBondsCurrency } from "@/modules/strategies/stable-bonds/components/StableBondsCurrency"
import { useStableBondsConfig } from "@/modules/strategies/stable-bonds/context/StableBondsConfigContext"
import {
  getBondApr,
  getDefaultBondApr,
} from "@/modules/strategies/stable-bonds/utils/apr"
import { OtcOffer } from "@/modules/trade/otc/table/OtcTable.query"

export type StableBondsDetailsProps = {
  orders?: OtcOffer[]
  isSoldOut?: boolean
}

export const StableBondsDetails: React.FC<StableBondsDetailsProps> = ({
  orders,
  isSoldOut,
}) => {
  const { t } = useTranslation(["common", "strategies"])
  const config = useStableBondsConfig()
  const { timeLeft } = useBondData(config.bondId)

  const currentApr = isSoldOut
    ? getDefaultBondApr(config.bondId)
    : getBondApr(config.bondId, timeLeft)
  const showStats = !!currentApr && timeLeft > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("strategies:details.title")}</CardTitle>
      </CardHeader>

      <CardBody>
        <ValueStatsGroup>
          {!!orders?.length && (
            <ValueStats
              wrap
              label={t("strategies:bonds.details.remainingCapacity")}
              customValue={
                <Flex gap="xxxl" wrap>
                  {orders.map((order) => (
                    <StableBondsCurrency key={order.id} order={order} />
                  ))}
                </Flex>
              }
            />
          )}

          {showStats && (
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
                    maximumFractionDigits: 2,
                    suffix: isSoldOut ? "+" : undefined,
                  })}
                </Text>
              }
            />
          )}

          {showStats && (
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
          )}
        </ValueStatsGroup>
      </CardBody>

      {!!orders?.length && (
        <>
          <Separator />
          <Box px="l" py="s">
            <SummaryRow
              label={t("strategies:bonds.details.fundingCurrency")}
              content={
                <Flex align="center" wrap>
                  {orders.map((order, index) => (
                    <Flex key={order.id} align="center" wrap>
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
    </Card>
  )
}

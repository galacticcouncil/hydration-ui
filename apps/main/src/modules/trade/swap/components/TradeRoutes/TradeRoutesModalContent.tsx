import { ArrowRightLong, Routes } from "@galacticcouncil/ui/assets/icons"
import {
  Box,
  Flex,
  Grid,
  Icon,
  ModalBody,
  ModalHeader,
  Separator,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC, Fragment } from "react"
import { useTranslation } from "react-i18next"

import { TradeRouteAsset } from "@/modules/trade/swap/components/TradeRoutes/TradeRouteAsset"
import { TradeRouteFee } from "@/modules/trade/swap/components/TradeRoutes/TradeRouteFee"
import { TradeRoute } from "@/modules/trade/swap/components/TradeRoutes/TradeRoutes.utils"

type Props = {
  readonly totalFeesDisplay: string
  readonly routes: ReadonlyArray<TradeRoute>
}
export const TradeRoutesModalContent: FC<Props> = ({
  totalFeesDisplay,
  routes,
}) => {
  const { t } = useTranslation(["common", "trade"])

  return (
    <>
      <ModalHeader title={t("trade:market.summary.routes.header")} />
      <ModalBody sx={{ p: 0 }}>
        <Flex justify="space-between" align="center" py="m" px="l">
          <Flex align="center" gap="base">
            <Icon
              component={Routes}
              color={getToken("buttons.primary.high.rest")}
            />
            <Text fw={500} fs="p5" lh={1.2} color={getToken("text.medium")}>
              {t("trade:market.summary.routes.bestRoute")}
            </Text>
          </Flex>
          <Text fw={500} fs="p5" lh={1.2} color={getToken("text.high")}>
            {t("trade:market.summary.routes.totalFees", {
              amount: totalFeesDisplay,
            })}
          </Text>
        </Flex>
        <Separator />
        <Grid
          columnTemplate="auto auto auto auto"
          columnGap="m"
          rowGap="base"
          align="center"
          p="xl"
          sx={{ justifyContent: "space-between" }}
        >
          {routes.map((route, index) => (
            <Fragment key={route.assetIn.id}>
              {index > 0 && (
                <Box sx={{ gridColumn: "1/-1" }} width={13}>
                  <Box
                    ml="auto"
                    height={13}
                    width={0}
                    borderColor={getToken("details.borders")}
                    borderWidth={1}
                    borderStyle="solid"
                  />
                </Box>
              )}
              <TradeRouteAsset
                assetId={route.assetIn.id}
                assetSymbol={route.assetIn.symbol}
                amount={route.amountIn}
              />
              <Icon
                size="m"
                component={ArrowRightLong}
                color={getToken("icons.onContainer")}
              />
              <TradeRouteAsset
                assetId={route.assetOut.id}
                assetSymbol={route.assetOut.symbol}
                amount={route.amountOut}
              />
              <TradeRouteFee
                feePct={route.tradeFeePct}
                fees={route.tradeFees}
              />
            </Fragment>
          ))}
        </Grid>
      </ModalBody>
    </>
  )
}

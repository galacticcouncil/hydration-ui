import {
  BuySwap,
  SellSwap,
  Swap,
} from "@galacticcouncil/sdk-next/build/types/sor"
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
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { FC, Fragment } from "react"
import { useTranslation } from "react-i18next"

import { TradeType } from "@/api/trade"
import { useDisplayAssetsPrice } from "@/components/AssetPrice"
import { TradeRouteAsset } from "@/modules/trade/swap/components/TradeRoutes/TradeRouteAsset"
import { TradeRouteFee } from "@/modules/trade/swap/components/TradeRoutes/TradeRouteFee"
import { useAssets } from "@/providers/assetsProvider"
import { scaleHuman } from "@/utils/formatting"

type Props = {
  readonly swapType: TradeType
  readonly routes: ReadonlyArray<Swap>
}
export const TradeRoutesModalContent: FC<Props> = ({ swapType, routes }) => {
  const { t } = useTranslation(["common", "trade"])
  const { getAssetWithFallback } = useAssets()

  const isSellSwap = swapType === TradeType.Sell

  const routesData = routes.map((route) => {
    const assetIn = getAssetWithFallback(route.assetIn)
    const assetOut = getAssetWithFallback(route.assetOut)
    const amountIn = scaleHuman(route.amountIn, assetIn.decimals)
    const amountOut = scaleHuman(route.amountOut, assetOut.decimals)

    const tradeFeeAsset = isSellSwap ? assetOut : assetIn
    const calculatedAmount = isSellSwap
      ? scaleHuman((route as SellSwap).calculatedOut, assetOut.decimals)
      : scaleHuman((route as BuySwap).calculatedIn, assetIn.decimals)

    const tradeFee = Big(calculatedAmount)
      .times(route.tradeFeePct)
      .div(100)
      .toString()

    return {
      poolId: route.poolId,
      assetIn,
      assetOut,
      amountIn,
      amountOut,
      tradeFeePct: route.tradeFeePct,
      tradeFee,
      tradeFeeAsset,
    }
  })

  const feeValues = routesData.map(
    (route) => [route.tradeFeeAsset.id, route.tradeFee] as const,
  )
  const [totalFeesDisplay] = useDisplayAssetsPrice(feeValues)

  return (
    <>
      <ModalHeader title={t("trade:market.summary.routes.header")} />
      <ModalBody sx={{ p: 0 }}>
        <Flex
          justify="space-between"
          align="center"
          py={getTokenPx("scales.paddings.m")}
          px={16}
        >
          <Flex align="center" gap={10}>
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
          columnTemplate="auto 1fr 1fr auto"
          rowGap={getTokenPx("scales.paddings.base")}
          p={getTokenPx("scales.paddings.xl")}
        >
          {routesData.map((route, index) => (
            <Fragment key={route.poolId}>
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
              <Grid
                sx={{ gridColumn: "1/-1" }}
                columnTemplate="subgrid"
                align="center"
                height={40}
              >
                <TradeRouteAsset
                  assetId={route.assetIn.id}
                  assetSymbol={route.assetIn.symbol}
                  amount={route.amountIn}
                />
                <Icon
                  sx={{ justifySelf: "center" }}
                  size={18}
                  component={ArrowRightLong}
                  color={getToken("icons.onContainer")}
                />
                <TradeRouteAsset
                  assetId={route.assetOut.id}
                  assetSymbol={route.assetOut.symbol}
                  amount={route.amountOut}
                />
                <TradeRouteFee
                  assetId={route.tradeFeeAsset.id}
                  tradeFeePct={route.tradeFeePct}
                  tradeFee={route.tradeFee}
                />
              </Grid>
            </Fragment>
          ))}
        </Grid>
      </ModalBody>
    </>
  )
}

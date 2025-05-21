import { Swap } from "@galacticcouncil/sdk-next/build/types/sor"
import { ChevronRight, Routes } from "@galacticcouncil/ui/assets/icons"
import { Flex, Icon, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { Fragment } from "react"
import { useTranslation } from "react-i18next"

import { useAssets } from "@/providers/assetsProvider"

type TradeRoutesProps = {
  readonly routes: ReadonlyArray<Swap>
}

export const TradeRoutes = ({ routes }: TradeRoutesProps) => {
  const { t } = useTranslation("trade")
  const { getAssetWithFallback } = useAssets()

  const firstRoute = routes[0]

  if (!firstRoute) {
    return null
  }

  return (
    <Flex direction="column" sx={{ pb: 4, pt: 8 }}>
      <Flex justify="space-between" align="center">
        <Text
          fs="p4"
          fw={400}
          color={getToken("buttons.primary.high.rest")}
          sx={{ pt: 2 }}
        >
          {t("market.form.routes.label", { count: routes.length })}
        </Text>

        <Flex gap={4} align="center">
          <Flex gap={4} align="center">
            <Text
              fs="p5"
              fw={500}
              color={getToken("text.high")}
              whiteSpace="nowrap"
            >
              {getAssetWithFallback(String(firstRoute.assetIn)).symbol}
            </Text>
            {routes.map((route) => {
              return (
                <Fragment key={route.poolAddress}>
                  <Icon
                    size={18}
                    component={ChevronRight}
                    color={getToken("icons.onContainer")}
                  />
                  <Text
                    fs="p5"
                    fw={500}
                    color={getToken("text.high")}
                    whiteSpace="nowrap"
                  >
                    {getAssetWithFallback(String(route.assetOut)).symbol}
                  </Text>
                </Fragment>
              )
            })}
          </Flex>

          <Icon
            size="70%"
            component={Routes}
            color={getToken("buttons.primary.high.rest")}
          />
        </Flex>
      </Flex>
      <Text fs="p6" lh={1} fw={400} color={getToken("text.low")} align="end">
        {t("market.form.routes.desc", {
          symbol: getAssetWithFallback(String(routes[0]?.assetIn)).symbol,
        })}
      </Text>
    </Flex>
  )
}

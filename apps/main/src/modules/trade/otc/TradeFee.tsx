import { Flex, Text } from "@galacticcouncil/ui/components"
import { getToken, px } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useOtcTradeFeeQuery } from "@/modules/trade/otc/fill-order/TradeFee.query"
import { TAsset } from "@/providers/assetsProvider"

type Props = {
  readonly assetOut: TAsset | undefined
  readonly assetAmountOut: string
}

export const TradeFee: FC<Props> = ({ assetOut, assetAmountOut }) => {
  const { t } = useTranslation()
  const { data } = useOtcTradeFeeQuery(assetOut?.id ?? "")

  const fee = new Big(data || "0").times(assetAmountOut).toString()

  return (
    <Flex justify="space-between" align="center" my={4.5} px={20}>
      <Text fw={400} fs="p5" lh={px(16.8)} color={getToken("text.medium")}>
        {t("tradeFee")}
      </Text>
      <Text fw={500} fs="p5" lh={px(14.4)} color={getToken("text.high")}>
        {data ? (
          <>
            ={t("number", { value: fee })} {assetOut?.symbol}
          </>
        ) : (
          "N / A"
        )}
      </Text>
    </Flex>
  )
}

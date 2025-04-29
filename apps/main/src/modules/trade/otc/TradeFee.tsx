import { Flex, Skeleton, Text } from "@galacticcouncil/ui/components"
import { getToken, px } from "@galacticcouncil/ui/utils"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { otcTradeFeeQuery } from "@/modules/trade/otc/TradeFee.query"
import { TAsset } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"

type Props = {
  readonly assetOut: TAsset | undefined | null
  readonly assetAmountOut: string
}

export const TradeFee: FC<Props> = ({ assetOut, assetAmountOut }) => {
  const { t } = useTranslation()

  const rpc = useRpcProvider()
  const { data, isLoading } = useQuery(otcTradeFeeQuery(rpc))

  const fee = new Big(data || "0").times(assetAmountOut).toString()

  return (
    <Flex justify="space-between" align="center" my={4.5} px={20}>
      <Text fw={400} fs="p5" lh={px(16.8)} color={getToken("text.medium")}>
        {t("tradeFee")}
      </Text>
      <Text fw={500} fs="p5" lh={px(14.4)} color={getToken("text.high")}>
        {(() => {
          if (isLoading) {
            return <Skeleton width={48} />
          }
          if (!data) {
            return "N / A"
          }

          return t("currency", {
            value: fee,
            symbol: assetOut?.symbol,
            prefix: "=",
          })
        })()}
      </Text>
    </Flex>
  )
}

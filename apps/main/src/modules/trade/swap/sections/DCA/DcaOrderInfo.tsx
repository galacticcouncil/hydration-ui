import { HealthFactorChange } from "@galacticcouncil/money-market/components"
import { TradeDcaOrder } from "@galacticcouncil/sdk-next/build/types/sor"
import { Box, Summary, SummaryRowValue } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { HealthFactorResult } from "@/api/aave"
import { useDisplayAssetsPrice } from "@/components/AssetPrice"
import { SwapSummaryRow } from "@/modules/trade/swap/components/SwapSummaryRow"
import { DcaOrderInfoSkeleton } from "@/modules/trade/swap/sections/DCA/DcaOrderInfoSkeleton"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"
import { useEstimateFee } from "@/modules/transactions/hooks/useEstimateFee"
import { AnyTransaction } from "@/modules/transactions/types"
import { useAssets } from "@/providers/assetsProvider"
import { scaleHuman } from "@/utils/formatting"

type Props = {
  readonly order: TradeDcaOrder | undefined
  readonly orderTx: AnyTransaction | null | undefined
  readonly healthFactor: HealthFactorResult | undefined
  readonly isLoading: boolean
}

export const DcaOrderInfo: FC<Props> = ({
  order,
  orderTx,
  healthFactor,
  isLoading,
}) => {
  const { t } = useTranslation(["common", "trade"])
  const { getAsset } = useAssets()

  const buyAsset = order ? getAsset(order.assetOut) : undefined

  const tradeFee =
    order && buyAsset
      ? scaleHuman(order.tradeFee, buyAsset.decimals)
      : undefined

  const { data: transactionFee } = useEstimateFee(orderTx ?? null)
  const transactionCosts = transactionFee?.feeEstimate || "0"

  const [orderFeeDisplay] = useDisplayAssetsPrice([
    [buyAsset?.id ?? "0", tradeFee ?? "0"],
    [transactionFee?.feeAssetId ?? "", transactionCosts],
  ])

  if (isLoading) {
    return (
      <>
        <SwapSectionSeparator />
        <DcaOrderInfoSkeleton />
      </>
    )
  }

  if (!order || !buyAsset) {
    return null
  }

  return (
    <>
      <SwapSectionSeparator />
      <Box pb={20}>
        <Summary separator={<SwapSectionSeparator />}>
          {healthFactor?.isSignificantChange && (
            <SwapSummaryRow
              label={t("healthFactor")}
              content={
                <HealthFactorChange
                  healthFactor={healthFactor.current}
                  futureHealthFactor={healthFactor.future}
                />
              }
            />
          )}
          <SwapSummaryRow
            label={t("trade:dca.summary.orderFee")}
            content={
              <SummaryRowValue fw={500} fs="p4" lh={1.2}>
                {orderFeeDisplay}
              </SummaryRowValue>
            }
            tooltip={t("trade:dca.summary.orderFee.tooltip")}
          />
        </Summary>
      </Box>
    </>
  )
}

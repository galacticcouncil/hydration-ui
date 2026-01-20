import { formatPascalCaseToSentence } from "@galacticcouncil/utils"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { decodePjsErrorQuery } from "@/api/errors"
import { TransactionItemMobile } from "@/components/TransactionItem/TransactionItemMobile"
import { TransactionStatusVariant } from "@/components/TransactionItem/TransactionStatus.styled"
import { PastExecutionData } from "@/modules/trade/orders/PastExecutions/usePastExecutionsData"
import { TAsset } from "@/providers/assetsProvider"

type Props = {
  readonly assetIn: TAsset
  readonly assetOut: TAsset
  readonly execution: PastExecutionData
}

export const PastExecutionItem: FC<Props> = ({
  assetIn,
  assetOut,
  execution,
}) => {
  const { t } = useTranslation()
  const { data: decodedError } = useQuery(
    decodePjsErrorQuery(execution.errorState),
  )

  const statusProps =
    execution.status === TransactionStatusVariant.Success
      ? {
          status: execution.status,
          sent: t("currency", {
            value: Big(execution.amountIn).div(execution.amountOut).toString(),
            symbol: assetIn.symbol,
          }),
          received: t("currency", {
            value: execution.amountOut,
            symbol: assetOut.symbol,
          }),
        }
      : { status: execution.status }

  return (
    <TransactionItemMobile
      sx={{ px: 0 }}
      timestamp={execution.timestamp}
      link={execution.link}
      message={
        decodedError?.error
          ? formatPascalCaseToSentence(decodedError.error)
          : undefined
      }
      {...statusProps}
    />
  )
}

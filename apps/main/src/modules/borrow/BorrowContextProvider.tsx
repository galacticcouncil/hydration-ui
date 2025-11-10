import { MoneyMarketProvider } from "@galacticcouncil/money-market/components"
import {
  FormatterFn,
  MoneyMarketTxFn,
} from "@galacticcouncil/money-market/types"
import { TFunction } from "i18next"
import { PropsWithChildren, useCallback } from "react"
import { useTranslation } from "react-i18next"

import { ApyProvider } from "@/modules/borrow/context/ApyContext"
import { useExternalApyData } from "@/modules/borrow/hooks/useExternalApyData"
import { useFormatReserve } from "@/modules/borrow/hooks/useFormatReserve"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTransactionsStore } from "@/states/transactions"

const createFormatterFn =
  (t: TFunction, type: "currency" | "number" | "percent"): FormatterFn =>
  (value, options) =>
    t(type, { value, ...options })

export const BorrowContextProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const { t } = useTranslation(["common"])
  const { createTransaction } = useTransactionsStore()
  const { evm, dataEnv } = useRpcProvider()

  const createTx = useCallback<MoneyMarketTxFn>(
    (tx, options) => createTransaction(tx, options),
    [createTransaction],
  )

  return (
    <ApyProvider>
      <MoneyMarketProvider
        env={dataEnv}
        provider={evm.transport}
        onCreateTransaction={createTx}
        formatCurrency={createFormatterFn(t, "currency")}
        formatNumber={createFormatterFn(t, "number")}
        formatPercent={createFormatterFn(t, "percent")}
        formatReserve={useFormatReserve()}
        externalApyData={useExternalApyData()}
      >
        {children}
      </MoneyMarketProvider>
    </ApyProvider>
  )
}

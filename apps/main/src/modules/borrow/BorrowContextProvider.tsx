import { MoneyMarketProvider } from "@galacticcouncil/money-market/components"
import {
  FormatterFn,
  MoneyMarketTxFn,
} from "@galacticcouncil/money-market/types"
import { TFunction } from "i18next"
import { PropsWithChildren, useCallback } from "react"
import { useTranslation } from "react-i18next"

import { useSquidClient } from "@/api/provider"
import { ApyProvider } from "@/modules/borrow/context/ApyContext"
import { useExternalApyData } from "@/modules/borrow/hooks/useExternalApyData"
import { useFormatReserve } from "@/modules/borrow/hooks/useFormatReserve"
import { useCreateBatchTx } from "@/modules/transactions/hooks/useBatchTx"
import { useMaxBalance } from "@/modules/transactions/hooks/useMaxBalance"
import { transformEvmCallToPapiTx } from "@/modules/transactions/utils/tx"
import { useAssets } from "@/providers/assetsProvider"
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
  const createBatchTx = useCreateBatchTx()
  const { evm, dataEnv, papi } = useRpcProvider()
  const squidClient = useSquidClient()
  const { getRelatedAToken } = useAssets()

  const createTx = useCallback<MoneyMarketTxFn>(
    ({ tx, toasts }, options, withExtraGas) => {
      const invalidateQueries = [["borrow"]]
      if (Array.isArray(tx)) {
        createBatchTx({
          txs: tx.map((evmTx) => transformEvmCallToPapiTx(papi, evmTx)),
          transaction: {
            toasts,
            withExtraGas,
            invalidateQueries,
          },
          options,
        })
      } else {
        createTransaction({ tx, toasts, invalidateQueries }, options)
      }
    },
    [createTransaction, createBatchTx, papi],
  )

  const getRelatedATokenId = useCallback(
    (id: string) => getRelatedAToken(id)?.id,
    [getRelatedAToken],
  )

  return (
    <ApyProvider>
      <MoneyMarketProvider
        env={dataEnv}
        provider={evm.transport}
        squidClient={squidClient}
        onCreateTransaction={createTx}
        useMaxBalance={useMaxBalance}
        formatCurrency={createFormatterFn(t, "currency")}
        formatNumber={createFormatterFn(t, "number")}
        formatPercent={createFormatterFn(t, "percent")}
        formatReserve={useFormatReserve()}
        externalApyData={useExternalApyData()}
        getRelatedATokenId={getRelatedATokenId}
      >
        {children}
      </MoneyMarketProvider>
    </ApyProvider>
  )
}

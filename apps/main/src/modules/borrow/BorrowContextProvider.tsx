import { MoneyMarketProvider } from "@galacticcouncil/money-market/components"
import {
  FormatterFn,
  MoneyMarketTxFn,
} from "@galacticcouncil/money-market/types"
import {
  AaveV3HydrationMainnet,
  AaveV3HydrationTestnet,
} from "@galacticcouncil/money-market/ui-config"
import { Modal } from "@galacticcouncil/ui/components"
import { TFunction } from "i18next"
import { PropsWithChildren, useCallback, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { prop } from "remeda"

import { useSquidClient } from "@/api/provider"
import { ApyProvider } from "@/modules/borrow/context/ApyContext"
import { useExternalApyData } from "@/modules/borrow/hooks/useExternalApyData"
import { useFormatReserve } from "@/modules/borrow/hooks/useFormatReserve"
import { createSwapRateProvider } from "@/modules/borrow/swap/createSwapRateProvider"
import { SwapSettingsModal } from "@/modules/trade/swap/components/SettingsModal/SwapSettings/SwapSettingsModal"
import { useCreateBatchTx } from "@/modules/transactions/hooks/useBatchTx"
import { transformEvmCallToPapiTx } from "@/modules/transactions/utils/tx"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useDisplayAssetStore } from "@/states/displayAsset"
import { useTradeSettings } from "@/states/tradeSettings"
import { useTransactionsStore } from "@/states/transactions"

const createFormatterFn =
  (t: TFunction, type: "currency" | "number" | "percent"): FormatterFn =>
  (value, options) =>
    t(type, { value, ...options })

export const BorrowContextProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const { t } = useTranslation(["common"])
  const [isSlippageModalOpen, setSlippageModalOpen] = useState(false)
  const swapSlippage = useTradeSettings((s) => s.swap.single.swapSlippage)
  const { createTransaction } = useTransactionsStore()
  const createBatchTx = useCreateBatchTx()
  const { evm, dataEnv, papi, sdk } = useRpcProvider()
  const squidClient = useSquidClient()
  const { getAsset, getRelatedAToken, isErc20AToken } = useAssets()
  const stableCoinId = useDisplayAssetStore(prop("stableCoinId"))

  const ghoTokenAddress =
    dataEnv === "mainnet"
      ? AaveV3HydrationMainnet.GHO_TOKEN_ADDRESS
      : AaveV3HydrationTestnet.GHO_TOKEN_ADDRESS

  const swapRateProvider = useMemo(
    () =>
      createSwapRateProvider({
        sdk,
        getAsset,
        getRelatedAToken,
        isErc20AToken,
        stableCoinId,
        createTransaction,
        ghoTokenAddress,
      }),
    [
      sdk,
      getAsset,
      getRelatedAToken,
      isErc20AToken,
      stableCoinId,
      createTransaction,
      ghoTokenAddress,
    ],
  )

  const createTx = useCallback<MoneyMarketTxFn>(
    ({ tx, toasts }, options, withExtraGas) => {
      if (Array.isArray(tx)) {
        createBatchTx({
          txs: tx.map((evmTx) => transformEvmCallToPapiTx(papi, evmTx)),
          transaction: {
            toasts,
            withExtraGas,
          },
          options,
        })
      } else {
        createTransaction({ tx, toasts }, options)
      }
    },
    [createTransaction, createBatchTx, papi],
  )

  return (
    <ApyProvider>
      <MoneyMarketProvider
        env={dataEnv}
        provider={evm.transport}
        squidClient={squidClient}
        onCreateTransaction={createTx}
        formatCurrency={createFormatterFn(t, "currency")}
        formatNumber={createFormatterFn(t, "number")}
        formatPercent={createFormatterFn(t, "percent")}
        formatReserve={useFormatReserve()}
        externalApyData={useExternalApyData()}
        swapSlippage={swapSlippage}
        onSwapModalOpenChange={setSlippageModalOpen}
        swapRateProvider={swapRateProvider}
      >
        {children}
        <Modal
          variant="popup"
          open={isSlippageModalOpen}
          onOpenChange={setSlippageModalOpen}
        >
          <SwapSettingsModal />
        </Modal>
      </MoneyMarketProvider>
    </ApyProvider>
  )
}

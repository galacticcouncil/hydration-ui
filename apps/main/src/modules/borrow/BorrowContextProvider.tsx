import { MoneyMarketProvider } from "@galacticcouncil/money-market/components"
import {
  FormatterFn,
  MoneyMarketTxFn,
} from "@galacticcouncil/money-market/types"
import {
  AaveV3HydrationMainnet,
  AaveV3HydrationTestnet,
} from "@galacticcouncil/money-market/ui-config"
import { CustomMarket } from "@galacticcouncil/money-market/utils"
import { Modal } from "@galacticcouncil/ui/components"
import { useSearch } from "@tanstack/react-router"
import { TFunction } from "i18next"
import { PropsWithChildren, useCallback, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { prop } from "remeda"

import { TRANSFERABLE_ATOKEN_BALANCE_QUERY_KEY } from "@/api/aave"
import { neckworkClient } from "@/api/neckwork"
import { TDataEnv } from "@/config/rpc"
import { ApyProvider } from "@/modules/borrow/context/ApyContext"
import { useExternalApyData } from "@/modules/borrow/hooks/useExternalApyData"
import { useFormatReserve } from "@/modules/borrow/hooks/useFormatReserve"
import { useMoneyMarketPostTxRefresh } from "@/modules/borrow/hooks/useMoneyMarketPostTxRefresh"
import { createSwapRateProvider } from "@/modules/borrow/swap/createSwapRateProvider"
import { SwapSettingsModal } from "@/modules/trade/swap/components/SettingsModal/SwapSettings/SwapSettingsModal"
import { useCreateBatchTx } from "@/modules/transactions/hooks/useBatchTx"
import { useMaxBalance } from "@/modules/transactions/hooks/useMaxBalance"
import { transformEvmCallToPapiTx } from "@/modules/transactions/utils/tx"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useDisplayAssetStore } from "@/states/displayAsset"
import { useTradeSettings } from "@/states/tradeSettings"
import { useTransactionsStore } from "@/states/transactions"

const defaultMarketByEnv: Record<TDataEnv, CustomMarket> = {
  mainnet: CustomMarket.hydration_v3,
  testnet: CustomMarket.hydration_testnet_v3,
}

const createFormatterFn =
  (t: TFunction, type: "currency" | "number" | "percent"): FormatterFn =>
  (value, options) =>
    t(type, { value, ...options })

const MoneyMarketPostTxRefresh = () => {
  useMoneyMarketPostTxRefresh()
  return null
}

export const BorrowContextProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const { t } = useTranslation(["common"])
  const [isSlippageModalOpen, setSlippageModalOpen] = useState(false)
  const swapSlippage = useTradeSettings((s) => s.swap.single.swapSlippage)
  const { createTransaction } = useTransactionsStore()
  const createBatchTx = useCreateBatchTx()
  const { evm, dataEnv, papi, sdk } = useRpcProvider()
  const { getAsset, getRelatedAToken, isErc20AToken } = useAssets()
  const { market } = useSearch({ from: "/borrow" })

  const selectedMarket = market || defaultMarketByEnv[dataEnv]
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
    ({ tx, toasts, activity }, options, withExtraGas) => {
      const invalidateQueries = [
        ["borrow"],
        [...TRANSFERABLE_ATOKEN_BALANCE_QUERY_KEY],
      ]
      if (Array.isArray(tx)) {
        createBatchTx({
          txs: tx.map((evmTx) => transformEvmCallToPapiTx(papi, evmTx)),
          transaction: {
            toasts,
            withExtraGas,
            invalidateQueries,
            activity,
          },
          options,
        })
      } else {
        createTransaction({ tx, toasts, invalidateQueries, activity }, options)
      }
    },
    [createTransaction, createBatchTx, papi],
  )

  const getRelatedATokenId = useCallback(
    (id: string) => getRelatedAToken(id)?.id,
    [getRelatedAToken],
  )

  // Stable identities: these land in context values that gate every money
  // market re-render, so re-allocating them per render invalidates the world.
  const formatCurrency = useMemo(() => createFormatterFn(t, "currency"), [t])
  const formatNumber = useMemo(() => createFormatterFn(t, "number"), [t])
  const formatPercent = useMemo(() => createFormatterFn(t, "percent"), [t])
  const formatReserve = useFormatReserve()
  const externalApyData = useExternalApyData()

  return (
    <ApyProvider>
      <MoneyMarketProvider
        market={selectedMarket}
        provider={evm.transport}
        neckwork={neckworkClient}
        onCreateTransaction={createTx}
        useMaxBalance={useMaxBalance}
        formatCurrency={formatCurrency}
        formatNumber={formatNumber}
        formatPercent={formatPercent}
        formatReserve={formatReserve}
        externalApyData={externalApyData}
        getRelatedATokenId={getRelatedATokenId}
        swapSlippage={swapSlippage}
        onSwapModalOpenChange={setSlippageModalOpen}
        swapRateProvider={swapRateProvider}
      >
        <MoneyMarketPostTxRefresh />
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

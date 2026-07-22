import { ProtocolAction } from "@aave/contract-helpers"
import { safeConvertSS58toH160 } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQueryClient } from "@tanstack/react-query"
import { PopulatedTransaction } from "ethers"
import React, { ReactElement, useCallback, useEffect } from "react"

import { useBackgroundDataProvider } from "@/hooks/app-data-provider/BackgroundDataProvider"
import { Web3Context } from "@/libs/hooks/useWeb3Context"
import { useRootStore } from "@/store/root"
import { ExtendedEvmCall, MoneyMarketTxFn, ToastsConfig } from "@/types"
import { queryKeysFactory } from "@/ui-config/queries"
import { convertPopulatedTransactionToEvmCall } from "@/utils/convertTx"

export type ERC20TokenType = {
  address: string
  symbol: string
  decimals: number
  image?: string
  aToken?: boolean
}

type SendTxFn = (
  txData: PopulatedTransaction,
  toasts: ToastsConfig,
  action?: ProtocolAction,
) => Promise<void>

type SendTxsFn = (
  txs: { txData: PopulatedTransaction; action?: ProtocolAction }[],
  toasts: ToastsConfig,
  withExtraGas?: boolean,
) => Promise<void>

export type Web3Data = {
  currentAccount: string
  sendTx: SendTxFn
  sendTxs: SendTxsFn
}

const convertTx = convertPopulatedTransactionToEvmCall

export const Web3ContextProvider: React.FC<{
  children: ReactElement
  onCreateTransaction: MoneyMarketTxFn
}> = ({ onCreateTransaction, children }) => {
  const queryClient = useQueryClient()
  const { account } = useAccount()

  const { refetchPoolData, refetchIncentiveData, refetchGhoData } =
    useBackgroundDataProvider()

  const accountAddress = account?.address ?? ""
  const address = safeConvertSS58toH160(accountAddress)

  const [setAccount] = useRootStore((store) => [store.setAccount])

  const sendTx = useCallback<SendTxFn>(
    async (tx, toasts, action) => {
      const evmCall: ExtendedEvmCall = convertTx(tx, action)

      onCreateTransaction(
        {
          tx: evmCall,
          toasts,
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeysFactory.pool })
            refetchPoolData?.()
            refetchIncentiveData?.()
            refetchGhoData?.()
          },
        },
      )
    },
    [
      onCreateTransaction,
      queryClient,
      refetchGhoData,
      refetchIncentiveData,
      refetchPoolData,
    ],
  )
  const sendTxs = useCallback<SendTxsFn>(
    async (txs, toasts, withExtraGas) => {
      const evmCalls: ExtendedEvmCall[] = txs.map((tx) =>
        convertTx(tx.txData, tx.action),
      )

      onCreateTransaction(
        {
          tx: evmCalls,
          toasts,
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeysFactory.pool })
            refetchPoolData?.()
            refetchIncentiveData?.()
            refetchGhoData?.()
          },
        },
        withExtraGas,
      )
    },
    [
      onCreateTransaction,
      queryClient,
      refetchGhoData,
      refetchIncentiveData,
      refetchPoolData,
    ],
  )

  useEffect(() => {
    setAccount(address?.toLowerCase() || "")
  }, [address, setAccount])

  return (
    <Web3Context.Provider
      value={{
        web3ProviderData: {
          sendTx,
          sendTxs,
          currentAccount: address?.toLowerCase() || "",
        },
      }}
    >
      {children}
    </Web3Context.Provider>
  )
}

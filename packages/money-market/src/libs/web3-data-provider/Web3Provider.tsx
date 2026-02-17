import { ProtocolAction } from "@aave/contract-helpers"
import { IAaveIncentivesControllerV2__factory } from "@aave/contract-helpers/src/incentive-controller-v2/typechain/IAaveIncentivesControllerV2__factory"
import { IPool__factory } from "@aave/contract-helpers/src/v3-pool-contract/typechain/IPool__factory"
import { HexString, safeConvertSS58toH160 } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { CallType } from "@galacticcouncil/xc-core"
import { useQueryClient } from "@tanstack/react-query"
import { PopulatedTransaction } from "ethers"
import React, { ReactElement, useCallback, useEffect } from "react"

import { useBackgroundDataProvider } from "@/hooks/app-data-provider/BackgroundDataProvider"
import { Web3Context } from "@/libs/hooks/useWeb3Context"
import { useRootStore } from "@/store/root"
import { ExtendedEvmCall, MoneyMarketTxFn, ToastsConfig } from "@/types"
import { queryKeysFactory } from "@/ui-config/queries"
import { getFunctionDefsFromAbi } from "@/utils/utils"

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

const getAbiMethodByProtocolAction = (action: ProtocolAction) => {
  switch (action) {
    case ProtocolAction.switchBorrowRateMode:
      return "swapBorrowRateMode"
    case ProtocolAction.setUsageAsCollateral:
      return "setUserUseReserveAsCollateral"
    case ProtocolAction.setEModeUsage:
      return "setUserEMode"
    default:
      return action
  }
}

const getTransactionAbi = (action?: ProtocolAction) => {
  if (!action) {
    return ""
  }

  const factory =
    action === ProtocolAction.claimRewards
      ? IAaveIncentivesControllerV2__factory
      : IPool__factory

  const abi = action
    ? getFunctionDefsFromAbi(factory.abi, getAbiMethodByProtocolAction(action))
    : undefined

  return abi ?? ""
}

const convertTx = (tx: PopulatedTransaction, action?: ProtocolAction) => {
  const abi = getTransactionAbi(action)

  const evmCall: ExtendedEvmCall = {
    data: tx.data ?? "",
    from: tx.from ?? "",
    to: tx.to as HexString,
    type: CallType.Evm,
    abi,
    gasLimit: tx.gasLimit ? BigInt(tx.gasLimit.toString()) : 0n,
    maxFeePerGas: tx.maxFeePerGas ? BigInt(tx.maxFeePerGas.toString()) : 0n,
    maxPriorityFeePerGas: tx.maxPriorityFeePerGas
      ? BigInt(tx.maxPriorityFeePerGas.toString())
      : 0n,
    dryRun: (() => {}) as ExtendedEvmCall["dryRun"],
  }

  return evmCall
}

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

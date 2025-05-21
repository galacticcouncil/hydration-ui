import { ProtocolAction } from "@aave/contract-helpers"
import { IAaveIncentivesControllerV2__factory } from "@aave/contract-helpers/src/incentive-controller-v2/typechain/IAaveIncentivesControllerV2__factory"
import { IPool__factory } from "@aave/contract-helpers/src/v3-pool-contract/typechain/IPool__factory"
import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers"
import { safeConvertSS58toH160 } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { CallType } from "@galacticcouncil/xcm-core"
import { useQueryClient } from "@tanstack/react-query"
import { useWeb3React } from "@web3-react/core"
import { PopulatedTransaction, providers } from "ethers"
import React, {
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"

import { useBackgroundDataProvider } from "@/hooks/app-data-provider/BackgroundDataProvider"
import { Web3Context } from "@/libs/hooks/useWeb3Context"
import { useRootStore } from "@/store/root"
import { ExtendedEvmCall, MoneyMarketTxFn } from "@/types"
import { queryKeysFactory } from "@/ui-config/queries"
import { getFunctionDefsFromAbi, hexToAscii } from "@/utils/utils"

export type ERC20TokenType = {
  address: string
  symbol: string
  decimals: number
  image?: string
  aToken?: boolean
}

export type Web3Data = {
  disconnectWallet: () => void
  currentAccount: string
  connected: boolean
  loading: boolean
  provider: JsonRpcProvider | undefined
  chainId: number
  getTxError: (txHash: string) => Promise<string>
  sendTx: (
    txData: PopulatedTransaction,
    action?: ProtocolAction,
  ) => Promise<void>
  error: Error | undefined
  switchNetworkError: Error | undefined
  setSwitchNetworkError: (err: Error | undefined) => void
  readOnlyModeAddress: string | undefined
  readOnlyMode: boolean
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

export const Web3ContextProvider: React.FC<{
  children: ReactElement
  onCreateTransaction: MoneyMarketTxFn
}> = ({ onCreateTransaction, children }) => {
  const queryClient = useQueryClient()
  const { account } = useAccount()

  const { error } = useWeb3React<providers.Web3Provider>()

  const { refetchPoolData, refetchIncentiveData, refetchGhoData } =
    useBackgroundDataProvider()

  const accountAddress = account?.address ?? ""

  const address = safeConvertSS58toH160(accountAddress)

  const chainId = 222222 //evm?.account?.chainId || null
  const active = false // !!account

  // const extension = wallet?.extension

  const provider = useMemo(() => {
    return undefined as Web3Provider | undefined
    /* if (isEvmWalletExtension(extension)) {
      return new Web3Provider(extension)
    } */
  }, [])

  const [loading, setLoading] = useState(false)
  const [readOnlyMode] = useState(false)
  const [switchNetworkError, setSwitchNetworkError] = useState<Error>()
  const [setAccount] = useRootStore((store) => [store.setAccount])
  const setAccountLoading = useRootStore((store) => store.setAccountLoading)
  const setWalletType = useRootStore((store) => store.setWalletType)

  const disconnectWallet = useCallback(async () => {
    // deactivate()
    setWalletType(undefined)
    setLoading(false)
    setSwitchNetworkError(undefined)
  }, [setWalletType])

  const sendTx = useCallback(
    async (tx: PopulatedTransaction, action?: ProtocolAction) => {
      const abi = getTransactionAbi(action)

      const evmCall: ExtendedEvmCall = {
        data: tx.data ?? "",
        from: tx.from ?? "",
        to: tx.to as `0x${string}`,
        type: CallType.Evm,
        abi,
        gasLimit: tx.gasLimit ? BigInt(tx.gasLimit.toString()) : 0n,
        maxFeePerGas: tx.maxFeePerGas ? BigInt(tx.maxFeePerGas.toString()) : 0n,
        maxPriorityFeePerGas: tx.maxPriorityFeePerGas
          ? BigInt(tx.maxPriorityFeePerGas.toString())
          : 0n,
        dryRun: (() => {}) as ExtendedEvmCall["dryRun"],
      }
      onCreateTransaction(evmCall, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: queryKeysFactory.pool })
          refetchPoolData?.()
          refetchIncentiveData?.()
          refetchGhoData?.()
        },
      })
    },
    [
      onCreateTransaction,
      queryClient,
      refetchGhoData,
      refetchIncentiveData,
      refetchPoolData,
    ],
  )

  const getTxError = async (txHash: string): Promise<string> => {
    if (provider) {
      const tx = await provider.getTransaction(txHash)
      // @ts-expect-error TODO: need think about "tx" type
      const code = await provider.call(tx, tx.blockNumber)
      const error = hexToAscii(code.substr(138))
      return error
    }
    throw new Error("Error getting transaction. Provider not found")
  }

  useEffect(() => {
    setAccount(address?.toLowerCase() || "")
  }, [address, setAccount])

  useEffect(() => {
    setAccountLoading(loading)
  }, [loading, setAccountLoading])

  return (
    <Web3Context.Provider
      value={{
        web3ProviderData: {
          disconnectWallet,
          provider,
          connected: active,
          loading,
          chainId: chainId || 1,
          getTxError,
          sendTx,
          currentAccount: address?.toLowerCase() || "",
          error,
          switchNetworkError,
          setSwitchNetworkError,
          readOnlyModeAddress: readOnlyMode
            ? address?.toLowerCase()
            : undefined,
          readOnlyMode,
        },
      }}
    >
      {children}
    </Web3Context.Provider>
  )
}

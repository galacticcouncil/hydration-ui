import { API_ETH_MOCK_ADDRESS, ProtocolAction } from "@aave/contract-helpers"
import { SignatureLike } from "@ethersproject/bytes"
import {
  JsonRpcProvider,
  TransactionRequest,
  TransactionResponse,
  Web3Provider,
} from "@ethersproject/providers"
import { useWeb3React } from "@web3-react/core"
import { constants, PopulatedTransaction, providers } from "ethers"
import React, {
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"
import { useRootStore } from "sections/lending/store/root"
import { getNetworkConfig } from "sections/lending/utils/marketsAndNetworksConfig"
import {
  getFunctionDefsFromAbi,
  hexToAscii,
} from "sections/lending/utils/utils"
import { useQueryClient } from "@tanstack/react-query"
import { useRpcProvider } from "providers/rpcProvider"
import { useBackgroundDataProvider } from "sections/lending/hooks/app-data-provider/BackgroundDataProvider"
import { Web3Context } from "sections/lending/libs/hooks/useWeb3Context"
import { queryKeysFactory } from "sections/lending/ui-config/queries"
import {
  useAccount,
  useEnableWallet,
  useEvmAccount,
  useWallet,
} from "sections/web3-connect/Web3Connect.utils"
import { ToastMessage, TransactionOptions, useStore } from "state/store"
import { H160, isEvmWalletExtension } from "utils/evm"
import { IPool__factory } from "@aave/contract-helpers/src/v3-pool-contract/typechain/IPool__factory"
import { IAaveIncentivesControllerV2__factory } from "@aave/contract-helpers/src/incentive-controller-v2/typechain/IAaveIncentivesControllerV2__factory"

import { createToastMessages } from "state/toasts"
import { useTranslation } from "react-i18next"
import { decodeEvmCall } from "sections/transaction/ReviewTransactionData.utils"
import { PoolReserve } from "sections/lending/store/poolSlice"
import { ExtendedProtocolAction } from "sections/lending/ui-config/protocolAction"
import { AAVE_EXTRA_GAS } from "utils/constants"
import BN from "bignumber.js"

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
  switchNetwork: (chainId: number) => Promise<void>
  getTxError: (txHash: string) => Promise<string>
  sendTx: (
    txData: PopulatedTransaction,
    action?: ProtocolAction | ExtendedProtocolAction,
    toasts?: ToastMessage,
  ) => Promise<TransactionResponse>
  addERC20Token: (args: ERC20TokenType) => Promise<boolean>
  signTxData: (unsignedData: string) => Promise<SignatureLike>
  error: Error | undefined
  switchNetworkError: Error | undefined
  setSwitchNetworkError: (err: Error | undefined) => void
  readOnlyModeAddress: string | undefined
  readOnlyMode: boolean
}

const getAbiMethodByProtocolAction = (
  action: ProtocolAction | ExtendedProtocolAction,
) => {
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

const getToastPropsByProtocolAction = (
  action: ProtocolAction | ExtendedProtocolAction,
  poolData: PoolReserve,
  tx: { data: `0x${string}` | TransactionRequest; abi: string },
) => {
  try {
    const call = decodeEvmCall(tx)!
    const asset = poolData?.reserves?.find(({ underlyingAsset }) => {
      return underlyingAsset.toLowerCase() === call.data.asset.toLowerCase()
    })

    if (!asset) return

    if (
      action === ProtocolAction.supply ||
      action === ProtocolAction.withdraw ||
      action === ProtocolAction.repay ||
      action === ProtocolAction.borrow
    ) {
      return {
        key: `lending.${action}.toast`,
        tOptions: {
          value:
            call.data.amount === constants.MaxUint256.toString()
              ? undefined
              : call.data.amount,
          symbol: asset.symbol,
          fixedPointScale: asset.decimals,
        },
        components: ["span.highlight"],
      }
    }

    if (action === ProtocolAction.setUsageAsCollateral) {
      return {
        key: `lending.collateral.${call?.data?.useAsCollateral ? "enable" : "disable"}.toast`,
        tOptions: {
          symbol: asset.symbol,
        },
        components: ["span.highlight"],
      }
    }
  } catch {}
}

const getTransactionMeta = (
  action?: ProtocolAction | ExtendedProtocolAction,
  tx?: PopulatedTransaction,
  poolData?: PoolReserve,
) => {
  if (!action) {
    return {
      abi: "",
      toasProps: undefined,
    }
  }

  const factory =
    action === ProtocolAction.claimRewards ||
    action === ExtendedProtocolAction.claimAllRewards
      ? IAaveIncentivesControllerV2__factory
      : IPool__factory

  const abi = action
    ? getFunctionDefsFromAbi(factory.abi, getAbiMethodByProtocolAction(action))
    : undefined

  const toastProps =
    action && poolData && tx && abi
      ? getToastPropsByProtocolAction(action, poolData, {
          data: tx,
          abi,
        })
      : undefined

  return {
    abi,
    toastProps,
  }
}

export const Web3ContextProvider: React.FC<{ children: ReactElement }> = ({
  children,
}) => {
  const { t } = useTranslation()
  const { api } = useRpcProvider()
  const { createTransaction } = useStore()
  const { account } = useAccount()
  const evm = useEvmAccount()
  const { wallet, type } = useWallet()
  const { disconnect: deactivate } = useEnableWallet(type)
  const { error } = useWeb3React<providers.Web3Provider>()
  const queryClient = useQueryClient()

  const { refetchPoolData, refetchIncentiveData, refetchGhoData, poolData } =
    useBackgroundDataProvider()

  const accountAddress = account?.address ?? ""

  const address = H160.fromAny(accountAddress)

  const chainId = evm?.account?.chainId || null
  const active = !!account

  const extension = wallet?.extension

  const provider = useMemo(() => {
    if (isEvmWalletExtension(extension)) {
      return new Web3Provider(extension)
    }
  }, [extension])

  const [loading, setLoading] = useState(false)
  const [readOnlyMode] = useState(false)
  const [switchNetworkError, setSwitchNetworkError] = useState<Error>()
  const [setAccount] = useRootStore((store) => [store.setAccount])
  const setAccountLoading = useRootStore((store) => store.setAccountLoading)
  const setWalletType = useRootStore((store) => store.setWalletType)

  const disconnectWallet = useCallback(async () => {
    deactivate()
    setWalletType(undefined)
    setLoading(false)
    setSwitchNetworkError(undefined)
  }, [deactivate, setWalletType])

  const sendTx = useCallback(
    async (
      txData: PopulatedTransaction,
      action?: ProtocolAction | ExtendedProtocolAction,
      toasts?: ToastMessage,
    ) => {
      const { abi, toastProps } = getTransactionMeta(action, txData, poolData)

      const toast = toasts
        ? toasts
        : toastProps
          ? createToastMessages(toastProps.key, {
              t,
              ...toastProps,
            })
          : undefined

      const txOptions: TransactionOptions = {
        toast,
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: queryKeysFactory.pool })
          refetchPoolData?.()
          refetchIncentiveData?.()
          refetchGhoData?.()
        },
      }

      if (!provider) {
        const tx = api.tx.evm.call(
          txData.from ?? "",
          txData.to ?? "",
          txData.data ?? "",
          "0",
          txData.gasLimit?.toString() ?? "0",
          txData.maxFeePerGas?.toString() ?? "0",
          txData.maxPriorityFeePerGas?.toString() ?? "0",
          null,
          [],
        )

        createTransaction(
          {
            tx,
            evmTx: {
              data: txData,
              abi,
            },
          },
          txOptions,
        )
        return {} as TransactionResponse
      }

      createTransaction(
        {
          evmTx: {
            data: {
              ...txData,
              gasLimit: BN(AAVE_EXTRA_GAS.toString())
                .plus(txData?.gasLimit?.toString() ?? "0")
                .toString(),
            },
            abi,
          },
        },
        txOptions,
      )

      return {} as TransactionResponse
    },
    [
      api,
      createTransaction,
      poolData,
      provider,
      queryClient,
      refetchGhoData,
      refetchIncentiveData,
      refetchPoolData,
      t,
    ],
  )

  // TODO: recheck that it works on all wallets
  const signTxData = async (unsignedData: string): Promise<SignatureLike> => {
    if (provider && account) {
      const signature: SignatureLike = await provider.send(
        "eth_signTypedData_v4",
        [account, unsignedData],
      )

      return signature
    }

    throw new Error("Error signing transaction. Provider not found")
  }

  const switchNetwork = async (newChainId: number) => {
    if (provider) {
      try {
        await provider.send("wallet_switchEthereumChain", [
          { chainId: `0x${newChainId.toString(16)}` },
        ])
        setSwitchNetworkError(undefined)
      } catch (switchError: any) {
        const networkInfo = getNetworkConfig(newChainId)
        if (switchError.code === 4902) {
          try {
            try {
              await provider.send("wallet_addEthereumChain", [
                {
                  chainId: `0x${newChainId.toString(16)}`,
                  chainName: networkInfo.name,
                  nativeCurrency: {
                    symbol: networkInfo.baseAssetSymbol,
                    decimals: networkInfo.baseAssetDecimals,
                  },
                  rpcUrls: [
                    ...networkInfo.publicJsonRPCUrl,
                    networkInfo.publicJsonRPCWSUrl,
                  ],
                  blockExplorerUrls: [networkInfo.explorerLink],
                },
              ])
            } catch (error: any) {
              if (error.code !== 4001) {
                throw error
              }
            }
            setSwitchNetworkError(undefined)
          } catch (addError: any) {
            setSwitchNetworkError(addError)
          }
        } else if (switchError.code === 4001) {
          setSwitchNetworkError(undefined)
        } else {
          setSwitchNetworkError(switchError)
        }
      }
    }
  }

  const getTxError = async (txHash: string): Promise<string> => {
    if (provider) {
      const tx = await provider.getTransaction(txHash)
      // @ts-ignore TODO: need think about "tx" type
      const code = await provider.call(tx, tx.blockNumber)
      const error = hexToAscii(code.substr(138))
      return error
    }
    throw new Error("Error getting transaction. Provider not found")
  }

  const addERC20Token = async ({
    address,
    symbol,
    decimals,
    image,
  }: ERC20TokenType): Promise<boolean> => {
    // using window.ethereum as looks like its only supported for metamask
    // and didn't manage to make the call with ethersjs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const injectedProvider = (window as any).ethereum
    if (provider && account && window && injectedProvider) {
      if (address.toLowerCase() !== API_ETH_MOCK_ADDRESS.toLowerCase()) {
        await injectedProvider.request({
          method: "wallet_watchAsset",
          params: {
            type: "ERC20",
            options: {
              address,
              symbol,
              decimals,
              image,
            },
          },
        })

        return true
      }
    }
    return false
  }

  // inject account into zustand as long as aave itnerface is using old web3 providers
  useEffect(() => {
    setAccount(address?.toLowerCase())
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
          switchNetwork,
          getTxError,
          sendTx,
          signTxData,
          currentAccount: address?.toLowerCase() || "",
          addERC20Token,
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

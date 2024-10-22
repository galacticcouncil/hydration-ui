import { API_ETH_MOCK_ADDRESS } from "@aave/contract-helpers"
import { SignatureLike } from "@ethersproject/bytes"
import {
  JsonRpcProvider,
  TransactionResponse,
  Web3Provider,
} from "@ethersproject/providers"
import { useWeb3React } from "@web3-react/core"
import { PopulatedTransaction, providers } from "ethers"
import React, {
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"
import { useRootStore } from "sections/lending/store/root"
import { getNetworkConfig } from "sections/lending/utils/marketsAndNetworksConfig"
import { hexToAscii } from "sections/lending/utils/utils"

// import { isLedgerDappBrowserProvider } from 'web3-ledgerhq-frame-connector';
import { useQueryClient } from "@tanstack/react-query"
import { useRpcProvider } from "providers/rpcProvider"
import { useBackgroundDataProvider } from "sections/lending/hooks/app-data-provider/BackgroundDataProvider"
import { Web3Context } from "sections/lending/libs/hooks/useWeb3Context"
import { queryKeysFactory } from "sections/lending/ui-config/queries"
import {
  useEnableWallet,
  useEvmAccount,
  useWallet,
} from "sections/web3-connect/Web3Connect.utils"
import { useStore } from "state/store"
import { isEvmWalletExtension } from "utils/evm"

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
    abi?: string,
  ) => Promise<TransactionResponse>
  addERC20Token: (args: ERC20TokenType) => Promise<boolean>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signTxData: (unsignedData: string) => Promise<SignatureLike>
  error: Error | undefined
  switchNetworkError: Error | undefined
  setSwitchNetworkError: (err: Error | undefined) => void
  readOnlyModeAddress: string | undefined
  readOnlyMode: boolean
}

export const Web3ContextProvider: React.FC<{ children: ReactElement }> = ({
  children,
}) => {
  const { api } = useRpcProvider()
  const { createTransaction } = useStore()
  const evmAccount = useEvmAccount()
  const { wallet, type } = useWallet()
  const { disconnect: deactivate } = useEnableWallet(type)
  const { error } = useWeb3React<providers.Web3Provider>()
  const queryClient = useQueryClient()

  const { refetchPoolData, refetchIncentiveData, refetchGhoData } =
    useBackgroundDataProvider()

  const account = evmAccount?.account?.address || ""
  const chainId = evmAccount?.account?.chainId || null
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
  const [setAccount] = useRootStore((store) => [
    store.setAccount,
    store.currentChainId,
  ])
  const setAccountLoading = useRootStore((store) => store.setAccountLoading)
  const setWalletType = useRootStore((store) => store.setWalletType)

  const disconnectWallet = useCallback(async () => {
    deactivate()
    setWalletType(undefined)
    setLoading(false)
    setSwitchNetworkError(undefined)
  }, [deactivate, setWalletType])

  const sendTx = useCallback(
    async (txData: PopulatedTransaction, abi?: string) => {
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
          {
            onSuccess: () => {
              queryClient.invalidateQueries({ queryKey: queryKeysFactory.pool })
              refetchPoolData && refetchPoolData()
              refetchIncentiveData && refetchIncentiveData()
              refetchGhoData && refetchGhoData()
            },
          },
        )
        return {} as TransactionResponse
      }

      createTransaction(
        {
          evmTx: {
            data: txData,
            abi,
          },
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeysFactory.pool })
            refetchPoolData && refetchPoolData()
            refetchIncentiveData && refetchIncentiveData()
            refetchGhoData && refetchGhoData()
          },
        },
      )

      return {} as TransactionResponse

      /* const signer = provider.getSigner(txData.from)
      const txResponse: TransactionResponse = await signer.sendTransaction({
        ...txData,
        value: txData.value ? BigNumber.from(txData.value) : undefined,
      })
      return txResponse */
    },
    [
      api,
      createTransaction,
      provider,
      queryClient,
      refetchGhoData,
      refetchIncentiveData,
      refetchPoolData,
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
    setAccount(account?.toLowerCase())
  }, [account, setAccount])

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
          currentAccount: account?.toLowerCase() || "",
          addERC20Token,
          error,
          switchNetworkError,
          setSwitchNetworkError,
          readOnlyModeAddress: readOnlyMode
            ? account?.toLowerCase()
            : undefined,
          readOnlyMode,
        },
      }}
    >
      {children}
    </Web3Context.Provider>
  )
}

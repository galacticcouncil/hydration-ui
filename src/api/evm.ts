import { ApiPromise } from "@polkadot/api"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRpcProvider } from "providers/rpcProvider"
import { QUERY_KEYS } from "utils/queryKeys"
import { DISPATCH_ADDRESS, H160, isEvmAccount, isEvmAddress } from "utils/evm"
import BigNumber from "bignumber.js"
import { undefinedNoop } from "utils/helpers"
import { TransactionOptions, useStore } from "state/store"
import { createToastMessages } from "state/toasts"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { useTranslation } from "react-i18next"
import { PopulatedTransaction } from "@ethersproject/contracts"
import { TransactionRequest } from "@ethersproject/providers"
import { SubmittableExtrinsic } from "@polkadot/api/types"
import { useCallback } from "react"

const getIsEvmAccountBound = (api: ApiPromise, address: string) => {
  return async () => {
    const result = await api.rpc.state.call(
      "EvmAccountsApi_bound_account_id",
      address,
    )

    const isBound = !result.isEmpty
    return isBound
  }
}

export function useIsEvmAccountBound(address: string) {
  const { api, isLoaded } = useRpcProvider()

  return useQuery({
    enabled: isLoaded && isEvmAddress(address),
    queryKey: QUERY_KEYS.evmAccountBinding(address),
    queryFn: getIsEvmAccountBound(api, address),
  })
}

const getEvmPaymentFee =
  (api: ApiPromise, txHex: string, address: string) => async () => {
    const [gasResult, gasPriceResult] = await Promise.all([
      api.rpc.eth.estimateGas({
        from: address,
        data: txHex,
        to: DISPATCH_ADDRESS,
      }),
      api.rpc.eth.gasPrice(),
    ])

    const gas = new BigNumber(gasResult.toString())
    const gasPrice = new BigNumber(gasPriceResult.toString())

    return gas.multipliedBy(gasPrice)
  }

export const useEvmPaymentFee = (txHex: string, address?: string) => {
  const { api } = useRpcProvider()

  const evmAddress =
    address && isEvmAccount(address)
      ? H160.fromAccount(address)
      : address && isEvmAddress(address)
        ? address
        : undefined

  const enabled = !!evmAddress && !!txHex

  return useQuery(
    QUERY_KEYS.evmPaymentFee(txHex, address),
    enabled ? getEvmPaymentFee(api, txHex, evmAddress) : undefinedNoop,
    {
      enabled,
    },
  )
}

export const useEvmGasPrice = () => {
  const { isLoaded, evm } = useRpcProvider()

  return useQuery({
    enabled: isLoaded,
    queryKey: QUERY_KEYS.evmGasPrice(),
    queryFn: async () => {
      const gasPrice = await evm.getGasPrice()
      return gasPrice.toString()
    },
  })
}

export const useEvmAccountBind = (options: TransactionOptions = {}) => {
  const { t } = useTranslation()
  const { account } = useAccount()
  const { api } = useRpcProvider()
  const { createTransaction } = useStore()
  const queryClient = useQueryClient()

  return useMutation(() => {
    return createTransaction(
      {
        tx: api.tx.evmAccounts.bindEvmAddress(),
      },
      {
        toast: createToastMessages("lending.bind.toast", {
          t,
        }),
        onSuccess: (...args) => {
          options.onSuccess?.(...args)
          if (account) {
            queryClient.refetchQueries(
              QUERY_KEYS.evmAccountBinding(H160.fromSS58(account.address)),
            )
          }
        },
        ...options,
      },
    )
  })
}

export const useTransformEvmTxToExtrinsic = () => {
  const { api } = useRpcProvider()

  return useCallback(
    (
      tx: PopulatedTransaction | TransactionRequest,
    ): SubmittableExtrinsic<"promise"> =>
      api.tx.evm.call(
        tx.from ?? "",
        tx.to ?? "",
        tx.data?.toString() ?? "",
        "0",
        tx.gasLimit?.toString() ?? "0",
        tx.maxFeePerGas?.toString() ?? "0",
        tx.maxPriorityFeePerGas?.toString() ?? "0",
        null,
        [],
      ),
    [api],
  )
}

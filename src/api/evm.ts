import { ApiPromise } from "@polkadot/api"
import { useQuery } from "@tanstack/react-query"
import { useRpcProvider } from "providers/rpcProvider"
import { DISPATCH_ADDRESS, H160, isEvmAccount, isEvmAddress } from "utils/evm"
import BigNumber from "bignumber.js"
import { undefinedNoop } from "utils/helpers"
import { QUERY_KEYS } from "utils/queryKeys"

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

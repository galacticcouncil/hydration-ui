import { TransactionRequest } from "@ethersproject/providers"
import { useQuery } from "@tanstack/react-query"
import { useEvmGasPrice } from "api/evm"
import { useRpcProvider } from "providers/rpcProvider"
import { BN_NAN } from "utils/constants"
import { QUERY_KEYS } from "utils/queryKeys"
import BN from "bignumber.js"
import { NATIVE_EVM_ASSET_DECIMALS } from "utils/evm"

export const useEvmTxFee = (tx: TransactionRequest) => {
  const { evm } = useRpcProvider()
  const { data: gasPrice, isLoading: isGasPriceLoading } = useEvmGasPrice()
  return useQuery(
    QUERY_KEYS.evmPaymentFee(tx.data?.toString() ?? "", tx.from),
    async () => {
      if (gasPrice) {
        const gas = await evm.estimateGas(tx)
        return BN(gas.toString())
          .multipliedBy(gasPrice)
          .shiftedBy(-NATIVE_EVM_ASSET_DECIMALS)
      }

      return BN_NAN
    },
    {
      enabled: !isGasPriceLoading && !!tx,
    },
  )
}

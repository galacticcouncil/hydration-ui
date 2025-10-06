import { TransactionRequest } from "@ethersproject/providers"
import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import { useEvmGasPrice, useTransformEvmTxToExtrinsic } from "api/evm"
import { BN_NAN } from "utils/constants"
import { QUERY_KEYS } from "utils/queryKeys"
import BN from "bignumber.js"
import { GAS_TO_WEIGHT, NATIVE_EVM_ASSET_DECIMALS } from "utils/evm"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"

export const useEvmTxFee = (
  tx: TransactionRequest,
  options?: UseQueryOptions<BN>,
) => {
  const { account } = useAccount()
  const { data: gasPrice, isLoading: isGasPriceLoading } = useEvmGasPrice()
  const transformTx = useTransformEvmTxToExtrinsic()
  return useQuery({
    queryKey: QUERY_KEYS.evmPaymentFee(tx.data?.toString() ?? "", tx.from),
    queryFn: async () => {
      if (!gasPrice || !account) return BN_NAN

      if (tx?.gasLimit) {
        return BN(tx.gasLimit.toString())
          .multipliedBy(gasPrice)
          .shiftedBy(-NATIVE_EVM_ASSET_DECIMALS)
      }

      const extrinsic = transformTx(tx)
      const paymentInfo = await extrinsic.paymentInfo(account.address)
      const weight = paymentInfo.weight.refTime.toString()
      const gasLimit = BN(weight).div(GAS_TO_WEIGHT).decimalPlaces(0)

      return gasLimit
        .multipliedBy(gasPrice)
        .shiftedBy(-NATIVE_EVM_ASSET_DECIMALS)
    },
    ...options,
    enabled: (options?.enabled ?? true) && !isGasPriceLoading && !!tx,
  })
}

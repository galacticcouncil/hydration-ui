import { TransactionRequest } from "@ethersproject/providers"
import { useQuery } from "@tanstack/react-query"
import BigNumber from "bignumber.js"
import { EthereumSigner } from "sections/web3-connect/signer/EthereumSigner"
import { useWallet } from "sections/web3-connect/Web3Connect.utils"
import { BN_NAN } from "utils/constants"
import { QUERY_KEYS } from "utils/queryKeys"

export const useEvmTxFee = (tx: TransactionRequest) => {
  const { wallet } = useWallet()
  return useQuery(
    QUERY_KEYS.evmPaymentFee(tx.data?.toString() ?? "", tx.from),
    async () => {
      if (wallet?.signer instanceof EthereumSigner) {
        const { gas, maxFeePerGas, maxPriorityFeePerGas } =
          await wallet.signer.getGasValues(tx)
        const estimatedGas = new BigNumber(gas.toString())
        const baseFee = new BigNumber(maxFeePerGas?.toString() ?? "0")
        const effectiveGasPrice = baseFee.plus(maxPriorityFeePerGas.toString())
        return estimatedGas.multipliedBy(effectiveGasPrice).shiftedBy(-18)
      }

      return BN_NAN
    },
    {
      enabled: wallet?.signer instanceof EthereumSigner && !!tx,
    },
  )
}

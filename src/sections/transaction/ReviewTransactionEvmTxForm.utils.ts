import { TransactionRequest } from "@ethersproject/providers"
import { useQuery } from "@tanstack/react-query"
import BigNumber from "bignumber.js"
import { EthereumSigner } from "sections/web3-connect/signer/EthereumSigner"
import { useWallet } from "sections/web3-connect/Web3Connect.utils"
import { BN_NAN } from "utils/constants"

export const useEvmTxFee = (tx: TransactionRequest) => {
  const { wallet } = useWallet()
  return useQuery(
    ["evm-fee", tx.data?.toString()],
    async () => {
      if (wallet?.signer instanceof EthereumSigner) {
        const [gas] = await wallet.signer.getGasValues(tx)
        const feeData = await wallet.signer.getFeeData()
        const estimatedGas = new BigNumber(gas.toString())
        const baseFee = new BigNumber(feeData?.maxFeePerGas?.toString() ?? "0")
        const maxPriorityFeePerGas = new BigNumber(
          feeData?.maxPriorityFeePerGas?.toString() ?? "0",
        )

        const effectiveGasPrice = baseFee.plus(maxPriorityFeePerGas)
        return estimatedGas.multipliedBy(effectiveGasPrice).shiftedBy(-18)
      }

      return BN_NAN
    },
    {
      enabled: wallet?.signer instanceof EthereumSigner && !!tx,
    },
  )
}

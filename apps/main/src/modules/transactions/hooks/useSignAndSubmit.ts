import {
  isEthereumSigner,
  isPolkadotSigner,
  useWallet,
} from "@galacticcouncil/web3-connect"
import { MutationOptions, useMutation } from "@tanstack/react-query"

import { TxOptions } from "@/modules/transactions/types"
import {
  signAndSubmitEvmDispatchTx,
  signAndSubmitEvmTx,
} from "@/modules/transactions/utils/ethereum"
import {
  isPapiTransaction,
  signAndSubmitPolkadotTx,
} from "@/modules/transactions/utils/polkadot"
import { isEvmCall } from "@/modules/transactions/utils/xcm"
import { AnyTransaction } from "@/states/transactions"

export const useSignAndSubmit = (
  tx: AnyTransaction,
  options: MutationOptions<void, Error, TxOptions>,
) => {
  const wallet = useWallet()

  return useMutation({
    ...options,
    mutationFn: async (txOptions: TxOptions) => {
      if (isPapiTransaction(tx) && isPolkadotSigner(wallet?.signer)) {
        return signAndSubmitPolkadotTx(tx, wallet.signer, txOptions)
      }

      if (isPapiTransaction(tx) && isEthereumSigner(wallet?.signer)) {
        return signAndSubmitEvmDispatchTx(tx, wallet.signer, txOptions)
      }

      if (isEvmCall(tx) && isEthereumSigner(wallet?.signer)) {
        return signAndSubmitEvmTx(tx, wallet.signer, txOptions)
      }

      throw new Error("Unsupported transaction or signer type")
    },
  })
}

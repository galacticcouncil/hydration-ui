import {
  isEthereumSigner,
  isPolkadotSigner,
  useWallet,
} from "@galacticcouncil/web3-connect"
import { MutationOptions, useMutation } from "@tanstack/react-query"
import { useEffect, useRef } from "react"
import { Subscription } from "rxjs"

import { TxOptions, TxResult } from "@/modules/transactions/types"
import {
  signAndSubmitEvmDispatchTx,
  signAndSubmitEvmTx,
} from "@/modules/transactions/utils/ethereum"
import {
  isPapiTransaction,
  signAndSubmitPolkadotTx,
  submitUnsignedPolkadotTx,
} from "@/modules/transactions/utils/polkadot"
import {
  isValidEvmCallForPermit,
  isValidPapiTxForPermit,
  transformEvmCallToPapiTx,
  transformPermitToPapiTx,
} from "@/modules/transactions/utils/tx"
import { isEvmCall } from "@/modules/transactions/utils/xcm"
import { useRpcProvider } from "@/providers/rpcProvider"
import { Transaction } from "@/states/transactions"

export const useSignAndSubmit = (
  transaction: Transaction,
  options: MutationOptions<TxResult, Error, TxOptions>,
) => {
  const { papi, papiClient } = useRpcProvider()
  const wallet = useWallet()

  const subscription = useRef<Subscription | null>(null)

  useEffect(() => () => subscription.current?.unsubscribe(), [])

  return useMutation({
    ...options,
    mutationFn: async (txOptions: TxOptions) => {
      const { tx } = transaction
      const signer = wallet?.signer

      if (isValidEvmCallForPermit(tx, txOptions) && isEthereumSigner(signer)) {
        const permit = await signer.getPermit(tx.data, txOptions)
        const permitTx = transformPermitToPapiTx(papi, permit)
        return submitUnsignedPolkadotTx(permitTx, papiClient, txOptions)
      }

      if (isValidPapiTxForPermit(tx, txOptions) && isEthereumSigner(signer)) {
        const data = await tx.getEncodedData()
        const permit = await signer.getPermit(data.asHex(), txOptions)
        const permitTx = transformPermitToPapiTx(papi, permit)
        return submitUnsignedPolkadotTx(permitTx, papiClient, txOptions)
      }

      if (isPapiTransaction(tx) && isPolkadotSigner(signer)) {
        return signAndSubmitPolkadotTx(tx, signer, txOptions)
      }

      if (isPapiTransaction(tx) && isEthereumSigner(signer)) {
        return signAndSubmitEvmDispatchTx(tx, signer, txOptions)
      }

      if (isEvmCall(tx) && isEthereumSigner(signer)) {
        return signAndSubmitEvmTx(tx, signer, txOptions)
      }

      if (isEvmCall(tx) && isPolkadotSigner(signer)) {
        return signAndSubmitPolkadotTx(
          transformEvmCallToPapiTx(papi, tx),
          signer,
          txOptions,
        )
      }

      throw new Error("Unsupported transaction or signer type")
    },
    onSettled: (result) => {
      if (result instanceof Subscription) {
        subscription.current = result
      }
    },
  })
}

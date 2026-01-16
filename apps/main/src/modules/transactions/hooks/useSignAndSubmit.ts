import {
  isEthereumSigner,
  isPolkadotSigner,
  isSolanaSigner,
  isSuiSigner,
  useWallet,
} from "@galacticcouncil/web3-connect"
import { MutationOptions, useMutation } from "@tanstack/react-query"
import { useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"
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
import { signAndSubmitSolanaTx } from "@/modules/transactions/utils/solana"
import { signAndSubmitSuiTx } from "@/modules/transactions/utils/sui"
import {
  isValidEvmCallForPermit,
  isValidPapiTxForPermit,
  transformEvmCallToPapiTx,
  transformPermitToPapiTx,
} from "@/modules/transactions/utils/tx"
import {
  isEvmCall,
  isSolanaCall,
  isSuiCall,
} from "@/modules/transactions/utils/xcm"
import { useRpcProvider } from "@/providers/rpcProvider"
import { SingleTransaction } from "@/states/transactions"

export const useSignAndSubmit = (
  transaction: SingleTransaction,
  options: MutationOptions<TxResult, Error, TxOptions>,
) => {
  const { t } = useTranslation("common")
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
        const permit = await signer.getPermit(tx, txOptions)
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

      if (isSolanaCall(tx) && isSolanaSigner(signer)) {
        return signAndSubmitSolanaTx(tx, signer, txOptions)
      }

      if (isSuiCall(tx) && isSuiSigner(signer)) {
        return signAndSubmitSuiTx(tx, signer, txOptions)
      }

      const err = new Error(t("transaction.error.unsupportedTransaction"))
      txOptions.onError(err.message)
      throw err
    },
    onSettled: (result) => {
      if (result instanceof Subscription) {
        subscription.current = result
      }
    },
  })
}

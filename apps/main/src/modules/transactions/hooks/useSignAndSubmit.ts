import { HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
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
  getBlockHashAtParentOffset,
  isPapiTransaction,
  signAndSubmitPolkadotTx,
  submitUnsignedPolkadotTx,
} from "@/modules/transactions/utils/polkadot"
import { signAndSubmitSolanaTx } from "@/modules/transactions/utils/solana"
import {
  addTxSubscription,
  deleteTxSubscription,
} from "@/modules/transactions/utils/subscriptions"
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

export const MORTALITY_BIRTH_BLOCK_OFFSET = 20

export const useSignAndSubmit = (
  transaction: SingleTransaction,
  options: MutationOptions<TxResult, Error, TxOptions>,
) => {
  const { t } = useTranslation("common")
  const { papi, papiClient } = useRpcProvider()
  const wallet = useWallet()

  const subscription = useRef<Subscription | null>(null)

  useEffect(() => {
    return () => {
      if (subscription.current) {
        deleteTxSubscription(subscription.current)
        subscription.current.unsubscribe()
      }
    }
  }, [])

  return useMutation({
    ...options,
    mutationFn: async (txOptions: TxOptions) => {
      const { tx, isUnsigned } = transaction

      const signer = wallet?.signer

      if (isUnsigned && isPapiTransaction(tx)) {
        return submitUnsignedPolkadotTx(tx, papiClient, txOptions)
      }

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
        const signAt =
          txOptions.chainKey === HYDRATION_CHAIN_KEY
            ? await getBlockHashAtParentOffset(
                papiClient,
                MORTALITY_BIRTH_BLOCK_OFFSET,
              )
            : undefined

        return signAndSubmitPolkadotTx(tx, signer, { ...txOptions, signAt })
      }

      if (isPapiTransaction(tx) && isEthereumSigner(signer)) {
        return signAndSubmitEvmDispatchTx(tx, signer, txOptions)
      }

      if (isEvmCall(tx) && isEthereumSigner(signer)) {
        return signAndSubmitEvmTx(tx, signer, txOptions)
      }

      if (isEvmCall(tx) && isPolkadotSigner(signer)) {
        const signAt =
          txOptions.chainKey === HYDRATION_CHAIN_KEY
            ? await getBlockHashAtParentOffset(
                papiClient,
                MORTALITY_BIRTH_BLOCK_OFFSET,
              )
            : undefined

        return signAndSubmitPolkadotTx(
          transformEvmCallToPapiTx(papi, tx),
          signer,
          { ...txOptions, signAt },
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
        addTxSubscription(result)
      }
    },
  })
}

import {
  isEthereumSigner,
  isNearSigner,
  isPolkadotSigner,
  isSolanaSigner,
  isSuiSigner,
  isZecSigner,
  useWallet,
} from "@galacticcouncil/web3-connect"
import { MutationOptions, useMutation } from "@tanstack/react-query"
import { Binary } from "polkadot-api"
import { useTranslation } from "react-i18next"
import { Subscription } from "rxjs"

import { TxOptions, TxResult } from "@/modules/transactions/types"
import {
  signAndSubmitEvmDispatchTx,
  signAndSubmitEvmTx,
} from "@/modules/transactions/utils/ethereum"
import { signAndSubmitNearTx } from "@/modules/transactions/utils/near"
import {
  isPapiTransaction,
  signAndSubmitPolkadotTx,
  submitUnsignedPolkadotTx,
} from "@/modules/transactions/utils/polkadot"
import { signAndSubmitSolanaTx } from "@/modules/transactions/utils/solana"
import { signAndSubmitStrictEvmTx } from "@/modules/transactions/utils/strictEvm"
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
  isNearCall,
  isSolanaCall,
  isSuiCall,
  isZecCall,
} from "@/modules/transactions/utils/xcm"
import { signAndSubmitZecTx } from "@/modules/transactions/utils/zec"
import { useRpcProvider } from "@/providers/rpcProvider"
import { SingleTransaction } from "@/states/transactions"

export const useSignAndSubmit = (
  transaction: SingleTransaction,
  options: MutationOptions<TxResult, Error, TxOptions>,
) => {
  const { t } = useTranslation("common")
  const { papi, papiClient } = useRpcProvider()
  const wallet = useWallet()

  return useMutation({
    ...options,
    mutationFn: async (txOptions: TxOptions) => {
      const { tx, isUnsigned } = transaction

      const signer = wallet?.signer

      // Strict: one plain eth_sendTransaction or nothing, whatever the fee
      // asset (no permit, no EVM.call, no dispatch precompile).
      if (transaction.strictEvm) {
        return signAndSubmitStrictEvmTx(transaction, signer, txOptions)
      }

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
        const permit = await signer.getPermit(Binary.toHex(data), txOptions)
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

      if (isNearCall(tx) && isNearSigner(signer)) {
        return signAndSubmitNearTx(tx, signer, txOptions)
      }

      if (isZecCall(tx) && isZecSigner(signer)) {
        return signAndSubmitZecTx(tx, signer, txOptions)
      }

      const err = new Error(t("transaction.error.unsupportedTransaction"))
      txOptions.onError(err.message)
      throw err
    },
    // Kept past unmount: a closed review (a multi-step flow closes after its
    // last step) must still see a reorg re-execute the tx as a failure. The
    // subscription ends itself at finality.
    onSettled: (result) => {
      if (result instanceof Subscription) {
        addTxSubscription(result)
        result.add(() => deleteTxSubscription(result))
      }
    },
  })
}

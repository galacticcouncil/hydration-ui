import { logger } from "@galacticcouncil/utils"
import { InvalidTxError, PolkadotSigner } from "polkadot-api"
import { isFunction, isObjectType } from "remeda"
import { catchError, of, shareReplay } from "rxjs"

import { TxSignAndSubmitFn } from "@/modules/transactions/types"
import { AnyPapiTx } from "@/states/transactions"

export const isPapiTransaction = (tx: unknown): tx is AnyPapiTx =>
  isObjectType(tx) &&
  "signSubmitAndWatch" in tx &&
  isFunction(tx.signSubmitAndWatch)

export const signAndSubmitPolkadotTx: TxSignAndSubmitFn<
  AnyPapiTx,
  PolkadotSigner
> = (tx, signer, { onError, onSubmitted, onSuccess, onFinalized, nonce }) => {
  const observer = tx
    .signSubmitAndWatch(signer, {
      nonce,
    })
    .pipe(
      catchError((error) => of({ type: "error" as const, error })),
      shareReplay(1),
    )

  const sub = observer.subscribe((event) => {
    logger.log("Transaction status:", event)
    if (event.type === "broadcasted") onSubmitted(event.txHash)

    if (event.type === "error") {
      onError(
        event.error instanceof InvalidTxError
          ? formatTxError(event.error.error)
          : formatError(event.error),
      )
    }

    if (event.type === "txBestBlocksState" && event.found) {
      if (event.ok) onSuccess()
      if (!event.ok) onError(formatTxError(event.dispatchError))
    }

    if (event.type === "finalized") {
      onFinalized()
      sub.unsubscribe()
    }
  })
}

export const formatTxError = (err: InvalidTxError["error"]): string => {
  if (!err) return ""
  if (typeof err === "string") return err
  if (err.type === "Module") return formatTxError(err.value)
  if (typeof err.type === "string")
    return [err.type, formatTxError(err.value)].filter(Boolean).join(": ")
  return "Unknown error"
}

export const formatError = (err: Error) => {
  return [err.name, err.message].filter(Boolean).join(": ")
}

import { logger } from "@galacticcouncil/utils"
import { InvalidTxError, PolkadotSigner } from "polkadot-api"
import { isFunction, isObjectType } from "remeda"
import { catchError, Observable, of, shareReplay } from "rxjs"

import {
  TxEventOrError,
  TxOptions,
  TxSignAndSubmitFn,
  UnsignedTxSubmitFn,
} from "@/modules/transactions/types"
import { AnyPapiTx } from "@/states/transactions"

export const isPapiTransaction = (tx: unknown): tx is AnyPapiTx =>
  isObjectType(tx) &&
  "signSubmitAndWatch" in tx &&
  isFunction(tx.signSubmitAndWatch)

export const signAndSubmitPolkadotTx: TxSignAndSubmitFn<
  AnyPapiTx,
  PolkadotSigner
> = async (tx, signer, options) => {
  const observer = tx
    .signSubmitAndWatch(signer, {
      nonce: options?.nonce,
    })
    .pipe(
      catchError((error) => of({ type: "error" as const, error })),
      shareReplay(1),
    )

  return observeTransactionEvents(observer, options)
}

export const submitUnsignedPolkadotTx: UnsignedTxSubmitFn<AnyPapiTx> = async (
  tx,
  client,
  options,
) => {
  const callData = await tx.getEncodedData()
  const observer = client.submitAndWatch(callData.asHex()).pipe(
    catchError((error) => of({ type: "error" as const, error })),
    shareReplay(1),
  )

  return observeTransactionEvents(observer, options)
}

const observeTransactionEvents = <T extends TxEventOrError>(
  observer: Observable<T>,
  options: TxOptions,
) => {
  const sub = observer.subscribe((event) => {
    logger.log("Transaction status:", event)
    if (event.type === "broadcasted") options?.onSubmitted(event.txHash)

    if (event.type === "error") {
      options?.onError(
        event.error instanceof InvalidTxError
          ? formatTxError(event.error.error)
          : formatError(event.error),
      )
      sub.unsubscribe()
    }

    if (event.type === "txBestBlocksState" && event.found) {
      if (event.ok) options?.onSuccess()
      if (!event.ok) options?.onError(formatTxError(event.dispatchError))
    }

    if (event.type === "finalized") {
      options?.onFinalized()
      sub.unsubscribe()
    }
  })

  return sub
}

export const formatTxError = (err: InvalidTxError["error"]): string => {
  if (!err) return ""
  if (typeof err === "string") return err
  if (err.type === "Module") return formatTxError(err.value)
  if (typeof err.type === "string")
    return [err.type, formatTxError(err.value)].filter(Boolean).join(".")
  return "Unknown error"
}

export const formatError = (err: Error) => {
  return [err.name, err.message].filter(Boolean).join(".")
}

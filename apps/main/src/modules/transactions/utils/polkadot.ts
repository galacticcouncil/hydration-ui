import { logger } from "@galacticcouncil/utils"
import { Binary, compactNumber } from "@polkadot-api/substrate-bindings"
import { InvalidTxError, PolkadotSigner } from "polkadot-api"
import { mergeUint8 } from "polkadot-api/utils"
import { isBigInt, isFunction, isNumber, isObjectType, isString } from "remeda"
import { catchError, Observable, of, shareReplay } from "rxjs"

import {
  AnyPapiTx,
  TxBestBlocksStateResult,
  TxEventOrError,
  TxFinalizedResult,
  TxOptions,
  TxSignAndSubmitFn,
  UnsignedTxSubmitFn,
} from "@/modules/transactions/types"

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
      tip: options?.tip,
      mortality: { mortal: true, period: options.mortalityPeriod },
    })
    .pipe(
      catchError((error) => of({ type: "error" as const, error })),
      shareReplay(1),
    )

  return observeTransactionEvents(observer, options)
}

const unsigedTxFromCallData = (callData: Binary): Binary => {
  const rawCallData = callData.asBytes()
  return Binary.fromBytes(
    mergeUint8(
      compactNumber.enc(rawCallData.length + 1),
      new Uint8Array([4]),
      rawCallData,
    ),
  )
}

const txToUnsigedTx = async (tx: AnyPapiTx) =>
  unsigedTxFromCallData(await tx.getEncodedData())

export const submitUnsignedPolkadotTx: UnsignedTxSubmitFn<AnyPapiTx> = async (
  tx,
  client,
  options,
) => {
  const unsignedTx = await txToUnsigedTx(tx)
  const observer = client.submitAndWatch(unsignedTx.asHex()).pipe(
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
      if (event.ok) options?.onSuccess(event as TxBestBlocksStateResult)
      if (!event.ok) options?.onError(formatTxError(event.dispatchError))
    }

    if (event.type === "finalized") {
      options?.onFinalized(event as TxFinalizedResult)
      sub.unsubscribe()
    }
  })

  return sub
}

export const formatTxError = (err: InvalidTxError["error"]): string => {
  if (!err) return ""
  if (isString(err) || isNumber(err) || isBigInt(err)) return err.toString()
  if (err.type === "Module") return formatTxError(err.value)
  if (typeof err.type === "string")
    return [err.type, formatTxError(err.value)].filter(Boolean).join(".")
  return "Unknown error"
}

export const formatError = (err: Error) => {
  return [err.name, err.message].filter(Boolean).join(".")
}

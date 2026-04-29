import { logger } from "@galacticcouncil/utils"
import { compactNumber } from "@polkadot-api/substrate-bindings"
import { InvalidTxError, PolkadotSigner } from "polkadot-api"
import { mergeUint8 } from "polkadot-api/utils"
import { isBigInt, isFunction, isNumber, isObjectType, isString } from "remeda"
import { catchError, Observable, of, shareReplay } from "rxjs"

import {
  AnyPapiTx,
  BatchDecodedCallValue,
  DecodedCallEnum,
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

export const isDecodedCallEnum = (value: unknown): value is DecodedCallEnum => {
  return isObjectType(value) && "type" in value && "value" in value
}

export const isBatchDecodedCallValue = (
  value: unknown,
): value is BatchDecodedCallValue => {
  return isObjectType(value) && "type" in value && value.type === "batch_all"
}

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
      shareReplay({ bufferSize: 1, refCount: true }),
    )

  return observeTransactionEvents(observer, options)
}

const unsigedTxFromCallData = (callData: Uint8Array): Uint8Array =>
  mergeUint8([
    compactNumber.enc(callData.length + 1),
    new Uint8Array([4]),
    callData,
  ])

const txToUnsigedTx = async (tx: AnyPapiTx) =>
  unsigedTxFromCallData(await tx.getEncodedData())

export const submitUnsignedPolkadotTx: UnsignedTxSubmitFn<AnyPapiTx> = async (
  tx,
  client,
  options,
) => {
  const unsignedTx = await txToUnsigedTx(tx)
  const observer = client.submitAndWatch(unsignedTx).pipe(
    catchError((error) => of({ type: "error" as const, error })),
    shareReplay({ bufferSize: 1, refCount: true }),
  )

  return observeTransactionEvents(observer, options)
}

const observeTransactionEvents = <T extends TxEventOrError>(
  observer: Observable<T>,
  options: TxOptions,
) => {
  const sub = observer.subscribe((event) => {
    logger.info("[TX]", event)
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
      const isEvmError = event.events.some(
        ({ type, value }) => type === "EVM" && value.type === "ExecutedFailed",
      )

      if (isEvmError) {
        options?.onError(
          formatTxError(event.dispatchError || "EVM execution failed"),
        )
      } else if (!event.ok) {
        options?.onError(formatTxError(event.dispatchError))
      } else {
        options?.onSuccess(event as TxBestBlocksStateResult)
      }
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

import type { AnyJson } from "@polkadot/types-codec/types"
import { SubmittableExtrinsic } from "@polkadot/api/types"
import { useApiPromise } from "utils/api"
import { useState } from "react"
import { ExtrinsicStatus } from "@polkadot/types/interfaces"
import { useMutation } from "@tanstack/react-query"
import { ISubmittableResult } from "@polkadot/types/types"
import { useMountedState } from "react-use"

type TxMethod = AnyJson & {
  method: string
  section: string
  args: { [key: string]: AnyJson }
}

function isTxMethod(x: AnyJson): x is TxMethod {
  return typeof x === "object" && x != null && "method" in x && "section" in x
}

type TxHuman = Record<string, { args: TxMethod["args"] }>

function getTxHuman(x: AnyJson, prefix = ""): TxHuman | null {
  if (!isTxMethod(x)) return null

  const key = `${prefix}${x.section}.${x.method}(args)`
  let args = x.args

  if (
    (key === "utility.batch(args)" || key === "utility.batchAll(args)") &&
    Array.isArray(x.args.calls)
  ) {
    args = {
      calls: x.args.calls.reduce<TxHuman>((memo, item, idx) => {
        const parsed = getTxHuman(item, `#${idx}: `)
        if (parsed == null) return memo
        return { ...memo, ...parsed }
      }, {}),
    }
  }

  return { [key]: { args } }
}

type TxExtrinsic = AnyJson & { method: TxMethod }

function isTxExtrinsic(x: AnyJson): x is TxExtrinsic {
  return (
    typeof x === "object" && x != null && "method" in x && isTxMethod(x.method)
  )
}

export function getTransactionJSON(tx: SubmittableExtrinsic<"promise">) {
  const txEx = tx.toHuman()
  const res = isTxExtrinsic(txEx) ? getTxHuman(txEx.method) : null
  if (res == null || Object.entries(res).length !== 1) return null

  const [method, { args }] = Object.entries(res)[0]
  return { method, args }
}

export const useSendTransactionMutation = () => {
  const api = useApiPromise()
  const isMounted = useMountedState()
  const [txState, setTxState] = useState<ExtrinsicStatus["type"] | null>(null)

  const sendTx = useMutation(async (sign: SubmittableExtrinsic<"promise">) => {
    return await new Promise<ISubmittableResult>(async (resolve, reject) => {
      const unsubscribe = await sign.send((result) => {
        if (!api || !result || !result.status) return
        if (isMounted()) setTxState(result.status.type)
        if (result.isCompleted) {
          if (result.dispatchError) {
            let errorMessage = result.dispatchError.toString()

            if (result.dispatchError.isModule) {
              const decoded = api.registry.findMetaError(
                result.dispatchError.asModule,
              )
              errorMessage = `${decoded.section}.${
                decoded.method
              }: ${decoded.docs.join(" ")}`
            }

            reject(new Error(errorMessage))
          } else {
            resolve(result)
          }

          unsubscribe()
        }
      })
    })
  })

  return {
    ...sendTx,
    txState: txState,
    reset: () => {
      setTxState(null)
      sendTx.reset()
    },
  }
}

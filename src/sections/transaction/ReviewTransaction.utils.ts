import {
  TransactionReceipt,
  TransactionResponse,
} from "@ethersproject/providers"
import { evmChains } from "@galacticcouncil/xcm-sdk"
import { Hash } from "@open-web3/orml-types/interfaces"
import { SubmittableExtrinsic } from "@polkadot/api/types"
import type { AnyJson } from "@polkadot/types-codec/types"
import { ExtrinsicStatus } from "@polkadot/types/interfaces"
import { ISubmittableResult } from "@polkadot/types/types"
import { MutationObserverOptions, useMutation } from "@tanstack/react-query"
import { useTransactionLink } from "api/transaction"
import { decodeError } from "ethers-decode-error"
import { useRpcProvider } from "providers/rpcProvider"
import { useState } from "react"
import { useMountedState } from "react-use"
import { useEvmAccount } from "sections/web3-connect/Web3Connect.utils"
import { H160, getEvmTxLink, isEvmAccount } from "utils/evm"

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

  const [method, { args: argsRaw }] = Object.entries(res)[0]

  const args = Object.fromEntries(
    Object.entries(argsRaw).map(([key, value]) => [
      key,
      // format EVM account address to EVM H160
      typeof value === "string" && isEvmAccount(value)
        ? H160.fromAccount(value)
        : value,
    ]),
  )
  return { method, args }
}

export class UnknownTransactionState extends Error {}

function evmTxReceiptToSubmittableResult(txReceipt: TransactionReceipt) {
  const isSuccess = txReceipt.status === 1
  const submittableResult: ISubmittableResult = {
    status: {} as ExtrinsicStatus,
    events: [],
    isCompleted: isSuccess,
    isError: !isSuccess,
    isFinalized: isSuccess,
    isInBlock: isSuccess,
    isWarning: false,
    txHash: txReceipt.transactionHash as unknown as Hash,
    txIndex: txReceipt.transactionIndex,
    filterRecords: () => [],
    findRecord: () => undefined,
    toHuman: () => ({}),
  }

  return submittableResult
}
export const useSendEvmTransactionMutation = (
  options: MutationObserverOptions<
    ISubmittableResult & {
      transactionLink?: string
    },
    unknown,
    TransactionResponse
  > = {},
) => {
  const [txState, setTxState] = useState<ExtrinsicStatus["type"] | null>(null)
  const { account } = useEvmAccount()

  const sendTx = useMutation(async (tx) => {
    return await new Promise(async (resolve, reject) => {
      const timeout = setTimeout(
        () => {
          clearTimeout(timeout)
          reject(new UnknownTransactionState())
        },
        5 * 60 * 1000,
      )

      try {
        setTxState("Broadcast")
        const receipt = await tx.wait()
        setTxState("InBlock")

        const chainEntries = Object.entries(evmChains).find(
          ([_, chain]) => chain.id === account?.chainId,
        )

        const chain = chainEntries?.[0]

        const transactionLink = getEvmTxLink(receipt.transactionHash, chain)

        return resolve({
          transactionLink,
          ...evmTxReceiptToSubmittableResult(receipt),
        })
      } catch (err) {
        const { error } = decodeError(err)
        reject(new Error(error))
      } finally {
        clearTimeout(timeout)
      }
    })
  }, options)

  return {
    ...sendTx,
    txState,
    reset: () => {
      setTxState(null)
      sendTx.reset()
    },
  }
}

export const useSendTransactionMutation = (
  options: MutationObserverOptions<
    ISubmittableResult & { transactionLink?: string },
    unknown,
    SubmittableExtrinsic<"promise">
  > = {},
) => {
  const { api } = useRpcProvider()
  const isMounted = useMountedState()
  const link = useTransactionLink()
  const [txState, setTxState] = useState<ExtrinsicStatus["type"] | null>(null)

  const sendTx = useMutation(async (sign) => {
    return await new Promise(async (resolve, reject) => {
      const unsubscribe = await sign.send(async (result) => {
        if (!result || !result.status) return

        const timeout = setTimeout(() => {
          clearTimeout(timeout)
          reject(new UnknownTransactionState())
        }, 60000)

        if (isMounted()) {
          setTxState(result.status.type)
        } else {
          clearTimeout(timeout)
        }

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

            clearTimeout(timeout)
            reject(new Error(errorMessage))
          } else {
            const transactionLink = await link.mutateAsync({
              blockHash: result.status.asInBlock.toString(),
              txIndex: result.txIndex?.toString(),
            })

            clearTimeout(timeout)
            resolve({
              transactionLink,
              ...result,
            })
          }

          unsubscribe()
        }
      })
    })
  }, options)

  return {
    ...sendTx,
    txState,
    reset: () => {
      setTxState(null)
      sendTx.reset()
    },
  }
}

export const useSendTx = () => {
  const [txType, setTxType] = useState<"default" | "evm" | null>(null)
  const sendTx = useSendTransactionMutation({
    onMutate: () => setTxType("default"),
  })

  const sendEvmTx = useSendEvmTransactionMutation({
    onMutate: () => setTxType("evm"),
  })

  const activeMutation = txType === "default" ? sendTx : sendEvmTx

  return {
    sendTx: sendTx.mutateAsync,
    sendEvmTx: sendEvmTx.mutateAsync,
    ...activeMutation,
  }
}

import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import { prop } from "remeda"

import { blockWeightsQuery } from "@/api/chain"
import { AnyPapiTx } from "@/modules/transactions/types"
import { Papi, useRpcProvider } from "@/providers/rpcProvider"
import {
  TransactionInput,
  TransactionOptions,
  useTransactionsStore,
} from "@/states/transactions"

type BlockWeights = { ref_time: bigint; proof_size: bigint }

export const calculateChunkSize = async (
  papi: Papi,
  address: string,
  txs: Array<AnyPapiTx>,
  blockWeights: BlockWeights,
) => {
  const { ref_time, proof_size } = blockWeights

  const batchTx = papi.tx.Utility.batch_all({
    calls: txs.map((t) => t.decodedCall),
  })

  const paymentInfo = await batchTx.getPaymentInfo(address)

  const { ref_time: refTimeTx, proof_size: proofSizeTx } = paymentInfo.weight

  const isFitBlock = proof_size > proofSizeTx && ref_time > refTimeTx

  if (isFitBlock) {
    return { chunkSize: txs.length, batchCount: 1 }
  }

  const batchCount = Math.ceil(
    Big.max(
      Big(proofSizeTx.toString()).div(proof_size.toString()),
      Big(refTimeTx.toString()).div(ref_time.toString()),
    ).toNumber(),
  )

  const chunkSize = Math.ceil(txs.length / batchCount)

  return { chunkSize, batchCount }
}

export const getChunkByIndex = (
  txs: Array<AnyPapiTx>,
  index: number,
  chunkSize: number,
): Array<AnyPapiTx> => {
  const start = index * chunkSize
  const end = start + chunkSize
  return txs.slice(start, end)
}

export const useCreateBatchTx = () => {
  const provider = useRpcProvider()
  const createTransaction = useTransactionsStore(prop("createTransaction"))
  const { t } = useTranslation("common")
  const { account } = useAccount()
  const { data: blockWeights } = useQuery(blockWeightsQuery(provider))

  const { papi } = provider

  return useCallback(
    async ({
      txs,
      transaction,
      options,
    }: {
      txs: Array<AnyPapiTx>
      transaction?: Omit<TransactionInput, "tx">
      options?: TransactionOptions
    }) => {
      const address = account?.address
      const blockWeightsData = blockWeights?.per_class.normal.max_extrinsic

      if (!txs.length || !address || !blockWeightsData)
        throw new Error("Missing required parameters for batch transaction")

      if (txs.length === 1) {
        const tx = txs[0]

        if (tx) {
          return createTransaction({ ...transaction, tx }, options)
        }
      }

      const batchTx = papi.tx.Utility.batch_all({
        calls: txs.map((t) => t.decodedCall),
      })

      const { chunkSize, batchCount } = await calculateChunkSize(
        papi,
        address,
        txs,
        blockWeightsData,
      )

      if (batchCount === 1) {
        return createTransaction({ ...transaction, tx: batchTx }, options)
      }

      const warning = t("transaction.batch.warning")

      return createTransaction({
        tx: Array.from({ length: batchCount }, (_, i) => {
          const chunk = getChunkByIndex(txs, i, chunkSize)

          return {
            stepTitle: t("transaction.batch.step.label", { index: i + 1 }),
            description: warning,
            tx: papi.tx.Utility.batch_all({
              calls: chunk.map((t) => t.decodedCall),
            }),
          }
        }),
      })
    },
    [account?.address, papi, blockWeights, createTransaction, t],
  )
}

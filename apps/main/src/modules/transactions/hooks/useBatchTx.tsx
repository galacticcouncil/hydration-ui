import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import { prop } from "remeda"

import { blockWeightsQuery } from "@/api/chain"
import { AnyPapiTx } from "@/modules/transactions/types"
import { useRpcProvider } from "@/providers/rpcProvider"
import {
  TransactionInput,
  TransactionOptions,
  useTransactionsStore,
} from "@/states/transactions"

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

      if (!txs.length || !address || !blockWeightsData) return

      if (txs.length === 1) {
        const tx = txs[0]

        if (tx) {
          return createTransaction({ ...transaction, tx }, options)
        }
      }

      try {
        const { ref_time, proof_size } = blockWeightsData

        const batchTx = papi.tx.Utility.batch_all({
          calls: txs.map((t) => t.decodedCall),
        })

        const paymentInfo = await batchTx.getPaymentInfo(address)

        const { ref_time: refTimeTx, proof_size: proofSizeTx } =
          paymentInfo.weight

        const isFitBlock = proof_size > proofSizeTx && ref_time > refTimeTx

        if (isFitBlock) {
          return createTransaction({ ...transaction, tx: batchTx }, options)
        }

        const index = Math.ceil(
          Math.max(
            Big(proofSizeTx.toString()).div(proof_size.toString()).toNumber(),
            Big(refTimeTx.toString()).div(ref_time.toString()).toNumber(),
          ),
        )

        const chunkSize = Math.ceil(txs.length / index)
        const chunks: Array<AnyPapiTx[]> = []

        for (let i = 0; i < index; i++) {
          const start = i * chunkSize
          const end = start + chunkSize
          chunks.push(txs.slice(start, end))
        }

        const warning = t("transaction.batch.warning")

        await createTransaction({
          tx: chunks.map((chunk, i) => ({
            stepTitle: t("transaction.batch.step.label", { index: i + 1 }),
            description: warning,
            tx: papi.tx.Utility.batch_all({
              calls: chunk.map((t) => t.decodedCall),
            }),
          })),
        })
      } catch (error) {
        console.error(error)
        throw new Error("Failed to create batch transaction")
      }
    },
    [account?.address, papi, blockWeights, createTransaction, t],
  )
}

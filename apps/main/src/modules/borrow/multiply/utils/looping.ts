import { SdkCtx } from "@galacticcouncil/sdk-next"
import { CallType } from "@galacticcouncil/xc-core"
import { unique } from "remeda"

import { Trade } from "@/api/trade"
import { AnyPapiTx } from "@/modules/transactions/types"

export type LoopingBatchItem =
  | { type: CallType.Substrate; data: Trade }
  | { type: CallType.Evm; data: AnyPapiTx }

export function validateLoopingEvmTx(
  tx: { from?: string; to?: string; data?: string },
  label: string,
): asserts tx is { from: string; to: string; data: string } {
  if (!tx.from || !tx.to || !tx.data) {
    throw new Error(`Invalid ${label} transaction`)
  }
}

export function getLoopingBatchErrors(batch: LoopingBatchItem[]) {
  return unique(
    batch.flatMap(({ data, type }) =>
      type === CallType.Substrate
        ? data.swaps.flatMap((swap) => swap.errors)
        : [],
    ),
  )
}

export async function convertLoopingBatchToTxs(
  sdk: SdkCtx,
  batch: LoopingBatchItem[],
  address: string,
  slippage: number,
): Promise<AnyPapiTx[]> {
  return Promise.all(
    batch.map(async (item) => {
      if (item.type === CallType.Substrate) {
        const builtTx = await sdk.tx
          .trade(item.data)
          .withSlippage(slippage)
          .withBeneficiary(address)
          .build()
        return builtTx.get()
      }
      return item.data
    }),
  )
}

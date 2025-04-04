import { sleep } from "@galacticcouncil/utils"
import { queryOptions } from "@tanstack/react-query"

import { QUERY_KEY_BLOCK_PREFIX } from "@/utils/consts"

export const transactionTypesMock = ["deposit", "withdraw"] as const
export type TransactionTypeMock = (typeof transactionTypesMock)[number]

export type TransactionMock = {
  readonly type: TransactionTypeMock
  readonly failed?: boolean
  readonly timestamp: string
  readonly assetId: string
  readonly total: string
  readonly transferable: string
  readonly addressFrom: string
  readonly addressTo: string
}

export const walletTransactionsQuery = (
  type: ReadonlyArray<TransactionTypeMock>,
) =>
  queryOptions({
    queryKey: [QUERY_KEY_BLOCK_PREFIX, "wallet", "transactions", ...type],
    queryFn: () =>
      sleep(1000).then(
        (): Array<TransactionMock> => [
          {
            type: "deposit",
            timestamp: new Date(2025, 3, 24, 12, 38).toISOString(),
            assetId: "1",
            total: "100000000000000000",
            transferable: "100000000000000000",
            addressFrom: "0x10e0271ec47d55511a047516f2a7301801d55eab",
            addressTo: "0xb5643598496b159263c67bd0d25728713f5aad04",
          },
          {
            type: "withdraw",
            timestamp: new Date(2025, 3, 23, 11, 37).toISOString(),
            assetId: "10",
            total: "100000000000000",
            transferable: "100000000000000",
            addressFrom: "0x10e0271ec47d55511a047516f2a7301801d55eab",
            addressTo: "0xb5643598496b159263c67bd0d25728713f5aad04",
          },
        ],
      ),
  })

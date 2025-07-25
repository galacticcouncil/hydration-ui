import { sleep } from "@galacticcouncil/utils"
import { QUERY_KEY_BLOCK_PREFIX } from "@galacticcouncil/utils"
import { queryOptions } from "@tanstack/react-query"

export const transactionTypesMock = ["deposit", "withdraw"] as const
export type TransactionTypeMock = (typeof transactionTypesMock)[number]

export type TransactionMock = {
  readonly type: TransactionTypeMock
  readonly failed?: boolean
  readonly timestamp: string
  readonly assetId: string
  readonly amount: string
  readonly addressFrom: string
  readonly addressTo: string
}

// TODO integrate
export const walletTransactionsQuery = (
  type: ReadonlyArray<TransactionTypeMock> | undefined,
) =>
  queryOptions({
    queryKey: [
      QUERY_KEY_BLOCK_PREFIX,
      "wallet",
      "transactions",
      ...(type ?? []),
    ],
    queryFn: () =>
      sleep(1000).then(() =>
        (
          [
            {
              type: "deposit",
              timestamp: new Date(2025, 3, 22, 12, 38).toISOString(),
              assetId: "1",
              amount: "100000000000000000",
              addressFrom: "0x12e0271ec47d55511a047516f2a7301801d55eab",
              addressTo: "0xb5643598496b159263c67bd0d25728713f5aad04",
            },
            {
              type: "withdraw",
              timestamp: new Date(2025, 3, 23, 11, 37).toISOString(),
              assetId: "10",
              amount: "100000",
              addressFrom: "0x11e0271ec47d55511a047516f2a7301801d55eab",
              addressTo: "0xc5643598496b159263c67bd0d25728713f5aad04",
            },
            {
              type: "deposit",
              timestamp: new Date(2025, 3, 23, 13, 37).toISOString(),
              assetId: "10",
              amount: "100000000000000",
              addressFrom: "0x10e0271ec47d55511a047516f2a7301801d55eab",
              addressTo: "0xd5643598496b159263c67bd0d25728713f5aad04",
            },
          ] satisfies Array<TransactionMock>
        ).filter((x) => !type || !type.length || type.includes(x.type)),
      ),
  })

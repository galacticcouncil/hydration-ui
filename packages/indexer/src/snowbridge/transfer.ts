import { queryOptions } from "@tanstack/react-query"

import { SnowbridgeSdk } from "@/snowbridge"

export const snowbridgeStatusToPolkadotQuery = (
  snowbridgeSdk: SnowbridgeSdk,
  txHash: string,
  limit: number = 10,
) => {
  return queryOptions({
    queryKey: ["snowbridge", "transfer", "status", "polkadot", txHash, limit],
    queryFn: () =>
      snowbridgeSdk.TransferStatusToPolkadot({ hash: txHash, limit }),
    enabled: !!txHash,
  })
}

export const snowbridgeStatusToEthQuery = (
  snowbridgeSdk: SnowbridgeSdk,
  txHash: string,
  limit: number = 10,
) => {
  return queryOptions({
    queryKey: ["snowbridge", "transfer", "status", "ethereum", txHash, limit],
    queryFn: () => snowbridgeSdk.TransferStatusToEth({ hash: txHash, limit }),
    enabled: !!txHash,
  })
}

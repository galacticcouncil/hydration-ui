import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"

import { papiDryRunErrorQuery } from "@/api/dryRun"
import { ENV } from "@/config/env"
import { useRpcProvider } from "@/providers/rpcProvider"
import { SingleTransaction } from "@/states/transactions"

export const useTransactionDryRun = (tx: SingleTransaction["tx"]) => {
  const rpc = useRpcProvider()
  const { account } = useAccount()

  return useQuery({
    ...papiDryRunErrorQuery(rpc, account?.address ?? "", tx, true),
    enabled: ENV.VITE_DRY_RUN_ENABLED,
  })
}

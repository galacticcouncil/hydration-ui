import { safeStringify } from "@galacticcouncil/utils"
import { useQuery } from "@tanstack/react-query"

import { AnyTransaction } from "@/modules/transactions/types"
import { getTxCallHash } from "@/modules/transactions/utils/tx"

export const useTxCallData = (tx: AnyTransaction, enabled = true) =>
  useQuery({
    queryKey: ["txCallData", safeStringify(tx)],
    queryFn: () => getTxCallHash(tx),
    staleTime: Infinity,
    enabled,
  })

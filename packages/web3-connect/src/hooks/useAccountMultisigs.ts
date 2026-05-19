import {
  getMultixSdk,
  multisigsByAccountIdsQuery,
  MultixSdk,
} from "@galacticcouncil/indexer/multix"
import { multix } from "@galacticcouncil/utils"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"

import { useAccount } from "@/hooks/useAccount"

export const useMultixClient = (): MultixSdk => {
  const [client] = useState<MultixSdk>(() => getMultixSdk(multix.graphql))
  return client
}

export const useAccountMultisigs = () => {
  const { account } = useAccount()
  const client = useMultixClient()
  const accountId = account?.publicKey ? `hydradx-${account.publicKey}` : ""
  return useQuery(
    multisigsByAccountIdsQuery(client, accountId ? [accountId] : []),
  )
}

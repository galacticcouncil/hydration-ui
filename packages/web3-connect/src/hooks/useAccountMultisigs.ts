import {
  getMultixSdk,
  multisigsByAccountIdsQuery,
  MultixSdk,
} from "@galacticcouncil/indexer/multix"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"

import { useAccount } from "@/hooks/useAccount"

const MULTIX_URL = "https://hydration.graphql.multix.cloud/graphql"

export const useMultixClient = (): MultixSdk => {
  const [client] = useState<MultixSdk>(() => getMultixSdk(MULTIX_URL))
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

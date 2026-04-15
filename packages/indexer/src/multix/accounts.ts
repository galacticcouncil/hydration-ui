import { queryOptions } from "@tanstack/react-query"

import { MultixSdk } from "@/multix"

export const multisigsByAccountIdsQuery = (
  multixSdk: MultixSdk,
  accountIds: string[],
) => {
  return queryOptions({
    queryKey: ["multix", "accounts", "multisigs", accountIds],
    queryFn: () => multixSdk.MultisigsByAccountIds({ accountIds }),
    enabled: accountIds.length > 0,
  })
}

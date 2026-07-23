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

export const multisigHistoryByAccountIdQuery = (
  multixSdk: MultixSdk,
  accountId: string,
  limit = 50,
  offset = 0,
) => {
  return queryOptions({
    queryKey: [
      "multix",
      "accounts",
      "multisigHistory",
      accountId,
      limit,
      offset,
    ],
    queryFn: () =>
      multixSdk.MultisigHistoryByAccountId({ accountId, limit, offset }),
    enabled: !!accountId,
  })
}

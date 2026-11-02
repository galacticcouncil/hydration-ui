import { queryOptions } from "@tanstack/react-query"
import * as z from "zod/v4"

import { MultixSdk } from "@/multix"

const multisigSchema = z.object({
  pubKey: z.string(),
  threshold: z.number().nullable(),
  signatories: z.array(
    z.object({ signatory: z.object({ pubKey: z.string() }) }),
  ),
})

export const multisigsByAccountIdsQuery = (
  multixSdk: MultixSdk,
  accountIds: string[],
) => {
  return queryOptions({
    queryKey: ["multix", "accounts", "multisigs", accountIds],
    queryFn: async () => {
      const data = await multixSdk.MultisigsByAccountIds({ accountIds })
      if (!Array.isArray(data?.accounts)) {
        throw new Error("Invalid Multix multisigs response")
      }

      return {
        ...data,
        accounts: data.accounts.filter(
          (account) => multisigSchema.safeParse(account).success,
        ),
      }
    },
    enabled: accountIds.length > 0,
    retry: false,
  })
}

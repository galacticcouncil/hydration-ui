import { queryOptions } from "@tanstack/react-query"

import { TProviderContext } from "@/providers/rpcProvider"

export const accountReferralSharesQuery = (
  { papi, isApiLoaded }: TProviderContext,
  accountAddress: string,
) => {
  return queryOptions({
    queryKey: ["accountReferralShares", accountAddress],
    queryFn: async () => {
      const [totalSharesRaw, referrerSharesRaw, traderSharesRaw] =
        await Promise.all([
          papi.query.Referrals.TotalShares.getValue(),
          papi.query.Referrals.ReferrerShares.getValue(accountAddress),
          papi.query.Referrals.TraderShares.getValue(accountAddress),
        ])

      return {
        referrerShares: referrerSharesRaw,
        traderShares: traderSharesRaw,
        totalShares: totalSharesRaw,
      }
    },
    enabled: isApiLoaded && !!accountAddress,
  })
}

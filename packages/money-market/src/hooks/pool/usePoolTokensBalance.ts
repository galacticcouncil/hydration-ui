import { useQueries } from "@tanstack/react-query"

import { HookOpts } from "@/hooks/commonTypes"
import { UserPoolTokensBalances } from "@/services/WalletBalanceService"
import { useRootStore } from "@/store/root"
import { MarketDataType } from "@/ui-config/marketsConfig"
import { POLLING_INTERVAL, queryKeysFactory } from "@/ui-config/queries"
import { useSharedDependencies } from "@/ui-config/SharedDependenciesProvider"

export const usePoolsTokensBalance = <T = UserPoolTokensBalances[]>(
  marketsData: MarketDataType[],
  user: string,
  opts?: HookOpts<UserPoolTokensBalances[], T>,
) => {
  const { poolTokensBalanceService } = useSharedDependencies()

  return useQueries({
    queries: marketsData.map((marketData) => ({
      queryKey: queryKeysFactory.poolTokens(user, marketData),
      queryFn: () =>
        poolTokensBalanceService.getPoolTokensBalances(marketData, user),
      enabled: !!user,
      refetchInterval: POLLING_INTERVAL,
      ...opts,
    })),
  })
}

export const usePoolTokensBalance = (marketData: MarketDataType) => {
  const user = useRootStore((store) => store.account)
  return usePoolsTokensBalance([marketData], user)[0]
}

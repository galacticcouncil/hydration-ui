import { Stake } from "@aave/contract-helpers"
import { useQuery } from "@tanstack/react-query"
import { useRootStore } from "sections/lending/store/root"
import { MarketDataType } from "sections/lending/ui-config/marketsConfig"
import {
  POLLING_INTERVAL,
  queryKeysFactory,
} from "sections/lending/ui-config/queries"
import { useSharedDependencies } from "sections/lending/ui-config/SharedDependenciesProvider"

import { getStakeIndex, oracles, stakedTokens } from "./common"

export const useUserStakeUiData = (
  marketData: MarketDataType,
  select?: Stake,
) => {
  const { uiStakeDataService } = useSharedDependencies()
  const user = useRootStore((store) => store.account)
  return useQuery({
    queryFn: () =>
      uiStakeDataService.getUserStakeUIDataHumanized(
        marketData,
        user,
        stakedTokens,
        oracles,
      ),
    queryKey: queryKeysFactory.userStakeUiData(
      user,
      marketData,
      stakedTokens,
      oracles,
    ),
    enabled: !!user,
    initialData: null,
    refetchInterval: POLLING_INTERVAL,
    select: (data) => {
      if (data && select) {
        return {
          ...data,
          stakeUserData: [data.stakeUserData[getStakeIndex(select)]],
        }
      }
      return data
    },
  })
}

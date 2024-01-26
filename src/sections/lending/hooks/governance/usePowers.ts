import { useQuery } from "@tanstack/react-query"
import { useRootStore } from "sections/lending/store/root"
import { governanceV3Config } from "sections/lending/ui-config/governanceConfig"
import {
  POLLING_INTERVAL,
  queryKeysFactory,
} from "sections/lending/ui-config/queries"
import { useSharedDependencies } from "sections/lending/ui-config/SharedDependenciesProvider"

export const usePowers = () => {
  const { governanceService } = useSharedDependencies()
  const user = useRootStore((store) => store.account)
  return useQuery({
    queryFn: () =>
      governanceService.getPowers(governanceV3Config.coreChainId, user),
    queryKey: queryKeysFactory.powers(user, governanceV3Config.coreChainId),
    enabled: !!user,
    refetchInterval: POLLING_INTERVAL,
  })
}

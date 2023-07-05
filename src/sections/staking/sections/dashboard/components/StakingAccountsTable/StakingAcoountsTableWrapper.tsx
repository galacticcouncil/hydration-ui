import { useApiPromise } from "utils/api"
import { isApiLoaded } from "utils/helpers"
import { StakingAccountTable } from "./StakingAccountTable"
import { StakingAccountSkeleton } from "./skeleton/StakingAccountSkeleton"

export const StakingAccountsTableWrapper = () => {
  const api = useApiPromise()

  if (!isApiLoaded(api)) return <StakingAccountSkeleton />

  return <OmnipoolAssetsTableWrapperData />
}

export const OmnipoolAssetsTableWrapperData = () => {
  if (false) <StakingAccountSkeleton />

  return <StakingAccountTable />
}

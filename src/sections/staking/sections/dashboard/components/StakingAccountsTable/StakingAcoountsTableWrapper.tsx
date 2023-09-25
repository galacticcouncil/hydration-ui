import { StakingAccountTable } from "./StakingAccountTable"
import { StakingAccountSkeleton } from "./skeleton/StakingAccountSkeleton"
import { useRpcProvider } from "providers/rpcProvider"

export const StakingAccountsTableWrapper = () => {
  const { isLoaded } = useRpcProvider()

  if (!isLoaded) return <StakingAccountSkeleton />

  return <StakingAccountsTableWrapperData />
}

export const StakingAccountsTableWrapperData = () => {
  if (false) return <StakingAccountSkeleton />

  return <StakingAccountTable />
}

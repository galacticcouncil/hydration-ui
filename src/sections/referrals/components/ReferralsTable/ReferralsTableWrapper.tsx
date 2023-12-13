import { ReferralsTable } from "./ReferralsTable"
import { useReferralsTableData } from "./data/ReferralsTableData.utils"
import { ReferralsTableSkeleton } from "./skeleton/ReferralsTableSkeleton"
import { useRpcProvider } from "providers/rpcProvider"

export const ReferralsTableTableWrapper = () => {
  const { isLoaded } = useRpcProvider()

  if (!isLoaded) return <ReferralsTableSkeleton />

  return <ReferralsTableWrapperData />
}

export const ReferralsTableWrapperData = () => {
  const referrals = useReferralsTableData()

  if (referrals.isLoading && !referrals.data.length)
    return <ReferralsTableSkeleton />

  return <ReferralsTable data={referrals.data} />
}

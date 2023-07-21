import { useApiPromise } from "utils/api"
import { isApiLoaded } from "utils/helpers"
import { OmnipoolAssetsTable } from "sections/stats/components/OmnipoolAssetsTable/OmnipoolAssetsTable"
import { OmnipoolAssetsTableSkeleton } from "sections/stats/components/OmnipoolAssetsTable/skeleton/OmnipoolAssetsTableSkeleton"
import { useOmnipoolAssetDetails } from "sections/stats/StatsPage.utils"
import { useOmnipoolAssetsColumns } from "./OmnipoolAssetsTableWrapper.utils"

export const OmnipoolAssetsTableWrapper = () => {
  const api = useApiPromise()

  if (!isApiLoaded(api)) return <OmnipoolAssetsTableSkeleton />

  return <OmnipoolAssetsTableWrapperData />
}

export const OmnipoolAssetsTableWrapperData = () => {
  const omnipoolAssets = useOmnipoolAssetDetails()
  const columns = useOmnipoolAssetsColumns()

  if (omnipoolAssets.isLoading && !omnipoolAssets.data.length)
    return <OmnipoolAssetsTableSkeleton />

  return <OmnipoolAssetsTable columns={columns} data={omnipoolAssets.data} />
}

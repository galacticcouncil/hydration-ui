import { OmnipoolAssetsTable } from "./OmnipoolAssetsTable"
import { useOmnipoolAssetDetails } from "../../../../StatsPage.utils"
import { useApiPromise } from "utils/api"
import { isApiLoaded } from "utils/helpers"
import { OmnipoolAssetsTableSkeleton } from "./skeleton/OmnipoolAssetsTableSkeleton"

export const OmnipoolAssetsTableWrapper = () => {
  const api = useApiPromise()

  if (!isApiLoaded(api)) return <OmnipoolAssetsTableSkeleton />

  return <OmnipoolAssetsTableWrapperData />
}

export const OmnipoolAssetsTableWrapperData = () => {
  const omnipoolAssets = useOmnipoolAssetDetails()

  if (omnipoolAssets.isLoading && !omnipoolAssets.data.length)
    return <OmnipoolAssetsTableSkeleton />

  return <OmnipoolAssetsTable data={omnipoolAssets.data} />
}

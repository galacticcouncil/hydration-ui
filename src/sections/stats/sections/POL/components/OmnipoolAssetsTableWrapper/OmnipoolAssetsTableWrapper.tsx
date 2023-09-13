import { useApiPromise } from "utils/api"
import { isApiLoaded } from "utils/helpers"
import { OmnipoolAssetsTable } from "sections/stats/components/OmnipoolAssetsTable/OmnipoolAssetsTable"
import { OmnipoolAssetsTableSkeleton } from "sections/stats/components/OmnipoolAssetsTable/skeleton/OmnipoolAssetsTableSkeleton"
import { useOmnipoolAssetDetails } from "sections/stats/StatsPage.utils"
import { useOmnipoolAssetsColumns } from "./OmnipoolAssetsTableWrapper.utils"
import { useNavigate } from "@tanstack/react-location"
import { LINKS } from "utils/navigation"

export const OmnipoolAssetsTableWrapper = () => {
  const api = useApiPromise()

  if (!isApiLoaded(api)) return <OmnipoolAssetsTableSkeleton />

  return <OmnipoolAssetsTableWrapperData />
}

export const OmnipoolAssetsTableWrapperData = () => {
  const omnipoolAssets = useOmnipoolAssetDetails()
  const columns = useOmnipoolAssetsColumns()
  const navigate = useNavigate()

  if (omnipoolAssets.isLoading && !omnipoolAssets.data.length) {
    return <OmnipoolAssetsTableSkeleton />
  }

  const handleRowSelect = (assetId: string) => {
    navigate({
      to: LINKS.statsOmnipool,
      search: { asset: assetId },
    })
  }

  return (
    <OmnipoolAssetsTable
      columns={columns}
      data={omnipoolAssets.data}
      onRowSelect={handleRowSelect}
    />
  )
}

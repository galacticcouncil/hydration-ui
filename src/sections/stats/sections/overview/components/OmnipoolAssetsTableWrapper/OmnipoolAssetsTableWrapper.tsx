import { OmnipoolAssetsTable } from "sections/stats/components/OmnipoolAssetsTable/OmnipoolAssetsTable"
import { OmnipoolAssetsTableSkeleton } from "sections/stats/components/OmnipoolAssetsTable/skeleton/OmnipoolAssetsTableSkeleton"
import { useOmnipoolAssetDetails } from "sections/stats/StatsPage.utils"
import { useOmnipoolAssetsColumns } from "./OmnipoolAssetsTableWrapper.utils"
import { useNavigate } from "@tanstack/react-location"
import { useRpcProvider } from "providers/rpcProvider"

export const OmnipoolAssetsTableWrapper = () => {
  const { isLoaded } = useRpcProvider()

  if (!isLoaded) return <OmnipoolAssetsTableSkeleton />

  return <OmnipoolAssetsTableWrapperData />
}

export const OmnipoolAssetsTableWrapperData = () => {
  const omnipoolAssets = useOmnipoolAssetDetails()
  const columns = useOmnipoolAssetsColumns()
  const navigate = useNavigate()

  if (omnipoolAssets.isLoading && !omnipoolAssets.data.length)
    return <OmnipoolAssetsTableSkeleton />

  const handleRowSelect = (assetId: string) => {
    navigate({
      to: "omnipool",
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

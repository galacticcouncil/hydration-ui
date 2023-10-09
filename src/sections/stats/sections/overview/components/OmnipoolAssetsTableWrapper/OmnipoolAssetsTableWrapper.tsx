import { OmnipoolAssetsTable } from "sections/stats/components/OmnipoolAssetsTable/OmnipoolAssetsTable"
import { OmnipoolAssetsTableSkeleton } from "sections/stats/components/OmnipoolAssetsTable/OmnipoolAssetsTableSkeleton"
import { useOmnipoolAssetDetails } from "sections/stats/StatsPage.utils"
import { useOmnipoolAssetsColumns } from "./OmnipoolAssetsTableWrapper.utils"
import { useNavigate } from "@tanstack/react-location"
import { useRpcProvider } from "providers/rpcProvider"
import { useOmnipoolAssetsTableSkeleton } from "./OmnipoolAssetsTableSkeleton.utils"

export const OmnipoolAssetsTableWrapper = () => {
  const { isLoaded } = useRpcProvider()
  const skeleton = useOmnipoolAssetsTableSkeleton()

  if (!isLoaded) {
    return <OmnipoolAssetsTableSkeleton table={skeleton} />
  }

  return <OmnipoolAssetsTableWrapperData />
}

export const OmnipoolAssetsTableWrapperData = () => {
  const skeleton = useOmnipoolAssetsTableSkeleton()

  const omnipoolAssets = useOmnipoolAssetDetails()
  const columns = useOmnipoolAssetsColumns()
  const navigate = useNavigate()

  if (omnipoolAssets.isLoading && !omnipoolAssets.data.length)
    return <OmnipoolAssetsTableSkeleton table={skeleton} />

  const handleRowSelect = (assetId: string) => {
    navigate({
      to: "omnipool",
      search: { asset: assetId },
    })
  }
  console.log(omnipoolAssets.data)
  return (
    <OmnipoolAssetsTable
      columns={columns}
      data={omnipoolAssets.data}
      onRowSelect={handleRowSelect}
    />
  )
}

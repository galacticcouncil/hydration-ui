import { OmnipoolAssetsTable } from "sections/stats/components/OmnipoolAssetsTable/OmnipoolAssetsTable"
import { OmnipoolAssetsTableSkeleton } from "sections/stats/components/OmnipoolAssetsTable/OmnipoolAssetsTableSkeleton"
import { useOmnipoolAssetsColumns } from "./OmnipoolAssetsTableWrapper.utils"
import { useNavigate } from "@tanstack/react-location"
import { useOmnipoolAssetsTableSkeleton } from "./OmnipoolAssetsTableSkeleton.utils"
import { TUseOmnipoolAssetDetailsData } from "sections/stats/StatsPage.utils"

export const OmnipoolAssetsTableWrapperData = ({
  data,
  isLoading,
}: {
  data: TUseOmnipoolAssetDetailsData
  isLoading: boolean
}) => {
  const skeleton = useOmnipoolAssetsTableSkeleton()
  const columns = useOmnipoolAssetsColumns()
  const navigate = useNavigate()

  if (isLoading || !data.length)
    return <OmnipoolAssetsTableSkeleton table={skeleton} />

  const handleRowSelect = (assetId: string) => {
    navigate({
      to: "omnipool",
      search: { asset: assetId },
    })
  }

  return (
    <OmnipoolAssetsTable
      columns={columns}
      data={data}
      onRowSelect={handleRowSelect}
    />
  )
}

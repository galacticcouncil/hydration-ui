import { OmnipoolAssetsTable } from "sections/stats/components/OmnipoolAssetsTable/OmnipoolAssetsTable"
import { OmnipoolAssetsTableSkeleton } from "sections/stats/components/OmnipoolAssetsTable/OmnipoolAssetsTableSkeleton"
import { TUseOmnipoolAssetDetailsData } from "sections/stats/StatsPage.utils"
import { useOmnipoolAssetsColumns } from "./OmnipoolAssetsTableWrapper.utils"
import { useNavigate } from "@tanstack/react-location"
import { LINKS } from "utils/navigation"
import { useOmnipoolAssetsTableSkeleton } from "./OmnipoolAssetsTableSkeleton.utils"

export const OmnipoolAssetsTableWrapperData = ({
  data,
  isLoading,
}: {
  data: TUseOmnipoolAssetDetailsData
  isLoading: boolean
}) => {
  const columns = useOmnipoolAssetsColumns()
  const skeleton = useOmnipoolAssetsTableSkeleton()
  const navigate = useNavigate()

  if (isLoading || !data.length) {
    return <OmnipoolAssetsTableSkeleton table={skeleton} />
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
      data={data}
      onRowSelect={handleRowSelect}
    />
  )
}

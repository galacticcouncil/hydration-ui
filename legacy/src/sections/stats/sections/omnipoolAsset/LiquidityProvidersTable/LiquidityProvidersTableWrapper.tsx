import { LiquidityProvidersTableSkeleton } from "sections/stats/sections/omnipoolAsset/LiquidityProvidersTable/skeleton/LiquidityProvidersTableSkeleton"
import { LiquidityProvidersTable } from "./LiquidityProvidersTable"
import { useLiquidityProvidersTableData } from "./data/LiquidityProvidersTableData.utils"
import { useRpcProvider } from "providers/rpcProvider"

export const LiquidityProvidersTableWrapper = ({
  assetId,
}: {
  assetId: string
}) => {
  const { isLoaded } = useRpcProvider()

  if (!isLoaded) return <LiquidityProvidersTableSkeleton />

  return <LiquidityProvidersTableWrapperData assetId={assetId} />
}

export const LiquidityProvidersTableWrapperData = ({
  assetId,
}: {
  assetId: string
}) => {
  const table = useLiquidityProvidersTableData(assetId)

  if (table.isLoading) {
    return <LiquidityProvidersTableSkeleton />
  }

  return <LiquidityProvidersTable data={table.data} />
}

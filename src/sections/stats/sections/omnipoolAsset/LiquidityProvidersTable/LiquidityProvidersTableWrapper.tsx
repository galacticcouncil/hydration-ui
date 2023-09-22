import { LiquidityProvidersTable } from "./LiquidityProvidersTable"
import { useLiquidityProvidersTableData } from "./data/LiquidityProvidersTableData.utils"
import { useRpcProvider } from "providers/rpcProvider"

export const LiquidityProvidersTableWrapper = () => {
  const { isLoaded } = useRpcProvider()

  if (!isLoaded) return null

  return <LiquidityProvidersTableWrapperData />
}

export const LiquidityProvidersTableWrapperData = () => {
  const table = useLiquidityProvidersTableData()
  return <LiquidityProvidersTable data={table.data} />
}

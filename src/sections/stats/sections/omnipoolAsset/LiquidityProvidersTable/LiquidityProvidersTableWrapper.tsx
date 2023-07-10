import { LiquidityProvidersTable } from "./LiquidityProvidersTable"
import { useApiPromise } from "utils/api"
import { isApiLoaded } from "utils/helpers"
import { useLiquidityProvidersTableData } from "./data/LiquidityProvidersTableData.utils"

export const LiquidityProvidersTableWrapper = () => {
  const api = useApiPromise()

  if (!isApiLoaded(api)) return null

  return <LiquidityProvidersTableWrapperData />
}

export const LiquidityProvidersTableWrapperData = () => {
  const table = useLiquidityProvidersTableData()
  return <LiquidityProvidersTable data={table.data} />
}

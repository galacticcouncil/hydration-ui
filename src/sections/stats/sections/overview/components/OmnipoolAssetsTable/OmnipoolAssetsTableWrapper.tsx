import { OmnipoolAssetsTable } from "./OmnipoolAssetsTable"
import { useOmnipoolAssetsTableData } from "./data/OmnipoolAssetsTableData.utils"
import { useApiPromise } from "utils/api"
import { isApiLoaded } from "utils/helpers"

export const OmnipoolAssetsTableWrapper = () => {
  const api = useApiPromise()

  if (!isApiLoaded(api)) return null

  return <OmnipoolAssetsTableWrapperData />
}

export const OmnipoolAssetsTableWrapperData = () => {
  const omnipoolAssets = useOmnipoolAssetsTableData()

  if (omnipoolAssets.isLoading && !omnipoolAssets.data.length) return null

  return <OmnipoolAssetsTable data={omnipoolAssets.data} />
}

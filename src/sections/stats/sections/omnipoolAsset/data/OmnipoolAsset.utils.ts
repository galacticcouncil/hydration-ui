import { useAssetDetails } from "api/assetDetails"
import { useAssetMetaList } from "api/assetMeta"
import { useApiIds } from "api/consts"
import { useTradeVolumes } from "api/volume"
import { STABLECOIN_ID } from "utils/constants"

const withoutRefresh = true

export const useOmnipoolAssetData = (id: string) => {
  const apiIds = useApiIds()

  const volume = useTradeVolumes([id], withoutRefresh)

  const assetDetails = useAssetDetails(id)

  const metas = useAssetMetaList([STABLECOIN_ID, id])
}

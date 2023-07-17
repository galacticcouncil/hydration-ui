import { getAssetMeta } from "api/assetMeta"
import BigNumber from "bignumber.js"
import { BN_0 } from "utils/constants"

type Meta = Awaited<ReturnType<ReturnType<typeof getAssetMeta>>>
export const formatValue = (value?: BigNumber, meta?: Meta) => {
  if (!value) {
    return BN_0
  }

  const shiftBy = meta?.data ? meta.data.decimals.neg().toNumber() : 0
  return value.shiftedBy(shiftBy).dp(0)
}

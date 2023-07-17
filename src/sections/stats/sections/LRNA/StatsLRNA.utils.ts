import { getAssetMeta } from "api/assetMeta"
import BigNumber from "bignumber.js"

type Meta = Awaited<ReturnType<ReturnType<typeof getAssetMeta>>>
export const formatValue = (value: BigNumber, meta?: Meta) => {
  const shiftBy = meta?.data ? meta.data.decimals.neg().toNumber() : 0
  return value.shiftedBy(shiftBy).dp(0)
}

import { MyAsset } from "@/modules/wallet/assets/MyAssets/MyAssetsTable.columns"
import { NATIVE_ASSET_ID } from "@/utils/consts"
import { Compare, numericallyStrDesc } from "@/utils/sort"

const nativeFirst =
  <TProp>(
    selector: (asset: MyAsset) => TProp,
    comparer: Compare<TProp>,
  ): Compare<MyAsset> =>
  (asset, other) => {
    switch (true) {
      case asset.id === NATIVE_ASSET_ID:
        return -1
      case other.id === NATIVE_ASSET_ID:
        return 1
      default:
        return comparer(selector(asset), selector(other))
    }
  }

export const myAssetsSorter = nativeFirst(
  (asset) => asset.transferableDisplay,
  numericallyStrDesc,
)

export const myAssetsMobileSorter = nativeFirst(
  (asset) => asset.totalDisplay,
  numericallyStrDesc,
)

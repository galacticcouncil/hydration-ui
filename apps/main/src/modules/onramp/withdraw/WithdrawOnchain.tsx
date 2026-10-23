import { HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import { FC } from "react"

import { useHydrationAssetId } from "@/api/xcm"
import { XcmProvider } from "@/modules/xcm/transfer/XcmProvider"

import { WithdrawAssetSelection } from "./WithdrawAssetSelect.utils"
import { WithdrawHydration } from "./WithdrawHydration"
import { WithdrawOnchainSteps } from "./WithdrawOnchainSteps"

type WithdrawOnchainProps = {
  selectedAssetId?: string | null
  selectedRoute?: WithdrawAssetSelection | null
}

export const WithdrawOnchain: FC<WithdrawOnchainProps> = ({
  selectedAssetId,
  selectedRoute,
}) => {
  const chain = chainsMap.get(HYDRATION_CHAIN_KEY)
  const getHydrationAssetId = useHydrationAssetId()

  if (selectedRoute?.destinationChainKey === HYDRATION_CHAIN_KEY)
    return <WithdrawHydration assetId={selectedRoute.assetId} />

  const selectedAsset = selectedAssetId
    ? [...(chain?.assetsData.values() ?? [])].find(({ asset }) =>
        selectedRoute
          ? asset.key === selectedRoute.sourceAssetKey
          : getHydrationAssetId(asset, HYDRATION_CHAIN_KEY) === selectedAssetId,
      )?.asset
    : null

  const destinationChain = selectedRoute
    ? chainsMap.get(selectedRoute.destinationChainKey)
    : null
  const destinationAsset = selectedRoute
    ? [...(destinationChain?.assetsData.values() ?? [])].find(
        ({ asset }) => asset.key === selectedRoute.destinationAssetKey,
      )?.asset
    : null

  return (
    <XcmProvider
      formOptions={{
        syncWithQueryParams: false,
        defaultValues: {
          srcChain: chain ?? null,
          srcAsset: selectedAsset ?? null,
          destChain: destinationChain ?? null,
          destAsset: destinationAsset ?? null,
          destAddress: "",
          destAccount: null,
          srcAmount: "",
          destAmount: "",
        },
      }}
    >
      <WithdrawOnchainSteps selectedAssetId={selectedAssetId} />
    </XcmProvider>
  )
}

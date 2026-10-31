import { HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
import { FC } from "react"
import { useFormContext } from "react-hook-form"

import { useCrossChainConfigService } from "@/api/xcm"
import { useOnrampModal } from "@/modules/onramp/store/useOnrampModal"
import { OnrampScreen } from "@/modules/onramp/types"
import { WithdrawAssetSelect } from "@/modules/onramp/withdraw/WithdrawAssetSelect"
import { WithdrawAssetSelection } from "@/modules/onramp/withdraw/WithdrawAssetSelect.utils"
import { WithdrawConnectedAssets } from "@/modules/onramp/withdraw/WithdrawConnectedAssets"
import { WithdrawVariantEntry } from "@/modules/onramp/withdraw/WithdrawVariantEntry"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"

import { getWithdrawSelectionFormValues } from "./WithdrawOnchainAsset.utils"

type WithdrawOnchainAssetProps = { unsupportedSelection?: boolean }

export const WithdrawOnchainAsset: FC<WithdrawOnchainAssetProps> = () => {
  const { reset, watch, getValues } = useFormContext<XcmFormValues>()
  const destinationChain = watch("destChain")
  const config = useCrossChainConfigService()
  const flow = useOnrampModal((state) => state.withdrawFlow)
  const selection = useOnrampModal((state) => state.withdrawSelection)
  const back = () =>
    flow === "connected"
      ? useOnrampModal
          .getState()
          .paginateWithdraw(OnrampScreen.WithdrawOnchainWallet)
      : useOnrampModal.getState().setModal("withdraw")
  const select = (selection: WithdrawAssetSelection) => {
    const previous = getValues()
    if (
      flow !== "current" &&
      previous.srcChain?.key === HYDRATION_CHAIN_KEY &&
      previous.srcAsset?.key === selection.sourceAssetKey &&
      previous.destChain?.key === selection.destinationChainKey &&
      previous.destAsset?.key === selection.destinationAssetKey
    ) {
      useOnrampModal
        .getState()
        .paginateWithdraw(OnrampScreen.WithdrawOnchainForm)
      return
    }
    if (selection.destinationChainKey === HYDRATION_CHAIN_KEY) {
      useOnrampModal.getState().selectWithdrawAsset(selection)
      return
    }
    const sourceChain = config.chains.get(HYDRATION_CHAIN_KEY)
    if (!sourceChain) return
    const route = (
      config.routes.get(HYDRATION_CHAIN_KEY)?.getRoutes() ?? []
    ).find(
      ({ source, destination }) =>
        source.asset.key === selection.sourceAssetKey &&
        destination.chain.key === selection.destinationChainKey &&
        destination.asset.key === selection.destinationAssetKey,
    )
    if (!route) return
    reset((previous) =>
      getWithdrawSelectionFormValues(previous, {
        sourceChain,
        sourceAsset: route.source.asset,
        destinationChain: route.destination.chain,
        destinationAsset: route.destination.asset,
      }),
    )
    useOnrampModal.setState({
      withdrawAssetId: selection.assetId,
      withdrawSelection: selection,
    })
    useOnrampModal.getState().paginateWithdraw(OnrampScreen.WithdrawOnchainForm)
  }

  if (flow === "connected")
    return <WithdrawConnectedAssets onBack={back} onSelect={select} />

  if (flow !== "current")
    return (
      <WithdrawVariantEntry
        initialSelection={selection}
        onBack={back}
        onSelect={select}
      />
    )

  return (
    <WithdrawAssetSelect
      initialDestinationChainKey={destinationChain?.key}
      onBack={back}
      onSelect={select}
    />
  )
}

import { SummaryRow } from "@galacticcouncil/ui/components"
import { Ntt } from "@galacticcouncil/xc-core"
import { FC } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { useOnrampReceiveEstimate } from "@/modules/onramp/hooks/useOnrampReceiveEstimate"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { useXcmProvider } from "@/modules/xcm/transfer/hooks/useXcmProvider"
import {
  BRIDGE_LABEL,
  BRIDGE_TIME,
  getPrimaryBridgeTag,
  isOmniRoute,
} from "@/modules/xcm/transfer/utils/bridge"
import { XcmSummary } from "@/modules/xcm/transfer/XcmSummary"
import { XcmTag } from "@/states/transactions"

import { hasReceiveAssetChange } from "./OnrampTransferSummary.utils"

type OnrampTransferSummaryProps = {
  showReceive?: boolean
  receiveOnlyOnAssetChange?: boolean
}

export const OnrampTransferSummary: FC<OnrampTransferSummaryProps> = ({
  showReceive = true,
  receiveOnlyOnAssetChange = false,
}) => {
  const { t } = useTranslation(["onramp", "common"])
  const { selectedRoute, transfer } = useXcmProvider()
  const { watch } = useFormContext<XcmFormValues>()
  const [srcAsset, destChain, destAsset] = watch([
    "srcAsset",
    "destChain",
    "destAsset",
  ])
  const bridgeTag = selectedRoute ? getPrimaryBridgeTag(selectedRoute) : null
  const changedAsset = hasReceiveAssetChange(srcAsset, destAsset, selectedRoute)
  const bridgeLabel =
    receiveOnlyOnAssetChange && changedAsset && bridgeTag
      ? BRIDGE_LABEL[bridgeTag]
      : undefined
  const receiveEstimate = useOnrampReceiveEstimate()
  const estimatedTime =
    !isOmniRoute(selectedRoute) && bridgeTag
      ? BRIDGE_TIME[bridgeTag]
      : undefined
  const hasReceiveEstimate =
    receiveEstimate.isAvailable && receiveEstimate.amount !== ""
  const requiresClaim =
    bridgeTag === XcmTag.Wormhole &&
    !!destChain &&
    !!destAsset &&
    !!Ntt.find(destChain, destAsset.key)

  return (
    <XcmSummary withFeeContext hideUnavailable>
      {showReceive &&
        (!receiveOnlyOnAssetChange || changedAsset) &&
        destAsset &&
        (receiveEstimate.isLoading || hasReceiveEstimate) && (
          <SummaryRow
            label={t("transferSummary.receive")}
            loading={receiveEstimate.isLoading}
            content={
              transfer && hasReceiveEstimate
                ? t("common:currency", {
                    value: receiveEstimate.amount,
                    symbol: destAsset.originSymbol,
                  }) + (bridgeLabel ? ` (${bridgeLabel})` : "")
                : null
            }
          />
        )}
      {estimatedTime && (
        <SummaryRow
          label={t(
            requiresClaim
              ? "transferSummary.timeBeforeClaim"
              : "transferSummary.time",
          )}
          content={estimatedTime}
        />
      )}
    </XcmSummary>
  )
}

import { Separator, Summary } from "@galacticcouncil/ui/components"
import { Ntt } from "@galacticcouncil/xc-core"
import Big from "big.js"
import { useFormContext } from "react-hook-form"

import {
  useCrossChainDepositLimit,
  useCrossChainGlobalWithdrawLimit,
  useNttInboundLimit,
  useNttOutboundLimit,
} from "@/api/xcm"
import {
  CBreakerInboundLimitSummaryRow,
  CBreakerOutboundLimitSummaryRow,
  WormholeLimitSummaryRow,
} from "@/modules/xcm/transfer/components/LimitSummary"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { useXcmProvider } from "@/modules/xcm/transfer/hooks/useXcmProvider"
import {
  CBREAKER_INBOUND_LIMIT_ALERT_KEYS,
  CBREAKER_OUTBOUND_LIMIT_ALERT_KEYS,
  hasXcmLimitAlertKey,
  isNttMetered,
  WORMHOLE_LIMIT_ALERT_KEYS,
  XcmLimitAlertKey,
} from "@/modules/xcm/transfer/utils/limits"
import { useAssets } from "@/providers/assetsProvider"
import { useAssetPrice } from "@/states/displayAsset"
import { toDecimal } from "@/utils/formatting"

type XcmLimitsProps = {
  // The row must match the banner it lives in — always the alert's own key.
  alertKey: string
}

export const XcmLimits = ({ alertKey }: XcmLimitsProps) => {
  const { isLoading } = useXcmProvider()
  const { watch } = useFormContext<XcmFormValues>()
  const { native } = useAssets()

  const [srcAsset, destAsset, srcChain, destChain] = watch([
    "srcAsset",
    "destAsset",
    "srcChain",
    "destChain",
  ])

  const { data: depositLimit, isLoading: isLoadingDepositLimit } =
    useCrossChainDepositLimit(destAsset)

  const { data: globalWithdrawLimit, isLoading: isLoadingGlobalWithdrawLimit } =
    useCrossChainGlobalWithdrawLimit()

  const isNttRoute =
    !!srcChain &&
    !!srcAsset &&
    !!destChain &&
    !!destAsset &&
    Ntt.isKnown(srcChain, srcAsset) &&
    Ntt.isKnown(destChain, destAsset)

  const { data: outbound, isLoading: isLoadingOutbound } = useNttOutboundLimit(
    isNttRoute ? srcChain : null,
    isNttRoute ? srcAsset : null,
  )
  const { data: inbound, isLoading: isLoadingInbound } = useNttInboundLimit(
    isNttRoute ? destChain : null,
    isNttRoute ? destAsset : null,
    isNttRoute ? srcChain : null,
  )

  const isInbound = hasXcmLimitAlertKey(
    alertKey,
    CBREAKER_INBOUND_LIMIT_ALERT_KEYS,
  )
  const isOutbound = hasXcmLimitAlertKey(
    alertKey,
    CBREAKER_OUTBOUND_LIMIT_ALERT_KEYS,
  )
  const isWormhole = hasXcmLimitAlertKey(alertKey, WORMHOLE_LIMIT_ALERT_KEYS)

  const headroomAmount =
    globalWithdrawLimit?.headroom !== undefined
      ? toDecimal(globalWithdrawLimit.headroom, native.decimals)
      : ""

  const {
    price: nativePrice,
    isValid: isNativePriceValid,
    isLoading: isLoadingNativePrice,
  } = useAssetPrice(native.id)

  const headroomUsd = isNativePriceValid
    ? Big(headroomAmount || "0")
        .times(nativePrice)
        .toString()
    : null

  const showDepositRow = isInbound && !!depositLimit
  const showGlobalWithdrawRow =
    isOutbound && !!globalWithdrawLimit && !!headroomUsd
  // The NTT row shows the leg the alert is about.
  const bindingLeg =
    alertKey === XcmLimitAlertKey.WormholeInboundExceeded
      ? "inbound"
      : "outbound"
  const bindingNttLimit = bindingLeg === "inbound" ? inbound : outbound

  const showWormholeRow =
    isWormhole &&
    !!bindingNttLimit &&
    isNttMetered(bindingNttLimit) &&
    !!srcChain &&
    !!destChain &&
    !!srcAsset &&
    !!destAsset

  if (!showDepositRow && !showGlobalWithdrawRow && !showWormholeRow) {
    return null
  }

  return (
    <Summary separator={<Separator />} width="100%">
      {showDepositRow && (
        <CBreakerInboundLimitSummaryRow
          depositLimit={depositLimit}
          loading={isLoading || isLoadingDepositLimit}
        />
      )}
      {showGlobalWithdrawRow && (
        <CBreakerOutboundLimitSummaryRow
          globalWithdrawLimit={globalWithdrawLimit}
          headroomUsd={headroomUsd}
          loading={
            isLoading || isLoadingGlobalWithdrawLimit || isLoadingNativePrice
          }
        />
      )}
      {showWormholeRow && (
        <WormholeLimitSummaryRow
          outbound={outbound}
          inbound={inbound}
          bindingLeg={bindingLeg}
          srcChain={srcChain}
          destChain={destChain}
          srcAsset={srcAsset}
          destAsset={destAsset}
          loading={isLoading || isLoadingOutbound || isLoadingInbound}
        />
      )}
    </Summary>
  )
}

import {
  CollapsibleContent,
  CollapsibleRoot,
  Separator,
  Summary,
} from "@galacticcouncil/ui/components"
import Big from "big.js"
import { useFormContext } from "react-hook-form"

import {
  useCrossChainDepositLimit,
  useCrossChainGlobalWithdrawLimit,
  useWormholeRateLimit,
} from "@/api/xcm"
import {
  DepositLimitSummaryRow,
  GlobalWithdrawLimitSummaryRow,
  WormholeLimitSummaryRow,
} from "@/modules/xcm/transfer/components/LimitSummary"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { useXcmProvider } from "@/modules/xcm/transfer/hooks/useXcmProvider"
import { useXcmTransferConfigs } from "@/modules/xcm/transfer/hooks/useXcmTransferConfigs"
import {
  DEPOSIT_LIMIT_ALERT_KEYS,
  getWormholeEmitterChain,
  getWormholeEmitterId,
  GLOBAL_WITHDRAW_LIMIT_ALERT_KEYS,
  hasXcmLimitAlertKey,
  WORMHOLE_LIMIT_ALERT_KEYS,
} from "@/modules/xcm/transfer/utils/limits"
import { useAssets } from "@/providers/assetsProvider"
import { useAssetPrice } from "@/states/displayAsset"
import { toDecimal } from "@/utils/formatting"

export const XcmLimits = () => {
  const { transfer, alerts, isLoading } = useXcmProvider()
  const { formState, watch } = useFormContext<XcmFormValues>()
  const { native } = useAssets()

  const [srcAsset, destAsset, srcChain, destChain, bridgeProvider] = watch([
    "srcAsset",
    "destAsset",
    "srcChain",
    "destChain",
    "bridgeProvider",
  ])

  const config = useXcmTransferConfigs(
    srcAsset,
    srcChain,
    destChain,
    destAsset,
    bridgeProvider,
  )
  const { origin } = config ?? {}

  const { data: depositLimit, isLoading: isLoadingDepositLimit } =
    useCrossChainDepositLimit(destAsset)

  const { data: globalWithdrawLimit, isLoading: isLoadingGlobalWithdrawLimit } =
    useCrossChainGlobalWithdrawLimit()

  const { data: rateLimit, isLoading: isLoadingRateLimit } =
    useWormholeRateLimit(getWormholeEmitterId(srcChain, origin?.route))

  const hasDepositAlerts = alerts.some((a) =>
    hasXcmLimitAlertKey(a.key, DEPOSIT_LIMIT_ALERT_KEYS),
  )

  const hasGlobalWithdrawAlerts = alerts.some((a) =>
    hasXcmLimitAlertKey(a.key, GLOBAL_WITHDRAW_LIMIT_ALERT_KEYS),
  )

  const hasWormholeAlerts = alerts.some((a) =>
    hasXcmLimitAlertKey(a.key, WORMHOLE_LIMIT_ALERT_KEYS),
  )

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

  const emitterChain = getWormholeEmitterChain(srcChain, origin?.route)

  const showDepositRow = hasDepositAlerts && !!depositLimit
  const showGlobalWithdrawRow =
    hasGlobalWithdrawAlerts && !!globalWithdrawLimit && !!headroomUsd
  const showWormholeRow = hasWormholeAlerts && !!rateLimit && !!emitterChain

  const hasErrorAlerts = alerts.some((a) => a.severity === "error")
  const isTransferValid = !!transfer && formState.isValid && !hasErrorAlerts

  if (!showDepositRow && !showGlobalWithdrawRow && !showWormholeRow) {
    return null
  }

  return (
    <CollapsibleRoot open={isTransferValid}>
      <CollapsibleContent>
        <Summary
          separator={<Separator mx="-xl" />}
          px="xl"
          withLeadingSeparator
        >
          {showDepositRow && (
            <DepositLimitSummaryRow
              depositLimit={depositLimit}
              loading={isLoading || isLoadingDepositLimit}
            />
          )}
          {showGlobalWithdrawRow && (
            <GlobalWithdrawLimitSummaryRow
              globalWithdrawLimit={globalWithdrawLimit}
              headroomUsd={headroomUsd}
              loading={
                isLoading ||
                isLoadingGlobalWithdrawLimit ||
                isLoadingNativePrice
              }
            />
          )}
          {showWormholeRow && (
            <WormholeLimitSummaryRow
              rateLimit={rateLimit}
              emitterChain={emitterChain}
              loading={isLoading || isLoadingRateLimit}
            />
          )}
        </Summary>
      </CollapsibleContent>
    </CollapsibleRoot>
  )
}

import {
  OptionCard,
  Stack,
  ToggleGroup,
  ToggleGroupItem,
} from "@galacticcouncil/ui/components"
import { HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import { AssetAmount } from "@galacticcouncil/xc-core"
import Big from "big.js"
import { useMemo } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { unique } from "remeda"

import {
  SnowbridgeVariantFee,
  useSnowbridgeVariantFees,
} from "@/modules/xcm/transfer/hooks/useSnowbridgeVariantFees"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { useXcmProvider } from "@/modules/xcm/transfer/hooks/useXcmProvider"
import { BRIDGE_ICON, BRIDGE_TIME } from "@/modules/xcm/transfer/utils/bridge"
import { AssetPrice, useAssetsPrice } from "@/states/displayAsset"
import { XcmTag } from "@/states/transactions"
import { toDecimal } from "@/utils/formatting"

const hydration = chainsMap.get(HYDRATION_CHAIN_KEY)

enum SnowbridgeVersion {
  V2 = "v2",
  V1 = "v1",
}

const hydrationAssetId = (asset: AssetAmount | undefined): string => {
  if (!asset || !hydration) return ""
  const id = hydration.assetsData.get(asset.key)?.id
  return id !== undefined ? String(id) : ""
}

const formatTotalUsd = (
  fee: SnowbridgeVariantFee,
  getAssetPrice: (id: string) => AssetPrice,
): string | null => {
  if (!fee.sourceFee || !fee.bridgeFee) return null

  const parts: Array<readonly [string, string]> = [
    [
      hydrationAssetId(fee.sourceFee),
      toDecimal(fee.sourceFee.amount, fee.sourceFee.decimals),
    ],
    [
      hydrationAssetId(fee.bridgeFee),
      toDecimal(fee.bridgeFee.amount, fee.bridgeFee.decimals),
    ],
  ]

  let total = Big(0)
  let isValid = true
  for (const [id, value] of parts) {
    const price = getAssetPrice(id)
    if (!price.isValid) {
      isValid = false
      break
    }
    total = total.plus(Big(value || "0").times(price.price || "0"))
  }

  if (!isValid) return null
  return total.toString()
}

type SnowbridgeOptionsProps = {
  activeProvider: string | null
  hasSlow: boolean
  hasFast: boolean
  hasV1: boolean
  onSelect: (id: string) => void
}

export const SnowbridgeOptions: React.FC<SnowbridgeOptionsProps> = ({
  activeProvider,
  hasSlow,
  hasFast,
  hasV1,
  onSelect,
}) => {
  const { t } = useTranslation(["xcm", "common"])
  const { transferArgs } = useXcmProvider()
  const { watch } = useFormContext<XcmFormValues>()
  const srcAmount = watch("srcAmount")

  const { slow, fast, refetch } = useSnowbridgeVariantFees(
    transferArgs,
    srcAmount,
  )

  const assetIds = useMemo(
    () =>
      unique(
        [slow.sourceFee, slow.bridgeFee, fast.sourceFee, fast.bridgeFee]
          .map(hydrationAssetId)
          .filter((id) => id !== ""),
      ),
    [slow.sourceFee, slow.bridgeFee, fast.sourceFee, fast.bridgeFee],
  )
  const { getAssetPrice } = useAssetsPrice(assetIds)

  const slowTotal = formatTotalUsd(slow, getAssetPrice)
  const fastTotal = formatTotalUsd(fast, getAssetPrice)

  const version =
    activeProvider === XcmTag.SnowbridgeV1
      ? SnowbridgeVersion.V1
      : SnowbridgeVersion.V2
  const hasV2 = hasSlow || hasFast

  const select = (id: string) => {
    onSelect(id)
    refetch()
  }

  const handleVersionChange = (next: SnowbridgeVersion) => {
    if (next === version) return
    if (next === SnowbridgeVersion.V1) {
      select(XcmTag.SnowbridgeV1)
    } else {
      // Default the V2 group to the slow (standard) variant when available.
      select(hasSlow ? XcmTag.Snowbridge : XcmTag.SnowbridgeFast)
    }
  }

  return (
    <Stack gap="base">
      {hasV2 && hasV1 && (
        <ToggleGroup<SnowbridgeVersion>
          type="single"
          value={version}
          onValueChange={(value) => value && handleVersionChange(value)}
        >
          <ToggleGroupItem value={SnowbridgeVersion.V2}>
            {t("snowbridge.version.v2")}
          </ToggleGroupItem>
          <ToggleGroupItem value={SnowbridgeVersion.V1}>
            {t("snowbridge.version.v1")}
          </ToggleGroupItem>
        </ToggleGroup>
      )}

      {/* Time-variant cards only make sense when the selected version has a
          real sub-choice — i.e. V2 with both Fast and Slow (outbound). When a
          version has a single variant (inbound V2, or V1), the toggle button
          itself is the selector. */}
      {version === SnowbridgeVersion.V2 && hasFast && hasSlow && (
        <>
          <OptionCard
            label={t("snowbridge.variant.fast")}
            value={BRIDGE_TIME[XcmTag.SnowbridgeFast]}
            displayValue={
              fastTotal && !fast.isLoading
                ? t("snowbridge.variant.totalFee", { value: fastTotal })
                : undefined
            }
            icon={BRIDGE_ICON[XcmTag.SnowbridgeFast]}
            isActive={activeProvider === XcmTag.SnowbridgeFast}
            onClick={() => select(XcmTag.SnowbridgeFast)}
          />
          <OptionCard
            label={t("snowbridge.variant.slow")}
            value={BRIDGE_TIME[XcmTag.Snowbridge]}
            displayValue={
              slowTotal && !slow.isLoading
                ? t("snowbridge.variant.totalFee", { value: slowTotal })
                : undefined
            }
            icon={BRIDGE_ICON[XcmTag.Snowbridge]}
            isActive={activeProvider === XcmTag.Snowbridge}
            onClick={() => select(XcmTag.Snowbridge)}
          />
        </>
      )}
    </Stack>
  )
}

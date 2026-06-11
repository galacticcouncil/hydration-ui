import { OptionCard } from "@galacticcouncil/ui/components"
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
  onSelect: (id: string) => void
}

export const SnowbridgeOptions: React.FC<SnowbridgeOptionsProps> = ({
  activeProvider,
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

  const handleClick = (id: string) => {
    onSelect(id)
    refetch()
  }

  return (
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
        onClick={() => handleClick(XcmTag.SnowbridgeFast)}
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
        onClick={() => handleClick(XcmTag.Snowbridge)}
      />
    </>
  )
}

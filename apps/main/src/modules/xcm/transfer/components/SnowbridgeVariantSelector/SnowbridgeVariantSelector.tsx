import { Jetski, Swimmer } from "@galacticcouncil/ui/assets/icons"
import { Flex, Icon, Stack, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import { AssetAmount } from "@galacticcouncil/xc-core"
import Big from "big.js"
import { useMemo } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { pick, unique } from "remeda"
import { useShallow } from "zustand/shallow"

import {
  SnowbridgeVariantFee,
  useSnowbridgeVariantFees,
} from "@/modules/xcm/transfer/hooks/useSnowbridgeVariantFees"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { getXcmTransferArgs } from "@/modules/xcm/transfer/utils/transfer"
import {
  AssetPrice,
  useAssetsPrice,
  useDisplayAssetStore,
} from "@/states/displayAsset"
import { XcmTag } from "@/states/transactions"
import { toDecimal } from "@/utils/formatting"

import { SVariantOption } from "./SnowbridgeVariantSelector.styled"

const hydration = chainsMap.get(HYDRATION_CHAIN_KEY)

const hydrationAssetId = (asset: AssetAmount | undefined): string => {
  if (!asset || !hydration) return ""
  const id = hydration.assetsData.get(asset.key)?.id
  return id !== undefined ? String(id) : ""
}

const formatTotalUsd = (
  fee: SnowbridgeVariantFee,
  getAssetPrice: (id: string) => AssetPrice,
  formatCurrency: (value: string) => string,
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
  return formatCurrency(total.toString())
}

const VariantRow: React.FC<{
  label: string
  time: string
  icon: React.ComponentType
  fee: SnowbridgeVariantFee
  totalDisplay: string | null
  active: boolean
  onClick: () => void
}> = ({ label, time, icon, fee, totalDisplay, active, onClick }) => {
  const { t } = useTranslation("xcm")

  return (
    <SVariantOption type="button" active={active} onClick={onClick}>
      <Flex gap="base" align="center">
        <Icon component={icon} size="xl" />
        <Text fs="p3" fw={500} lh={1} color={getToken("text.high")}>
          {label}
        </Text>
      </Flex>
      <Flex direction="column" align="end" gap="xs">
        <Text fs="p5" fw={600} color={getToken("text.high")}>
          {time}
        </Text>
        {totalDisplay && !fee.isLoading && (
          <Text fs="p6" color={getToken("text.medium")}>
            {t("snowbridge.variant.totalFee", { value: totalDisplay })}
          </Text>
        )}
      </Flex>
    </SVariantOption>
  )
}

export const SnowbridgeVariantSelector = () => {
  const { t } = useTranslation(["xcm", "common"])
  const { account } = useAccount()
  const { watch, setValue } = useFormContext<XcmFormValues>()

  const [
    srcChain,
    srcAsset,
    destChain,
    destAsset,
    destAddress,
    bridgeProvider,
    srcAmount,
  ] = watch([
    "srcChain",
    "srcAsset",
    "destChain",
    "destAsset",
    "destAddress",
    "bridgeProvider",
    "srcAmount",
  ])

  const args = useMemo(
    () =>
      getXcmTransferArgs(account, {
        srcChain,
        srcAsset,
        destChain,
        destAsset,
        destAddress,
        bridgeProvider,
      } as XcmFormValues),
    [
      account,
      srcChain,
      srcAsset,
      destChain,
      destAsset,
      destAddress,
      bridgeProvider,
    ],
  )
  const enabled =
    !!args.srcAddress &&
    !!args.destAddress &&
    !!args.srcAsset &&
    !!args.destAsset

  const { slow, fast, refetch } = useSnowbridgeVariantFees(
    args,
    srcAmount,
    enabled,
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

  const { isRealUSD, isStableCoin, symbol } = useDisplayAssetStore(
    useShallow(pick(["isRealUSD", "isStableCoin", "symbol"])),
  )
  const isDollar = isRealUSD || isStableCoin

  const formatCurrency = (value: string) =>
    t("common:currency", {
      value,
      maximumFractionDigits: 2,
      ...(isDollar ? {} : { currency: symbol }),
    })

  const slowTotal = formatTotalUsd(slow, getAssetPrice, formatCurrency)
  const fastTotal = formatTotalUsd(fast, getAssetPrice, formatCurrency)

  const isFast = bridgeProvider === XcmTag.SnowbridgeFast

  const pickVariant = (tag: string) => {
    setValue("bridgeProvider", tag)
    refetch()
  }

  return (
    <Stack gap="base">
      <VariantRow
        label={t("snowbridge.variant.fast")}
        time={t("snowbridge.variant.fast.time")}
        icon={Jetski}
        fee={fast}
        totalDisplay={fastTotal}
        active={isFast}
        onClick={() => pickVariant(XcmTag.SnowbridgeFast)}
      />
      <VariantRow
        label={t("snowbridge.variant.slow")}
        time={t("snowbridge.variant.slow.time")}
        icon={Swimmer}
        fee={slow}
        totalDisplay={slowTotal}
        active={!isFast}
        onClick={() => pickVariant(XcmTag.Snowbridge)}
      />
    </Stack>
  )
}

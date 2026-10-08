import { Flex, Text, Tooltip } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { getAddressFromAssetId } from "@galacticcouncil/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { ApyPart } from "@/modules/money-market-v2/effectiveApy"
import { useResolveReserveDisplay } from "@/modules/money-market-v2/useReserveDisplay"

export type ApySide = "supply" | "borrow"

const APY_PART_LABELS = {
  stake: "stakeApy",
  nativeYield: "nativeYieldApy",
  lpFee: "apr.lpFee",
  incentive: "incentivesApr",
  vault: "vaultApr",
} as const satisfies Record<Exclude<ApyPart["kind"], "base">, string>

const ApyPartRow: FC<{ part: ApyPart; side: ApySide }> = ({ part, side }) => {
  const { t } = useTranslation()
  const resolveDisplay = useResolveReserveDisplay()

  const { kind, assetId, rate } = part
  // a part's asset is named as its reserve is; one the registry lacks has no label
  const asset = assetId
    ? resolveDisplay({
        underlyingAsset: getAddressFromAssetId(assetId),
        symbol: "",
        name: "",
      })
    : undefined
  const hasAsset = !!asset?.symbol
  const isFee = kind === "lpFee"

  return (
    <Flex align="center" justify="space-between" gap="s">
      <Flex gap="s" align="center">
        {hasAsset && (
          <>
            <AssetLogo id={asset.logoId} size="extra-small" />
            <Text fs="p5" fw={500} color={getToken("text.high")}>
              {asset.symbol}
            </Text>
          </>
        )}
        <Text
          fs={isFee ? "p6" : "p5"}
          fw={isFee ? 600 : 500}
          color={getToken(isFee ? "text.medium" : "text.high")}
          transform={hasAsset ? "none" : "uppercase"}
        >
          {kind === "base"
            ? t(side === "supply" ? "supplyApy" : "borrowApy")
            : t(APY_PART_LABELS[kind])}
        </Text>
      </Flex>
      <Text fs="p5" fw={500} color={getToken("text.high")}>
        {t("percent", { value: Number(rate) * 100 })}
      </Text>
    </Flex>
  )
}

/**
 * The parts of an effective APY, laid out as the legacy APY tooltip: the
 * rewards note, the LP fee, then one row per remaining part.
 */
export const ApyTooltip: FC<{
  parts: ReadonlyArray<ApyPart>
  side: ApySide
}> = ({ parts, side }) => {
  const { t } = useTranslation()

  const fees = parts.filter(({ kind }) => kind === "lpFee")
  const rest = parts.filter(({ kind }) => kind !== "lpFee")

  return (
    <Tooltip
      asChild
      preventDefault
      text={
        <Flex direction="column" gap="base">
          <Text fs="p6" fw={500} mb="s">
            {t("apy.rewards.description")}
          </Text>
          {fees.map((part, index) => (
            <ApyPartRow key={index} part={part} side={side} />
          ))}
          <Flex direction="column" gap="s">
            {rest.map((part, index) => (
              <ApyPartRow key={index} part={part} side={side} />
            ))}
          </Flex>
        </Flex>
      }
    />
  )
}

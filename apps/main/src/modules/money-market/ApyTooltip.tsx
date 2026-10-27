import { Box, Flex, Text, Tooltip } from "@galacticcouncil/ui/components"
import { useTheme } from "@galacticcouncil/ui/theme"
import { getToken, pxToRem } from "@galacticcouncil/ui/utils"
import { getAddressFromAssetId } from "@galacticcouncil/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useAssetColor } from "@/hooks/useAssetColor"
import { ApyPart } from "@/modules/money-market/effectiveApy"
import { useResolveReserveDisplay } from "@/modules/money-market/useReserveDisplay"

export type ApySide = "supply" | "borrow"

const APY_PART_LABELS = {
  stake: "stakeApy",
  nativeYield: "nativeYieldApy",
  lpFee: "apr.lpFee",
  incentive: "incentivesApr",
  vault: "vaultApr",
} as const satisfies Record<Exclude<ApyPart["kind"], "base">, string>

/** Pool-level parts, listed after the parts of the reserve's assets. */
const POOL_KINDS = new Set<ApyPart["kind"]>(["lpFee", "vault"])

/** A part with no asset keeps one colour wherever it sorts. */
const APY_PART_COLORS = {
  stake: "accents.alertAlt.primary",
  nativeYield: "accents.info.onPrimary",
  lpFee: "accents.success.emphasis",
  incentive: "text.tint.quart",
  vault: "text.tint.primary",
} as const satisfies Record<Exclude<ApyPart["kind"], "base">, string>

type ApyTooltipProps = {
  parts: ReadonlyArray<ApyPart>
  total: string
  side: ApySide
}

const ApyBreakdown: FC<ApyTooltipProps> = ({ parts, total, side }) => {
  const { t } = useTranslation()
  const { themeProps } = useTheme()
  const getAssetColor = useAssetColor()
  const resolveDisplay = useResolveReserveDisplay()

  // sort is stable, so the reserve's own parts keep their order
  const sorted = [...parts].sort(
    (a, b) => Number(POOL_KINDS.has(a.kind)) - Number(POOL_KINDS.has(b.kind)),
  )

  const baseLabel = t(side === "supply" ? "supplyApy" : "borrowApy")
  // a base rate with no asset takes its side's colour, as the cap circles do
  const baseColor =
    side === "supply"
      ? themeProps.accents.info.onPrimary
      : themeProps.colors.basePalette.coralPink

  const getColor = ({ kind, assetId }: ApyPart) => {
    if (assetId) return getAssetColor(assetId)
    if (kind === "base") return baseColor
    return getToken(APY_PART_COLORS[kind])
  }

  // a part's asset is named as its reserve is; one the registry lacks has no label
  const getSymbol = (assetId?: string) =>
    assetId
      ? resolveDisplay({
          underlyingAsset: getAddressFromAssetId(assetId),
          symbol: "",
          name: "",
        }).symbol
      : ""

  const percent = (rate: string) => t("percent", { value: Number(rate) * 100 })

  return (
    <Flex direction="column" gap="m">
      <Flex direction="column" gap="xs">
        <Text fs="p6" fw={500} color={getToken("text.medium")}>
          {baseLabel}
        </Text>
        <Text fs="h7" fw={600} font="primary" color={getToken("text.high")}>
          {percent(total)}
        </Text>
      </Flex>
      <Flex
        height={pxToRem(6)}
        gap={pxToRem(2)}
        borderRadius="xl"
        overflow="hidden"
      >
        {sorted.map((part, index) => (
          <Box
            key={index}
            flex={`${Number(part.rate) / (Number(total) || 1)} 0 0`}
            minWidth={pxToRem(2)}
            bg={getColor(part)}
          />
        ))}
      </Flex>
      <Flex direction="column" gap="s">
        {sorted.map((part, index) => {
          const symbol = getSymbol(part.assetId)

          return (
            <Flex key={index} align="center" justify="space-between" gap="m">
              <Flex align="center" gap="s">
                <Box
                  size={pxToRem(8)}
                  flexShrink={0}
                  borderRadius={pxToRem(2)}
                  bg={getColor(part)}
                />
                {symbol && (
                  <Text fs="p5" fw={500} color={getToken("text.high")}>
                    {symbol}
                  </Text>
                )}
                <Text fs="p5" fw={500} color={getToken("text.medium")}>
                  {part.kind === "base"
                    ? baseLabel
                    : t(APY_PART_LABELS[part.kind])}
                </Text>
              </Flex>
              <Text
                fs="p5"
                fw={500}
                color={getToken("text.high")}
                fontVariantNumeric="tabular-nums"
              >
                {percent(part.rate)}
              </Text>
            </Flex>
          )
        })}
      </Flex>
      <Text fs="p6" color={getToken("text.medium")}>
        {t("apy.rewards.description")}
      </Text>
    </Flex>
  )
}

/**
 * The parts of an effective APY: the total, a bar of each part's share, then
 * one row per part keyed by its asset's colour, pool-level parts last.
 */
export const ApyTooltip: FC<ApyTooltipProps> = (props) => (
  <Tooltip asChild preventDefault text={<ApyBreakdown {...props} />} />
)

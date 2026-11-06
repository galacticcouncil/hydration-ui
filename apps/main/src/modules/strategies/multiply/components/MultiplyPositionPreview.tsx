import {
  Flex,
  Grid,
  Paper,
  Separator,
  Stack,
  Text,
  Tooltip,
  TooltipIcon,
} from "@galacticcouncil/ui/components"
import { getToken, pxToRem } from "@galacticcouncil/ui/utils"
import { Fragment } from "react"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { HealthFactorNumber } from "@/modules/money-market/health-factor/HealthFactorNumber"
import {
  SAmountReveal,
  SApyText,
} from "@/modules/strategies/multiply/components/MultiplyPositionPreview.styled"
import { apyColor } from "@/modules/strategies/multiply/components/MultiplyStat"
import { RiskBadge } from "@/modules/strategies/multiply/components/RiskBadge"
import { type PairRisk } from "@/modules/strategies/multiply/hooks/usePairRiskLevels"
import { type projectMultiplyPosition } from "@/modules/strategies/multiply/utils/projection"

export type Asset = { id: string; symbol: string; logoId: string }

type MultiplyPositionPreviewProps = {
  amount: number
  leverage: number
  collateral: Asset
  debt: Asset
  supplyApy: number
  borrowApy: number
  projection: ReturnType<typeof projectMultiplyPosition>
  risk: PairRisk | null
  eModeLabel: string | null
}

export const MultiplyPositionPreview: React.FC<
  MultiplyPositionPreviewProps
> = ({
  amount,
  leverage,
  collateral,
  debt,
  supplyApy,
  borrowApy,
  projection,
  risk,
  eModeLabel,
}) => {
  const { t } = useTranslation(["strategies", "common"])

  return (
    <MultiplyAssetsCard
      collateral={collateral}
      debt={debt}
      supplyApy={supplyApy}
      borrowApy={borrowApy}
      amounts={
        amount > 0 ? [projection.collateral, projection.debt] : undefined
      }
    >
      <PreviewRow
        label={t("multiply.open.netApy")}
        value={
          <Flex align="center" gap="xs">
            <Text fs="p5" fw={600} lh={1} color={apyColor(projection.netApy)}>
              {t("common:percent", { value: projection.netApy * 100 })}
            </Text>
            <Tooltip
              text={
                <NetApyBreakdown
                  leverage={leverage}
                  collateral={collateral}
                  debt={debt}
                  supplyApy={supplyApy}
                  borrowApy={borrowApy}
                  netApy={projection.netApy}
                />
              }
            >
              <TooltipIcon size="0.75em" color={getToken("text.low")} />
            </Tooltip>
          </Flex>
        }
      />
      <PreviewRow
        label={t("common:healthFactor")}
        value={
          <Text fs="p5" fw={600} lh={1}>
            <HealthFactorNumber value={projection.healthFactor.toString()} />
          </Text>
        }
      />
      {eModeLabel && (
        <PreviewRow label={t("multiply.custom.eMode")} value={eModeLabel} />
      )}
      {risk && (
        <PreviewRow
          label={t("multiply.risk.column")}
          value={
            <RiskBadge
              risk={risk}
              collateral={collateral.symbol}
              debt={debt.symbol}
              hf={projection.healthFactor}
              leverage={leverage}
            />
          }
        />
      )}
    </MultiplyAssetsCard>
  )
}

/** You supply / you borrow, then the caller's rows below a divider. */
export const MultiplyAssetsCard: React.FC<{
  collateral: Asset
  debt: Asset
  supplyApy: number
  borrowApy: number
  /** Collateral and debt amounts; without them only the APYs show. */
  amounts?: [number, number]
  children: React.ReactNode
}> = ({ collateral, debt, supplyApy, borrowApy, amounts, children }) => {
  const { t } = useTranslation(["strategies", "common"])

  return (
    <Paper p="m" shadow={false}>
      <Stack gap="m">
        <AssetRow
          label={t("multiply.open.supply")}
          asset={collateral}
          apy={supplyApy}
          value={amounts?.[0] ?? 0}
          isEmpty={!amounts}
        />
        <AssetRow
          label={t("multiply.open.borrow")}
          asset={debt}
          apy={borrowApy}
          value={amounts?.[1] ?? 0}
          isEmpty={!amounts}
        />
        <Separator mx="-m" />
        <Stack gap="xs">{children}</Stack>
      </Stack>
    </Paper>
  )
}

export const PreviewRow = ({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) => (
  // a p5 line (24px), so a row holding a badge matches the rest
  <Flex justify="space-between" align="center" sx={{ minHeight: pxToRem(24) }}>
    <Text fs="p6" color={getToken("text.medium")}>
      {label}
    </Text>
    {typeof value === "string" ? (
      <Text fs="p5" fw={600} lh={1} color={getToken("text.high")}>
        {value}
      </Text>
    ) : (
      value
    )}
  </Flex>
)

const AssetRow = ({
  label,
  asset,
  apy,
  value,
  isEmpty,
}: {
  label: string
  asset: Asset
  apy: number
  value: number
  isEmpty: boolean
}) => {
  const { t } = useTranslation(["strategies", "common"])

  return (
    <Flex justify="space-between" align="center">
      <Stack gap="xs">
        <Text fs="p6" color={getToken("text.medium")}>
          {label}
        </Text>
        <Flex align="center" gap="s">
          <AssetLogo id={asset.logoId} size="small" />
          <Text fs="p5" fw={600} color={getToken("text.high")}>
            {asset.symbol}
          </Text>
        </Flex>
      </Stack>
      <Stack align="end">
        <SAmountReveal isEmpty={isEmpty}>
          <Text fs="p5" fw={600} color={getToken("text.high")} align="end">
            {t("common:currency", {
              prefix: t("common:approx.short"),
              value,
              symbol: asset.symbol,
            })}
          </Text>
        </SAmountReveal>
        <SApyText
          fs={isEmpty ? "p5" : "p6"}
          fw={isEmpty ? 600 : 400}
          color={isEmpty ? getToken("text.high") : getToken("text.medium")}
        >
          {t("multiply.open.apy", { value: apy * 100 })}
        </SApyText>
      </Stack>
    </Flex>
  )
}

const NetApyBreakdown = ({
  leverage,
  collateral,
  debt,
  supplyApy,
  borrowApy,
  netApy,
}: {
  leverage: number
  collateral: Asset
  debt: Asset
  supplyApy: number
  borrowApy: number
  netApy: number
}) => {
  const { t } = useTranslation(["strategies", "common"])
  const percent = (value: number) => t("common:percent", { value: value * 100 })
  const multiplier = (value: number) =>
    t("common:number", { value, maximumFractionDigits: 2 })
  const rows = [
    {
      asset: collateral,
      label: t("multiply.open.netApyTooltip.supply"),
      apy: supplyApy,
      multiplier: leverage,
      value: leverage * supplyApy,
    },
    {
      asset: debt,
      label: t("multiply.open.netApyTooltip.borrow"),
      apy: -borrowApy,
      multiplier: leverage - 1,
      value: -(leverage - 1) * borrowApy,
    },
  ]

  return (
    <Stack gap="s">
      <Grid
        columnTemplate="auto 1fr auto auto auto auto auto"
        gap="s"
        align="center"
        color={getToken("text.medium")}
        sx={{
          fontSize: "p6",
          fontVariantNumeric: "tabular-nums",
          textAlign: "end",
        }}
      >
        {rows.map((row) => (
          <Fragment key={row.asset.id}>
            <AssetLogo id={row.asset.logoId} size="small" />
            <Text fs="p6" color={getToken("text.high")} align="start">
              {row.label}
            </Text>
            <span>{percent(row.apy)}</span>
            <span>×</span>
            <span>{multiplier(row.multiplier)}</span>
            <span>=</span>
            <Text fs="p6" fw={600} color={apyColor(row.value)}>
              {percent(row.value)}
            </Text>
          </Fragment>
        ))}
      </Grid>
      <Separator />
      <Flex justify="space-between" gap="l">
        <Text fs="p6" fw={600}>
          {t("multiply.open.netApy")}
        </Text>
        <Text fs="p6" fw={600} color={apyColor(netApy)}>
          {percent(netApy)}
        </Text>
      </Flex>
      <Text fs="p6" color={getToken("text.medium")}>
        {t("multiply.open.netApyTooltip.description")}
      </Text>
    </Stack>
  )
}

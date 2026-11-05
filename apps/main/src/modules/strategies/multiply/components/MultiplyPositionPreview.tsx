import {
  Box,
  Flex,
  Paper,
  Separator,
  Stack,
  Text,
  Tooltip,
  TooltipIcon,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { Fragment } from "react"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { HealthFactorNumber } from "@/modules/money-market/health-factor/HealthFactorNumber"
import { type projectMultiplyPosition } from "@/modules/strategies/multiply/utils/projection"

const DURATION = "0.2s"

type Asset = { id: string; symbol: string }

type MultiplyPositionPreviewProps = {
  amount: number
  leverage: number
  collateral: Asset
  debt: Asset
  supplyApy: number
  borrowApy: number
  projection: ReturnType<typeof projectMultiplyPosition>
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
}) => {
  const { t } = useTranslation(["strategies", "common"])
  const isEmpty = amount <= 0

  return (
    <Paper p="m" shadow={false}>
      <Stack gap="m">
        <AssetRow
          label={t("multiply.open.supply")}
          asset={collateral}
          apy={supplyApy}
          value={projection.collateral}
          isEmpty={isEmpty}
        />
        <AssetRow
          label={t("multiply.open.borrow")}
          asset={debt}
          apy={borrowApy}
          value={projection.debt}
          isEmpty={isEmpty}
        />
        <Separator mx="-m" />
        <Stack gap="s">
          <Flex justify="space-between" align="center">
            <Text fs="p6" color={getToken("text.medium")}>
              {t("multiply.open.netApy")}
            </Text>
            <Flex align="center" gap="xs">
              <Text
                fs="p5"
                fw={600}
                color={
                  projection.netApy > 0
                    ? getToken("accents.success.emphasis")
                    : getToken("text.high")
                }
              >
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
          </Flex>
          <Flex justify="space-between" align="center">
            <Text fs="p6" color={getToken("text.medium")}>
              {t("common:healthFactor")}
            </Text>
            <Text fs="p5" fw={600}>
              <HealthFactorNumber value={projection.healthFactor.toString()} />
            </Text>
          </Flex>
        </Stack>
      </Stack>
    </Paper>
  )
}

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
          <AssetLogo id={asset.id} size="small" />
          <Text fs="p5" fw={600} color={getToken("text.high")}>
            {asset.symbol}
          </Text>
        </Flex>
      </Stack>
      <Stack align="end">
        {/* Collapses to zero height with no amount, so the APY line sits alone. */}
        <Box
          display="grid"
          sx={{
            gridTemplateRows: isEmpty ? "0fr" : "1fr",
            opacity: isEmpty ? 0 : 1,
            transition: `grid-template-rows ${DURATION}, opacity ${DURATION}`,
            "@media (prefers-reduced-motion: reduce)": { transition: "none" },
          }}
        >
          <Box overflow="hidden" sx={{ minHeight: 0 }}>
            <Text fs="p5" fw={600} color={getToken("text.high")} align="end">
              {t("common:currency", {
                prefix: t("common:approx.short"),
                value,
                symbol: asset.symbol,
              })}
            </Text>
          </Box>
        </Box>
        <Text
          fs={isEmpty ? "p5" : "p6"}
          fw={isEmpty ? 600 : 400}
          color={isEmpty ? getToken("text.high") : getToken("text.medium")}
          sx={{
            transition: `font-size ${DURATION}, line-height ${DURATION}, color ${DURATION}`,
            "@media (prefers-reduced-motion: reduce)": { transition: "none" },
          }}
        >
          {t("multiply.open.apy", { value: apy * 100 })}
        </Text>
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
  const signColor = (value: number) =>
    value >= 0
      ? getToken("accents.success.emphasis")
      : getToken("accents.danger.emphasis")
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
      <Box
        display="grid"
        alignItems="center"
        sx={{
          gridTemplateColumns: "auto 1fr auto auto auto auto auto",
          columnGap: "s",
          rowGap: "s",
          fontSize: "p6",
          fontVariantNumeric: "tabular-nums",
          textAlign: "end",
          color: getToken("text.medium"),
        }}
      >
        {rows.map((row) => (
          <Fragment key={row.asset.id}>
            <AssetLogo id={row.asset.id} size="small" />
            <Text fs="p6" color={getToken("text.high")} align="start">
              {row.label}
            </Text>
            <span>{percent(row.apy)}</span>
            <span>×</span>
            <span>{multiplier(row.multiplier)}</span>
            <span>=</span>
            <Text fs="p6" fw={600} color={signColor(row.value)}>
              {percent(row.value)}
            </Text>
          </Fragment>
        ))}
      </Box>
      <Separator />
      <Flex justify="space-between" gap="l">
        <Text fs="p6" fw={600}>
          {t("multiply.open.netApy")}
        </Text>
        <Text fs="p6" fw={600} color={signColor(netApy)}>
          {percent(netApy)}
        </Text>
      </Flex>
      <Text fs="p6" color={getToken("text.medium")}>
        {t("multiply.open.netApyTooltip.description")}
      </Text>
    </Stack>
  )
}

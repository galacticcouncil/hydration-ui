import {
  Flex,
  Separator,
  ToggleGroup,
  ToggleGroupItem,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import Big from "big.js"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { PoolStatsShell } from "@/modules/liquidity/components/PoolDetailsValues/PoolStatsShell"
import { LiquidityDistribution } from "@/modules/liquidity/components/VaultDetails/LiquidityDistribution"
import { VaultPriceChart } from "@/modules/liquidity/components/VaultDetails/VaultPriceChart"
import { feeTierPercent, VaultTable } from "@/modules/liquidity/Vaults.utils"

type VaultChart = "distribution" | "price"

export const VaultStats = ({ vault }: { vault: VaultTable }) => {
  const { t } = useTranslation(["common", "liquidity"])
  const [chart, setChart] = useState<VaultChart>("distribution")

  const { isMobile } = useBreakpoints()

  const options: ReadonlyArray<{ id: VaultChart; label: string }> = [
    { id: "distribution", label: t("liquidity:vaults.chart.liquidity") },
    { id: "price", label: t("liquidity:vaults.chart.price") },
  ]

  return (
    <PoolStatsShell
      sx={{ mb: "xl" }}
      values={<VaultValues vault={vault} />}
      renderChartHeader={() => (
        <ToggleGroup
          type="single"
          fullWidth={isMobile}
          size={isMobile ? "small" : "medium"}
          value={chart}
          onValueChange={(value) => value && setChart(value as VaultChart)}
        >
          {options.map((option) => (
            <ToggleGroupItem key={option.id} value={option.id}>
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      )}
      renderChart={() =>
        chart === "distribution" ? (
          <LiquidityDistribution vault={vault} />
        ) : (
          <VaultPriceChart vault={vault} />
        )
      }
    />
  )
}

const VaultValues = ({ vault }: { vault: VaultTable }) => {
  const { t } = useTranslation(["common", "liquidity"])
  const state = vault.vault

  const sharePrice =
    state && state.totalSupply > 0n && vault.vaultTvlDisplay
      ? Big(vault.vaultTvlDisplay).div(
          Big(state.totalSupply.toString()).div(Big(10).pow(18)),
        )
      : undefined

  const bandWidthPct =
    state && state.baseUpper > state.baseLower
      ? (Math.pow(1.0001, state.baseUpper - state.baseLower) - 1) * 100
      : undefined

  const rows = [
    {
      label: t("liquidity:totalValueLocked"),
      value: t("currency", { value: Number(vault.vaultTvlDisplay ?? 0) }),
    },
    {
      label: t("liquidity:vaults.stats.poolLiquidity"),
      value: t("currency", { value: Number(vault.tvlDisplay ?? 0) }),
    },
    {
      label: t("liquidity:vaults.stats.sharePrice"),
      value: sharePrice
        ? t("currency", { value: sharePrice, maximumFractionDigits: null })
        : "-",
    },
    {
      label: t("liquidity:vaults.stats.poolFee"),
      value: t("percent", { value: feeTierPercent(vault.feeTier) }),
    },
    {
      label: t("liquidity:vaults.stats.utilisation"),
      value: t(`liquidity:vaults.status.${vault.status}`),
    },
    {
      label: t("liquidity:vaults.stats.band"),
      value: bandWidthPct ? t("percent", { value: bandWidthPct }) : "-",
    },
  ]

  return (
    <Flex
      direction="column"
      minWidth="16.25rem"
      maxWidth={["none", "none", "22.5rem"]}
      gap="xl"
    >
      {rows.map((row, index) => (
        <Flex key={row.label} direction="column" gap="xl">
          {index > 0 && <Separator mx="-xl" />}
          <ValueStats label={row.label} value={row.value} wrap />
        </Flex>
      ))}
    </Flex>
  )
}

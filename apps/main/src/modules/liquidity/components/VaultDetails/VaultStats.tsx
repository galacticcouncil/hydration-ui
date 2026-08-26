import {
  Flex,
  Paper,
  Separator,
  SliderTabs,
  SliderTabsOption,
  ValueStats,
} from "@galacticcouncil/ui/components"
import Big from "big.js"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { LiquidityDistribution } from "@/modules/liquidity/components/VaultDetails/LiquidityDistribution"
import { VaultPriceChart } from "@/modules/liquidity/components/VaultDetails/VaultPriceChart"
import { formatFeeTier, VaultTable } from "@/modules/liquidity/Vaults.utils"

// APRs, fees and volume are left out: they need swap or share-price history
// from the indexer, and zeros here would read as measurements.
export const VaultStats = ({ vault }: { vault: VaultTable }) => (
  <Flex gap="xl" direction={["column", "column", "row"]} sx={{ mb: "xl" }}>
    <Paper
      p={["secondary", "primary"]}
      sx={{ flex: 1, flexBasis: "31.25rem", minWidth: 0 }}
    >
      <VaultCharts vault={vault} />
    </Paper>

    <Paper p={["secondary", "primary"]} sx={{ flex: 0, flexBasis: "22.5rem" }}>
      <VaultValues vault={vault} />
    </Paper>
  </Flex>
)

type VaultChart = "distribution" | "price"

const VaultCharts = ({ vault }: { vault: VaultTable }) => {
  const { t } = useTranslation(["common", "liquidity"])
  const [chart, setChart] = useState<VaultChart>("distribution")
  const options: ReadonlyArray<SliderTabsOption<VaultChart>> = [
    {
      id: "distribution",
      label: t("liquidity:vaults.chart.liquidity"),
    },
    {
      id: "price",
      label: t("liquidity:vaults.chart.price"),
    },
  ]

  return (
    <Flex direction="column" gap="l">
      <Flex>
        <SliderTabs
          options={options}
          selected={chart}
          onSelect={(option) => setChart(option.id)}
        />
      </Flex>

      {chart === "distribution" ? (
        <LiquidityDistribution vault={vault} />
      ) : (
        <VaultPriceChart vault={vault} />
      )}
    </Flex>
  )
}

const VaultValues = ({ vault }: { vault: VaultTable }) => {
  const { t } = useTranslation(["common", "liquidity"])
  const state = vault.vault

  const sharePrice =
    state && state.totalSupply > 0n && vault.vaultTvlDisplay
      ? Big(vault.vaultTvlDisplay)
          .div(Big(state.totalSupply.toString()).div(Big(10).pow(18)))
          .toFixed(4)
      : undefined

  const bandWidthPct =
    state && state.baseUpper > state.baseLower
      ? (
          (Math.pow(1.0001, state.baseUpper - state.baseLower) - 1) *
          100
        ).toFixed(1)
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
      value: sharePrice ? `$${sharePrice}` : "-",
    },
    {
      label: t("liquidity:vaults.stats.poolFee"),
      value: `${formatFeeTier(vault.feeTier)}%`,
    },
    {
      label: t("liquidity:vaults.stats.utilisation"),
      value: t(`liquidity:vaults.status.${vault.status}`),
    },
    {
      label: t("liquidity:vaults.stats.band"),
      value: bandWidthPct ? `${bandWidthPct}%` : "-",
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
          {index > 0 && <Separator mx={-20} />}
          <ValueStats label={row.label} value={row.value} wrap />
        </Flex>
      ))}
    </Flex>
  )
}

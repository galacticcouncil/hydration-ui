import { Box, Flex, Paper, Separator, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { HOLLAR_ASSET_ID } from "@galacticcouncil/utils"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"

import { STRATEGY, VAULT_ADDRESS } from "../constants"
import { useHdclReserveConfig } from "../hooks/useHdclPoolPosition"
import { formatNumber } from "../utils/format"
import { DecentralLogo } from "./DecentralLogo"

interface VaultStats {
  totalAssets: number
  exchangeRate: number
  apr: number
}

interface Props {
  vaultStats: VaultStats
}

const truncateAddress = (addr: string) =>
  `${addr.slice(0, 6)}...${addr.slice(-6)}`

const formatTvl = (hollarAmount: number) => {
  // HOLLAR is dollar-pegged so total HOLLAR ≈ TVL in USD.
  if (hollarAmount >= 1_000_000) return `$${formatNumber(hollarAmount / 1_000_000, 2)}m`
  if (hollarAmount >= 1_000) return `$${formatNumber(hollarAmount / 1_000, 1)}k`
  return `$${formatNumber(hollarAmount, 0)}`
}

/**
 * Strategy overview card — Figma 6402:24464.
 *
 * Top row: TVL + Max Net APY. The Figma includes a third "Yield cycle"
 * column ("Bi-monthly") — intentionally dropped during implementation
 * because this product doesn't have a fixed yield cycle in the same shape
 * as the design's reference strategy.
 * Bottom rows: Collateral / Debt assets, contract address, Max LTV / Liq LTV.
 *
 * Max LTV / Liquidation LTV are read live from the HDCL Aave pool's reserve
 * configuration (single uint256 bitmap, decoded in `useHdclReserveConfig`).
 * Falls back to the `STRATEGY` static values on first paint or RPC failure
 * so the card always renders something sensible.
 */
export const StrategyOverview = ({ vaultStats }: Props) => {
  const { t } = useTranslation("hdcl")
  const tvl = vaultStats.totalAssets * vaultStats.exchangeRate
  const { data: reserveConfig } = useHdclReserveConfig()
  const maxLtvPct = reserveConfig?.maxLtvPct ?? STRATEGY.maxLtvPct
  const liqLtvPct =
    reserveConfig?.liquidationThresholdPct ?? STRATEGY.liquidationLtvPct

  return (
    <Paper variant="plain" p={20}>
      <Text font="primary" fs="h6" fw={500} color={getToken("text.high")}>
        {t("overview.title")}
      </Text>

      {/* Top stats row */}
      <Flex justify="space-between" align="flex-end" gap={20} sx={{ mt: "l" }}>
        <Flex direction="column" gap={4}>
          <Text fs="p5" fw={600} color={getToken("text.low")} transform="uppercase">
            {t("overview.tvl")}
          </Text>
          <Flex align="center" gap={8}>
            <DecentralLogo size={28} />
            <Text font="primary" fs="h5" fw={500} color={getToken("text.high")}>
              {formatTvl(tvl)}
            </Text>
          </Flex>
        </Flex>
        <Flex direction="column" gap={4} align="flex-end">
          <Text fs="p5" fw={600} color={getToken("text.low")} transform="uppercase">
            {t("overview.maxNetApy")}
          </Text>
          <Text
            font="primary"
            fs="h5"
            fw={500}
            color="accents.success.emphasis"
          >
            +{formatNumber(vaultStats.apr, 1)}%
          </Text>
        </Flex>
      </Flex>

      <Separator sx={{ my: "l" }} />

      {/* Bottom: two-column data grid (left = asset/contract, right = LTVs) */}
      <Flex gap={20} sx={{ flexWrap: "wrap" }}>
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <DataRow
            label={t("overview.collateralAsset")}
            value={
              <Flex align="center" gap={6}>
                <DecentralLogo size={20} />
                <Text fs="p4" fw={500} color={getToken("text.high")}>
                  {t("strategy.collateralAsset")}
                </Text>
              </Flex>
            }
          />
          <DataRow
            label={t("overview.debtAsset")}
            value={
              <Flex align="center" gap={6}>
                <AssetLogo id={HOLLAR_ASSET_ID} size="small" />
                <Text fs="p4" fw={500} color={getToken("text.high")}>
                  {t("strategy.debtAsset")}
                </Text>
              </Flex>
            }
          />
          <DataRow
            label={t("overview.contractAddress")}
            value={
              <a
                href={STRATEGY.explorerUrl}
                target="_blank"
                rel="noreferrer"
                css={(theme: any) => ({
                  color: theme.text?.tint?.secondary || theme.text?.high,
                  textDecoration: "none",
                })}
              >
                {truncateAddress(VAULT_ADDRESS)} ↗
              </a>
            }
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <DataRow
            label={t("overview.maxLtv")}
            value={`${maxLtvPct.toFixed(1)}%`}
          />
          <DataRow
            label={t("overview.liquidationLtv")}
            value={`${liqLtvPct.toFixed(1)}%`}
          />
        </Box>
      </Flex>
    </Paper>
  )
}

const DataRow = ({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) => (
  <Flex justify="space-between" align="center" sx={{ py: "s" }}>
    <Text fs="p5" color={getToken("text.medium")}>
      {label}
    </Text>
    {/* Value can be a string OR a Flex/component (logo+text). We render it
        through a `<Box>` rather than `<Text>` so block-level children don't
        get nested inside a `<p>` (which causes a hydration error and is
        invalid HTML). String values still pick up a Text child to keep the
        same typography as before. */}
    <Box>
      {typeof value === "string" ? (
        <Text fs="p4" fw={500} color={getToken("text.high")}>
          {value}
        </Text>
      ) : (
        value
      )}
    </Box>
  </Flex>
)

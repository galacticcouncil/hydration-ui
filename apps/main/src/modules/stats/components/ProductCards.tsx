import styled from "@emotion/styled"
import { Flex, Text, ValueStats } from "@galacticcouncil/ui/components"
import { useTheme } from "@galacticcouncil/ui/theme"

import { formatUSD } from "@/api/stats"
import iconHollar from "@/assets/icons/icon-hollar.png"
import iconMoneyMarket from "@/assets/icons/icon-money-market.png"
import iconStaking from "@/assets/icons/icon-staking.png"
import iconTrading from "@/assets/icons/icon-trading.png"
import { useAggregatedPlatformStats } from "@/modules/stats/hooks/useAggregatedPlatformStats"
import { useAssets } from "@/providers/assetsProvider"

const formatTokenAmount = (value: number, symbol: string): string => {
  const compactValue = new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value)

  return `${compactValue} ${symbol}`
}

const SGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: ${({ theme }) => theme.space.xl};

  @media (max-width: 1180px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const SCard = styled.div<{ $span: number }>`
  grid-column: span ${({ $span }) => $span};
  background: ${({ theme }) => theme.surfaces.containers.high.primary};
  border: 1px solid ${({ theme }) => theme.details.borders};
  border-radius: 16px;
  padding: ${({ theme }) => theme.space.xl};
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;

  @media (max-width: 1180px) {
    grid-column: span 1;
  }

  @media (max-width: 768px) {
    grid-column: span 1;
  }
`

const SPegDot = styled.span<{ $stable: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${({ theme, $stable }) =>
    $stable ? theme.accents.success.emphasis : theme.accents.alertAlt.primary};
`

const SIconWrapper = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${({ theme }) => theme.surfaces.containers.dim.dimOnBg};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  flex-shrink: 0;

  img {
    width: 40px;
    height: 40px;
    object-fit: contain;
  }
`

const SMetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(7.5rem, 1fr));
  gap: ${({ theme }) => theme.space.xl};
  margin-top: auto;
`

type ProductMetric = {
  label: string
  value: string
  isStable?: boolean
}

type ProductCard = {
  title: string
  desc: string
  icon: string
  span: number
  metrics: ProductMetric[]
}

export const ProductCards = () => {
  const { themeProps: theme } = useTheme()
  const { native } = useAssets()
  const { stats, isLoading } = useAggregatedPlatformStats()

  const products: ProductCard[] = [
    {
      title: "Money Market",
      desc: "Lend and borrow assets on Hydration",
      icon: iconMoneyMarket,
      span: 3,
      metrics: [
        {
          label: "Market Size",
          value: isLoading ? "-" : formatUSD(stats.borrowTvl),
        },
        {
          label: "Total Borrows",
          value: isLoading ? "-" : formatUSD(stats.totalBorrows),
        },
        {
          label: "Utilization",
          value: isLoading ? "-" : `${stats.borrowUtilization.toFixed(1)}%`,
        },
      ],
    },
    {
      title: "Hollar",
      desc: "Hydration's native multi-collateral stablecoin",
      icon: iconHollar,
      span: 2,
      metrics: [
        {
          label: "Total Supply",
          value: isLoading ? "-" : formatUSD(stats.hollarSupply),
        },
        {
          label: "Peg Status",
          value: isLoading
            ? "-"
            : stats.hollarPeg >= 0.99 && stats.hollarPeg <= 1.01
              ? "Stable"
              : "Depegged",
          isStable:
            !isLoading && stats.hollarPeg >= 0.99 && stats.hollarPeg <= 1.01,
        },
      ],
    },
    {
      title: "Trading / AMMs",
      desc: "Omnipool, XYK, and Stableswap",
      icon: iconTrading,
      span: 2,
      metrics: [
        { label: "TVL", value: isLoading ? "-" : formatUSD(stats.tradingTvl) },
        {
          label: "7D Volume",
          value: isLoading ? "-" : formatUSD(stats.tradingVolume7d),
        },
      ],
    },
    {
      title: "Staking / GIGAHDX",
      desc: "Stake HDX, vote, and access HOLLAR liquidity",
      icon: iconStaking,
      span: 3,
      metrics: [
        {
          label: "Projected APR",
          value: isLoading ? "-" : stats.gigaProjectedAprStr,
        },
        {
          label: "HDX Staked",
          value: isLoading
            ? "-"
            : formatTokenAmount(stats.gigaHdxStaked, native.symbol),
        },
        {
          label: "% of HDX Supply",
          value: isLoading ? "-" : `${stats.gigaHdxStakedPercent.toFixed(2)}%`,
        },
      ],
    },
  ]

  return (
    <SGrid>
      {products.map((product) => (
        <SCard key={product.title} $span={product.span}>
          <SIconWrapper>
            <img src={product.icon} alt={product.title} />
          </SIconWrapper>
          <Text font="primary" fs="h6" fw={500} mb={4}>
            {product.title}
          </Text>
          <Text
            fs="p4"
            color={theme.text.low}
            mb={20}
            style={{ minHeight: "40px" }}
          >
            {product.desc}
          </Text>

          <SMetricsGrid>
            {product.metrics.map((m) => (
              <ValueStats
                key={m.label}
                label={m.label}
                value={m.isStable === undefined ? m.value : undefined}
                customValue={
                  m.isStable !== undefined ? (
                    <Flex align="center" gap="xs">
                      <SPegDot $stable={m.isStable} />
                      {m.value}
                    </Flex>
                  ) : undefined
                }
                isLoading={isLoading}
                size="medium"
                wrap={true}
              />
            ))}
          </SMetricsGrid>
        </SCard>
      ))}
    </SGrid>
  )
}

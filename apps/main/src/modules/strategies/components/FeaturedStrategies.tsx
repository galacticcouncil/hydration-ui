import { SectionHeader, Text } from "@galacticcouncil/ui/components"
import {
  GDOT_ERC20_ID,
  PRIME_ASSET_ID,
  ETH_ASSET_ID,
  HUSDT_ASSET_ID,
} from "@galacticcouncil/utils"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import PrimeIcon from "@/modules/strategies/assets/PrimeIcon.svg?react"
import {
  SApyRow,
  SApyStat,
  SBadge,
  SCard,
  SCardHeader,
  SGrid,
  SIconWrapper,
} from "@/modules/strategies/components/FeaturedStrategies.styled"

type Strategy = {
  id: string
  name: string
  description: string
  assetIds: string[]
  customIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>
  netApy: string
  liquidity: string
  maxLeverage: number
}

const MOCK_STRATEGIES: Strategy[] = [
  {
    id: "prime",
    name: "Prime",
    description: "PRIME Multiply is a simple leveraged yield product that gives you increased exposure to PRIME yields, while retaining 100% PRIME exposure.",
    assetIds: [PRIME_ASSET_ID],
    customIcon: PrimeIcon,
    netApy: "8.49%",
    liquidity: "1.4m",
    maxLeverage: 4,
  },
  {
    id: "gdot",
    name: "GDOT",
    description: "DOT but on steroids. GDOT tracks the price of DOT while earning yield from multiple sources (staking, borrowing, liquidity fees, borrowing).",
    assetIds: [GDOT_ERC20_ID],
    netApy: "8.49%",
    liquidity: "1.4m",
    maxLeverage: 4,
  },
  {
    id: "crypto-bull",
    name: "Crypto Bull",
    description: "Take a bullish stance on tBTC or ETH using your USDC, USDT, or HUSD. Enhance your leverage to amplify your directional outlook on the market.",
    assetIds: [ETH_ASSET_ID, HUSDT_ASSET_ID],
    netApy: "8.49%",
    liquidity: "1.4m",
    maxLeverage: 4,
  },
  {
    id: "crypto-bear",
    name: "Crypto Bear",
    description: "Take a bearish position on tBTC or ETH with your USDC, USDT, or HUSD. Reduce your leverage to align with your negative outlook on the market.",
    assetIds: [ETH_ASSET_ID, HUSDT_ASSET_ID],
    netApy: "8.49%",
    liquidity: "1.4m",
    maxLeverage: 4,
  },
]

export const FeaturedStrategies = () => {
  const { t } = useTranslation("strategies")

  return (
    <div>
      <SectionHeader title={t("featured.title")} as="h2" noTopPadding />
      <SGrid>
        {MOCK_STRATEGIES.map((strategy) => (
          <SCard key={strategy.id}>
            <SCardHeader>
              <SBadge>{t("featured.upTo", { value: strategy.maxLeverage })}</SBadge>
              <SIconWrapper>
                {strategy.customIcon ? (
                  <strategy.customIcon width={52} height={52} />
                ) : (
                  <AssetLogo id={strategy.assetIds.length === 1 ? strategy.assetIds[0] : strategy.assetIds} size="large" />
                )}
              </SIconWrapper>
            </SCardHeader>

            <SApyRow>
              <SApyStat>
                <Text fs="p5" color={getToken("text.low")}>
                  {t("featured.netApy")}
                </Text>
                <Text fs="h3" fw={700} color={getToken("state.success.default")}>
                  {strategy.netApy}
                </Text>
              </SApyStat>
              <SApyStat>
                <Text fs="p5" color={getToken("text.low")}>
                  {t("featured.liquidity")}
                </Text>
                <Text fs="h3" fw={700} color={getToken("text.high")}>
                  {strategy.liquidity}
                </Text>
              </SApyStat>
            </SApyRow>

            <Text fs="p3" fw={600} color={getToken("text.high")}>
              {strategy.name}
            </Text>
            <Text fs="p5" color={getToken("text.medium")}>
              {strategy.description}
            </Text>
          </SCard>
        ))}
      </SGrid>
    </div>
  )
}

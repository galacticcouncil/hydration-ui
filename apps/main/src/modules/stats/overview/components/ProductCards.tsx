import { HollarCard } from "@/modules/stats/overview/components/HollarCard"
import { MoneyMarketCard } from "@/modules/stats/overview/components/MoneyMarketCard"
import { SProductCardsContainer } from "@/modules/stats/overview/components/ProductCards.styled"
import { StakingCard } from "@/modules/stats/overview/components/StakingCard"
import { TradingCard } from "@/modules/stats/overview/components/TradingCard"

export const ProductCards = () => {
  return (
    <SProductCardsContainer>
      <MoneyMarketCard />
      <HollarCard />
      <TradingCard />
      <StakingCard />
    </SProductCardsContainer>
  )
}

import { Grid } from "@galacticcouncil/ui/components"

import { FeaturedPairCard } from "@/modules/borrow/multiply/components/FeaturedPairCard"
import { FeaturedMultiplyItem } from "@/modules/borrow/multiply/hooks/useMultiplyPairs"

export type FeaturedPairsProps = {
  items: FeaturedMultiplyItem[]
}

export const FeaturedPairs: React.FC<FeaturedPairsProps> = ({ items }) => {
  return (
    <Grid columns={[1, 1, 2, 2, 4]} gap="l">
      {items.map((item) => (
        <FeaturedPairCard
          key={
            item.variant === "pair"
              ? `pair-${item.pair.id}`
              : `strategy-${item.strategy.id}`
          }
          {...item}
        />
      ))}
    </Grid>
  )
}

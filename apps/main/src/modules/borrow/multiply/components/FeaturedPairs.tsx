import { Grid } from "@galacticcouncil/ui/components"

import { FeaturedPairCard } from "@/modules/borrow/multiply/components/FeaturedPairCard"
import { MultiplyPair } from "@/modules/borrow/multiply/hooks/useMultiplyPairs"

export type FeaturedPairsProps = {
  pairs: MultiplyPair[]
}

export const FeaturedPairs: React.FC<FeaturedPairsProps> = ({ pairs }) => {
  return (
    <Grid columns={[1, 1, 2, 2, 4]} gap="l">
      {pairs.map((row) => (
        <FeaturedPairCard
          key={`${row.collateralAssetId}-${row.debtAssetId}`}
          {...row}
        />
      ))}
    </Grid>
  )
}

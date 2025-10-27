import { Flex, Grid, Paper, Skeleton } from "@galacticcouncil/ui/components"
import { FC } from "react"

export const WalletTransactionsSkeleton: FC = () => {
  return (
    <Flex direction="column" gap={15} pt={10}>
      <Grid columnTemplate="3fr 5fr 3fr" height={25}>
        <Skeleton sx={{ height: "100%" }} />
        <div />
        <Skeleton sx={{ height: "100%" }} />
      </Grid>
      <Flex p={20} direction="column" gap={20} as={Paper}>
        {Array.from(new Array(8).keys()).map((_, index) => (
          <Grid key={index} columnTemplate="repeat(6, 1fr)" gap={10}>
            {Array.from(new Array(6).keys()).map((_, index) => (
              <Skeleton key={index} sx={{ height: 25 }} />
            ))}
          </Grid>
        ))}
      </Flex>
    </Flex>
  )
}

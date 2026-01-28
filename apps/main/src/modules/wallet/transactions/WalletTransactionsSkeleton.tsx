import { Flex, Grid, Paper, Skeleton } from "@galacticcouncil/ui/components"
import { FC } from "react"

export const WalletTransactionsSkeleton: FC = () => {
  return (
    <Flex direction="column" gap="m" pt="base">
      <Grid columnTemplate="3fr 5fr 3fr" height={25}>
        <Skeleton sx={{ height: "100%" }} />
        <div />
        <Skeleton sx={{ height: "100%" }} />
      </Grid>
      <Flex p="xl" direction="column" gap="xl" as={Paper}>
        {Array.from(new Array(8).keys()).map((_, index) => (
          <Grid key={index} columnTemplate="repeat(6, 1fr)" gap="base">
            {Array.from(new Array(6).keys()).map((_, index) => (
              <Skeleton key={index} sx={{ height: 25 }} />
            ))}
          </Grid>
        ))}
      </Flex>
    </Flex>
  )
}

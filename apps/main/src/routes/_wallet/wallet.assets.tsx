import { Flex, Grid, Paper, Skeleton } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { createFileRoute } from "@tanstack/react-router"
import * as z from "zod"

import { WalletAssetsPage } from "@/modules/wallet/assets/WalletAssetsPage"

const searchSchema = z.object({
  category: z.enum(["all", "assets", "liquidity"]).default("all"),
})

const WalletAssetsSkeleton = () => {
  const { isMobile } = useBreakpoints()

  return (
    <Grid rowTemplate="3fr 5fr 3fr" gap={20} height="70vh">
      <Grid columnTemplate="5fr 2fr" gap={20}>
        <Grid columnTemplate="3fr 1fr" gap={20} as={Paper} p={20}>
          <Grid rowTemplate="1fr 5fr" gap={20}>
            <Skeleton sx={{ height: "100%" }} />
            <Skeleton sx={{ height: "100%" }} />
          </Grid>
          <Grid rowTemplate="1fr 1fr 1fr 1fr" gap={15}>
            <Skeleton sx={{ height: "100%" }} />
            <Skeleton sx={{ height: "100%" }} />
            <Skeleton sx={{ height: "100%" }} />
            <Skeleton sx={{ height: "100%" }} />
          </Grid>
        </Grid>
        <Grid
          rowTemplate="1fr 1fr 1fr"
          gap={15}
          p={20}
          sx={{
            borderWidth: 1,
            borderColor: getToken("details.separators"),
            borderStyle: "solid",
            borderRadius: 16,
          }}
        >
          <Skeleton sx={{ height: "100%" }} />
          <Skeleton sx={{ height: "100%" }} />
          <Skeleton sx={{ height: "100%" }} />
        </Grid>
      </Grid>
      <Flex p={20} direction="column" gap={20} as={Paper}>
        {Array.from(new Array(4).keys()).map((_, index) => (
          <Grid
            key={index}
            columnTemplate={`repeat(${isMobile ? 2 : 6}, 1fr)`}
            gap={10}
          >
            {Array.from(new Array(isMobile ? 2 : 6).keys()).map((_, index) => (
              <Skeleton key={index} sx={{ height: 25 }} />
            ))}
          </Grid>
        ))}
      </Flex>
      <Flex p={20} direction="column" gap={20} as={Paper}>
        {Array.from(new Array(2).keys()).map((_, index) => (
          <Grid
            key={index}
            columnTemplate={`repeat(${isMobile ? 3 : 5}, 1fr)`}
            gap={10}
          >
            {Array.from(new Array(isMobile ? 3 : 5).keys()).map((_, index) => (
              <Skeleton key={index} sx={{ height: 25 }} />
            ))}
          </Grid>
        ))}
      </Flex>
    </Grid>
  )
}

export const Route = createFileRoute("/_wallet/wallet/assets")({
  component: WalletAssetsPage,
  pendingComponent: WalletAssetsSkeleton,
  validateSearch: searchSchema,
})

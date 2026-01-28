import { Flex, Grid, Paper, Skeleton } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { createFileRoute } from "@tanstack/react-router"
import * as z from "zod/v4"

import { getPageMeta } from "@/config/navigation"
import { WalletAssetsPage } from "@/modules/wallet/assets/WalletAssetsPage"

const searchSchema = z.object({
  category: z.enum(["all", "assets", "liquidity"]).default("all"),
})

export type WalletAssetsCategory = z.infer<typeof searchSchema>["category"]

const WalletAssetsSkeleton = () => {
  const { isMobile } = useBreakpoints()

  return (
    <Grid rowTemplate="3fr 5fr 3fr" gap="xl" height="70vh" pt={["xl", "xxl"]}>
      <Grid columnTemplate="5fr 2fr" gap="xl">
        <Grid columnTemplate="3fr 1fr" gap="xl" as={Paper} p="xl">
          <Grid rowTemplate="1fr 5fr" gap="xl">
            <Skeleton sx={{ height: "100%" }} />
            <Skeleton sx={{ height: "100%" }} />
          </Grid>
          <Grid rowTemplate="1fr 1fr 1fr 1fr" gap="m">
            <Skeleton sx={{ height: "100%" }} />
            <Skeleton sx={{ height: "100%" }} />
            <Skeleton sx={{ height: "100%" }} />
            <Skeleton sx={{ height: "100%" }} />
          </Grid>
        </Grid>
        <Grid
          rowTemplate="1fr 1fr 1fr"
          gap="m"
          p="xl"
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
      <Flex p="xl" direction="column" gap="xl" as={Paper}>
        {Array.from(new Array(4).keys()).map((_, index) => (
          <Grid
            key={index}
            columnTemplate={`repeat(${isMobile ? 2 : 6}, 1fr)`}
            gap="base"
          >
            {Array.from(new Array(isMobile ? 2 : 6).keys()).map((_, index) => (
              <Skeleton key={index} sx={{ height: 25 }} />
            ))}
          </Grid>
        ))}
      </Flex>
      <Flex p="xl" direction="column" gap="xl" as={Paper}>
        {Array.from(new Array(2).keys()).map((_, index) => (
          <Grid
            key={index}
            columnTemplate={`repeat(${isMobile ? 3 : 5}, 1fr)`}
            gap="base"
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

export const Route = createFileRoute("/wallet/assets")({
  component: WalletAssetsPage,
  pendingComponent: WalletAssetsSkeleton,
  validateSearch: searchSchema,
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("wallet", i18n.t),
  }),
})

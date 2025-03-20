import { Skeleton, Text } from "@galacticcouncil/ui/components"
import { createFileRoute } from "@tanstack/react-router"
import { fallback, zodValidator } from "@tanstack/zod-adapter"
import * as z from "zod"

const searchSchema = z.object({
  category: fallback(z.enum(["all", "assets", "liquidity"]), "all").default(
    "all",
  ),
})

const WalletAssetsSkeleton = () => (
  <>
    <Text as="h1" mb={20}>
      <Skeleton />
    </Text>
    <Text>
      <Skeleton count={20} />
    </Text>
  </>
)

export const Route = createFileRoute("/_wallet/wallet/assets")({
  pendingComponent: WalletAssetsSkeleton,
  validateSearch: zodValidator(searchSchema),
})

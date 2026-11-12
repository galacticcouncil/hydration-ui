import {
  AssetLabel,
  Flex,
  LogoSkeleton,
  Skeleton,
} from "@galacticcouncil/ui/components"
import { pxToRem } from "@galacticcouncil/ui/utils"

export const DepositHoldingSkeleton = () => (
  <Flex
    aria-hidden
    align="center"
    justify="space-between"
    height={pxToRem(50)}
    px="m"
  >
    <Flex gap="base" align="center">
      <LogoSkeleton size="medium" />
      <AssetLabel symbol="" loading />
    </Flex>
    <Skeleton width={60} />
  </Flex>
)

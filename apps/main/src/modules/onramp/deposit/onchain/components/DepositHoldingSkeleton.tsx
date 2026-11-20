import { Flex, LogoSkeleton, Skeleton } from "@galacticcouncil/ui/components"
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
      <Flex direction="column" gap="xs" justify="center">
        <Skeleton sx={{ width: "3xl", height: "xs", display: "block" }} />
        <Skeleton sx={{ width: "2xl", height: "xs", display: "block" }} />
      </Flex>
    </Flex>
    <Skeleton sx={{ width: "2xl" }} />
  </Flex>
)

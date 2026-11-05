import { Flex } from "../Flex"
import { LogoSkeleton } from "../Logo"
import { Skeleton } from "../Skeleton"

export const SelectSkeleton = () => (
  <Flex direction="column" gap="base" p="base" aria-hidden>
    {[0, 1, 2].map((index) => (
      <Flex key={index} align="center" gap="base" py="s">
        <LogoSkeleton size="small" />
        <Skeleton width={120} height="1em" />
      </Flex>
    ))}
  </Flex>
)

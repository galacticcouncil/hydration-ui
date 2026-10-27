import {
  AssetLabel,
  Flex,
  LogoSkeleton,
  Skeleton,
  Stack,
} from "@galacticcouncil/ui/components"
import { pxToRem } from "@galacticcouncil/ui/utils"
import { FC } from "react"

export const DepositAssetListSkeleton: FC<{ count?: number }> = ({
  count = 3,
}) => (
  <Stack gap={0} separated aria-hidden>
    {Array.from({ length: count }, (_, index) => (
      <Flex
        key={index}
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
    ))}
  </Stack>
)

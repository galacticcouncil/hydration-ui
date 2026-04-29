import { ArrowRight } from "@galacticcouncil/ui/assets/icons"
import {
  Box,
  Flex,
  Icon,
  LogoSkeleton,
  Paper,
  Separator,
  Skeleton,
  Stack,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"

const JourneyCardSkeleton = () => {
  return (
    <Stack as={Paper} px="primary">
      <Flex py="m" gap="s" align="center">
        <LogoSkeleton size="medium" />
        <Icon
          component={ArrowRight}
          size="l"
          mx="s"
          sx={{ opacity: 0.5 }}
          color={getToken("icons.onSurface")}
        />
        <LogoSkeleton size="medium" />

        <Flex ml="auto">
          <Skeleton sx={{ width: ["3rem", "6rem"] }} height="1rem" />
        </Flex>
      </Flex>

      <Separator mx="-primary" />

      <Flex align="center" py="m">
        <Box mr="base">
          <LogoSkeleton size="medium" />
        </Box>
        <Stack gap="xs">
          <Skeleton width="4rem" height="1rem" />
        </Stack>
        <Flex ml="auto">
          <Skeleton width="4rem" height="1.5rem" />
        </Flex>
      </Flex>
    </Stack>
  )
}

export const XcScanJourneyListSkeleton = () => {
  return (
    <Stack
      gap="base"
      maxWidth="6xl"
      width="100%"
      mx="auto"
      justify="flex-start"
    >
      {Array.from({ length: 4 }, (_, i) => (
        <JourneyCardSkeleton key={i} />
      ))}
    </Stack>
  )
}

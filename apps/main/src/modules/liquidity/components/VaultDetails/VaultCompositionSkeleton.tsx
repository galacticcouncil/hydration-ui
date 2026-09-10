import {
  Box,
  Flex,
  Grid,
  LogoSkeleton,
  Paper,
  Separator,
  Skeleton,
  Stack,
} from "@galacticcouncil/ui/components"

export const VaultCompositionSkeleton = () => {
  return (
    <Stack asChild>
      <Paper p="l" flex={1}>
        <Skeleton width={160} height="1.2em" />

        <Stack gap="m" flex={1} separated mt="base">
          {Array.from({ length: 3 }, (_, index) => (
            <Flex key={index} direction="column" gap="base">
              <Skeleton width={48} height={14} />
              <Grid columns={2} gap="l" align="center">
                <AmountSkeleton />
                <AmountSkeleton />
              </Grid>
            </Flex>
          ))}

          <Box mt="auto">
            <Separator my="m" />
            <Flex justify="space-between" align="center">
              <Skeleton width={120} height={12} />
              <Skeleton width={72} height={12} />
            </Flex>
          </Box>
        </Stack>
      </Paper>
    </Stack>
  )
}

const AmountSkeleton = () => (
  <Flex align="center" gap="s">
    <LogoSkeleton size="small" />
    <Flex direction="column" gap="xs">
      <Skeleton width={80} height={14} />
      <Skeleton width={56} height={12} />
    </Flex>
  </Flex>
)

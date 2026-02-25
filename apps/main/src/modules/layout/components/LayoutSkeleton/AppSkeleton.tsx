import {
  Box,
  Flex,
  LoadingButton,
  Paper,
  Separator,
  Skeleton,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"

const AssetSectionSkeleton = () => {
  return (
    <Stack gap="s" py="m" px="l">
      <Flex justify="space-between">
        <Text fs="p6">
          <Skeleton width={100} />
        </Text>
        <Text fs="p6">
          <Skeleton width={70} />
        </Text>
      </Flex>
      <Flex justify="space-between" align="center">
        <Flex gap="m" align="center">
          <Skeleton width={42} height={42} circle />
          <Skeleton width={70} height={30} />
        </Flex>
        <Flex gap="base" direction="column" align="end">
          <Skeleton width={40} height={30} />
          <Skeleton width={50} height={14} />
        </Flex>
      </Flex>
    </Stack>
  )
}

const SwitcherSkeleton = () => {
  return (
    <Flex align="center" justify="space-between" gap="s">
      <Separator sx={{ flexShrink: 0, width: "m" }} />
      <Skeleton
        width={30}
        height={30}
        circle
        sx={{ display: "inline-flex", flexShrink: 0 }}
      />
      <Separator sx={{ flex: 1 }} />
      <Skeleton
        width={150}
        height={28}
        sx={{ borderRadius: "full", flexShrink: 0 }}
      />
      <Separator sx={{ flexShrink: 0, width: "m" }} />
    </Flex>
  )
}

export const AppSkeleton = () => {
  return (
    <Paper>
      <Flex justify="space-between" align="center" p="xl">
        <Flex gap="l">
          <Skeleton width={50} height={20} />
          <Skeleton width={50} height={20} />
        </Flex>
        <Skeleton width={24} height={24} circle />
      </Flex>
      <Separator />
      <AssetSectionSkeleton />
      <SwitcherSkeleton />
      <AssetSectionSkeleton />
      <Separator />
      <Box p="l">
        <LoadingButton
          isLoading
          size="large"
          loadingVariant="muted"
          width="100%"
        />
      </Box>
    </Paper>
  )
}

import {
  AssetButton,
  Box,
  Flex,
  LoadingButton,
  Paper,
  Separator,
  Skeleton,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { pxToRem } from "@galacticcouncil/ui/utils"

const AssetSectionSkeleton = () => {
  return (
    <Stack gap="m" py="l" px="xl">
      <Flex justify="space-between">
        <Text fs="p6">
          <Skeleton width={100} />
        </Text>
        <Text fs="p6">
          <Skeleton width={70} />
        </Text>
      </Flex>
      <Flex justify="space-between" align="center">
        <AssetButton loading error={false} />
        <Flex gap="s" direction="column" align="end">
          <div sx={{ height: pxToRem(26), lineHeight: 1 }}>
            <Skeleton width={pxToRem(40)} height={pxToRem(26)} />
          </div>
          <div sx={{ height: pxToRem(12), lineHeight: 1 }}>
            <Skeleton width={pxToRem(50)} height={pxToRem(12)} />
          </div>
        </Flex>
      </Flex>
    </Stack>
  )
}

const SwitcherSkeleton = () => {
  return (
    <Flex align="center" justify="space-between">
      <Separator sx={{ flexShrink: 0, width: 32 }} />
      <Skeleton
        width={34}
        height={34}
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

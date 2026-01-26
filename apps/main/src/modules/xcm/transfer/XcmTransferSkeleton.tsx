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
import { useTranslation } from "react-i18next"

const XcmSectionSkeleton = () => {
  return (
    <Stack p="xl" gap="base" height={106}>
      <Flex justify="space-between">
        <Flex gap="base" direction="column">
          <Text fs="p5">
            <Skeleton width={100} />
          </Text>
          <Flex gap="s">
            <Skeleton width={35} height={35} sx={{ borderRadius: "full" }} />
            <Skeleton width={35} height={35} sx={{ borderRadius: "full" }} />
          </Flex>
        </Flex>
        <Flex gap="base" direction="column" align="end">
          <Text fs="p6">
            <Skeleton width={80} />
          </Text>
          <Box height={35}>
            <Skeleton width={100} height={21} />
          </Box>
        </Flex>
      </Flex>
    </Stack>
  )
}

export const XcmTransferSkeleton = () => {
  const { t } = useTranslation("xcm")
  return (
    <Stack
      gap="s"
      maxWidth={500}
      mx="auto"
      pt="xl"
      sx={{ pointerEvents: "none" }}
    >
      <Paper>
        <Box p="xl">
          <Text fs="h7" fw={500} align="center" font="primary">
            {t("form.title")}
          </Text>
        </Box>
        <Separator />
        <XcmSectionSkeleton />
      </Paper>
      <Flex align="center" justify="center" position="relative">
        <Separator sx={{ flexShrink: 0, flex: 1 }} />
        <Skeleton
          width={34}
          height={34}
          sx={{ display: "inline-flex", borderRadius: "full" }}
        />
        <Separator sx={{ flexShrink: 0, flex: 1 }} />
      </Flex>
      <Paper>
        <XcmSectionSkeleton />
        <Separator />
        <Box p="xl">
          <LoadingButton
            isLoading
            size="large"
            loadingVariant="muted"
            width="100%"
          />
        </Box>
      </Paper>
    </Stack>
  )
}

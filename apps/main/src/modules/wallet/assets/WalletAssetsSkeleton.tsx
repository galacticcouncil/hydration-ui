import {
  Box,
  ChartValues,
  Flex,
  Paper,
  Separator,
  Skeleton,
  Stack,
} from "@galacticcouncil/ui/components"
import type { BoxProps } from "@galacticcouncil/ui/components/Box"
import type { FlexProps } from "@galacticcouncil/ui/components/Flex"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { Fragment } from "react"

import { ChartState } from "@/components/ChartState"
import { TableSkeleton } from "@/modules/layout/components/LayoutSkeleton"
import { TwoColumnGrid } from "@/modules/layout/components/TwoColumnGrid/TwoColumnGrid"

export const WalletAssetsSkeleton = () => {
  const { isMobile } = useBreakpoints()

  if (isMobile) {
    return <WalletAssetsMobileSkeleton />
  }

  return (
    <Flex direction="column" gap="l">
      <Flex align="center" justify="space-between" gap="base">
        <Skeleton width={110} height={24} />
        <Flex align="center" gap="base">
          <Skeleton width={290} height={38} sx={{ borderRadius: 8 }} />
          <Skeleton width={178} height={24} />
        </Flex>
      </Flex>

      <Box sx={walletSkeletonShellSx}>
        <WalletSkeletonSectionHeader />
        <WalletSkeletonStats />
        <WalletSkeletonTabs />
        <WalletSkeletonTable rows={7} />
      </Box>

      <Flex direction="column" gap="base">
        <Flex
          align="center"
          justify="space-between"
          sx={{
            pt: getToken("scales.paddings.xxl"),
            pb: getToken("containers.paddings.secondary"),
          }}
        >
          <Flex align="center" gap="s">
            <Skeleton width={20} height={20} sx={{ borderRadius: "full" }} />
            <Skeleton width={132} height={22} />
          </Flex>
          <Flex align="center" gap="base">
            <Skeleton width={158} height={30} sx={{ borderRadius: 999 }} />
            <Skeleton width={178} height={24} />
          </Flex>
        </Flex>
        <Box sx={walletSkeletonShellSx}>
          <WalletSkeletonTrackedHeader />
          <WalletSkeletonTable rows={2} compact />
        </Box>
      </Flex>
    </Flex>
  )
}

const WalletAssetsMobileSkeleton = () => (
  <Stack gap="xl">
    <TwoColumnGrid template="sidebar">
      <Stack as={Paper} p={["secondary", "primary"]}>
        <ChartValues isLoading />
        <ChartState isLoading isEmpty sx={{ height: 300 }} />
      </Stack>
      <Flex
        direction="column"
        gap="base"
        p="xl"
        justify="space-between"
        height="100%"
        as={Paper}
      >
        {Array.from({ length: 3 }).map((_, index) => (
          <Stack key={index} gap="base">
            {index > 0 && <Separator />}
            <Skeleton width="50%" />
            <Skeleton width="20%" />
          </Stack>
        ))}
      </Flex>
    </TwoColumnGrid>
    <TableSkeleton rows={10} cols={[2, null, 4, 6]} />
  </Stack>
)

const WalletSkeletonSectionHeader = () => (
  <Flex
    align="center"
    justify="space-between"
    sx={walletSkeletonSectionHeaderSx}
  >
    <Flex align="center" gap="s">
      <Skeleton width={20} height={20} sx={{ borderRadius: "full" }} />
      <Skeleton width={92} height={18} />
    </Flex>
    <Skeleton width={72} height={16} />
  </Flex>
)

const WalletSkeletonStats = () => (
  <Box sx={{ p: getToken("containers.paddings.tertiary") }}>
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns:
          "minmax(108px, 1fr) 1px minmax(108px, 1fr) 1px minmax(108px, 1fr) 1px minmax(108px, 1fr) 1px minmax(108px, 1fr) 1px minmax(214px, auto)",
        alignItems: "center",
        minHeight: 37,
      }}
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <Fragment key={index}>
          <WalletSkeletonStat />
          <WalletSkeletonDivider />
        </Fragment>
      ))}
      <Flex
        align="center"
        justify="flex-end"
        gap="base"
        sx={{ pl: getToken("containers.paddings.tertiary") }}
      >
        <WalletSkeletonStat align="right" />
        <Skeleton width={64} height={30} sx={{ borderRadius: 999 }} />
      </Flex>
    </Box>
  </Box>
)

const WalletSkeletonStat = ({ align }: { readonly align?: "right" }) => (
  <Flex
    direction="column"
    gap="xs"
    align={align === "right" ? "flex-end" : "flex-start"}
    sx={{
      height: 33,
      px: getToken("containers.paddings.tertiary"),
      justifyContent: "center",
      minWidth: 0,
    }}
  >
    <Skeleton width={68} height={10} />
    <Skeleton width={84} height={16} />
  </Flex>
)

const WalletSkeletonDivider = () => (
  <Box
    sx={{
      alignSelf: "center",
      width: 1,
      height: 33,
      bg: getToken("details.separators"),
    }}
  />
)

const WalletSkeletonTabs = () => (
  <Flex
    align="center"
    gap="base"
    sx={{
      height: 61,
      px: getToken("containers.paddings.tertiary"),
      borderTop: "1px solid",
      borderBottom: "1px solid",
      borderColor: getToken("details.separators"),
      boxSizing: "border-box",
    }}
  >
    {[58, 134, 78, 56].map((width) => (
      <Skeleton
        key={width}
        width={width}
        height={30}
        sx={{ borderRadius: 999 }}
      />
    ))}
  </Flex>
)

const WalletSkeletonTrackedHeader = () => (
  <Flex
    align="center"
    justify="space-between"
    sx={walletSkeletonSectionHeaderSx}
  >
    <Flex align="center" gap="s">
      <Skeleton width={16} height={16} sx={{ borderRadius: "full" }} />
      <Skeleton width={186} height={16} />
    </Flex>
    <Skeleton width={48} height={16} />
  </Flex>
)

const WalletSkeletonTable = ({
  rows,
  compact,
}: {
  readonly rows: number
  readonly compact?: boolean
}) => (
  <Flex direction="column">
    <WalletSkeletonTableHeader compact={compact} />
    {Array.from({ length: rows }).map((_, index) => (
      <Box
        key={index}
        sx={{
          display: "grid",
          gridTemplateColumns: compact
            ? "minmax(220px, 1fr) 180px minmax(220px, auto)"
            : "minmax(220px, 1fr) 180px 220px minmax(260px, auto) 40px",
          alignItems: "center",
          columnGap: 24,
          minHeight: compact ? 54 : 60,
          px: getToken("containers.paddings.primary"),
          borderTop: "1px solid",
          borderColor: getToken("details.separators"),
          boxSizing: "border-box",
          bg:
            index === 0 && !compact
              ? getToken("surfaces.containers.high.hover")
              : undefined,
        }}
      >
        <Flex align="center" gap="base" sx={{ minWidth: 0 }}>
          <Skeleton
            width={compact ? 16 : 32}
            height={compact ? 16 : 32}
            sx={{ borderRadius: "full" }}
          />
          <Flex direction="column" gap="xs">
            <Skeleton width={compact ? 160 : 64} height={16} />
            {!compact && <Skeleton width={112} height={14} />}
          </Flex>
        </Flex>
        <Flex direction="column" gap="xs">
          <Skeleton width={96} height={16} />
          {!compact && <Skeleton width={64} height={14} />}
        </Flex>
        {!compact && (
          <Flex direction="column" gap="xs">
            <Skeleton width={96} height={16} />
            <Skeleton width={64} height={14} />
          </Flex>
        )}
        <Flex justify="flex-end" gap="base">
          <Skeleton
            width={compact ? 124 : 142}
            height={30}
            sx={{ borderRadius: 999 }}
          />
          {!compact && (
            <Skeleton width={74} height={30} sx={{ borderRadius: 999 }} />
          )}
          {!compact && (
            <Skeleton width={74} height={30} sx={{ borderRadius: 999 }} />
          )}
        </Flex>
        {!compact && (
          <Skeleton
            width={18}
            height={18}
            sx={{ justifySelf: "end", borderRadius: "full" }}
          />
        )}
      </Box>
    ))}
  </Flex>
)

const WalletSkeletonTableHeader = ({
  compact,
}: {
  readonly compact?: boolean
}) => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: compact
        ? "minmax(220px, 1fr) 180px minmax(220px, auto)"
        : "minmax(220px, 1fr) 180px 220px minmax(260px, auto) 40px",
      alignItems: "center",
      columnGap: 24,
      height: 34,
      px: getToken("containers.paddings.primary"),
    }}
  >
    <Skeleton width={54} height={14} />
    <Skeleton width={96} height={14} />
    {!compact && <Skeleton width={140} height={14} />}
    <Skeleton width={58} height={14} sx={{ justifySelf: "end" }} />
  </Box>
)

const walletSkeletonShellSx: BoxProps["sx"] = {
  overflow: "hidden",
  borderRadius: getToken("containers.cornerRadius.containersPrimary"),
  bg: getToken("surfaces.containers.high.primary"),
  border: "1px solid",
  borderColor: getToken("details.borders"),
  boxSizing: "border-box",
  boxShadow:
    "0px 1px 3px rgba(0, 0, 0, 0.07), 0px 4px 18px rgba(0, 0, 0, 0.01)",
}

const walletSkeletonSectionHeaderSx: FlexProps["sx"] = {
  width: "100%",
  height: 42,
  px: getToken("containers.paddings.primary"),
  bg: getToken("surfaces.containers.dim.dimOnBg"),
  borderBottom: "1px solid",
  borderColor: getToken("details.separators"),
  boxSizing: "border-box",
}

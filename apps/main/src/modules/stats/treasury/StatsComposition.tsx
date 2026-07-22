import { Skeleton, Text } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { TreasuryCompositionAsset } from "@/api/treasury"
import {
  AssetCompositionBlock,
  OthersCompositionBlock,
} from "@/modules/stats/treasury/AssetCompositionBlock"
import {
  DESKTOP_INITIAL_SKELETON_SPECS,
  getCompositionBlockLayouts,
  MOBILE_INITIAL_SKELETON_SPECS,
  useAssetsColorsQuery,
} from "@/modules/stats/treasury/StatsComposition.utils"
import { SCompositionGrid } from "@/modules/stats/treasury/StatsTreasury.styled"

type StatsCompositionProps = {
  primary: TreasuryCompositionAsset[]
  others: TreasuryCompositionAsset[]
  isLoading: boolean
}

export const StatsComposition = ({
  primary,
  others,
  isLoading,
}: StatsCompositionProps) => {
  const { t } = useTranslation("stats")
  const { isMobile, isTablet } = useBreakpoints()
  const useCompositionMobileLayout = isMobile || isTablet

  const colorQueries = useAssetsColorsQuery(primary)

  const othersComposition = useMemo(() => {
    return others.reduce(
      (acc, item) => ({
        share: acc.share + item.share,
        totalValueDisplay: Big(acc.totalValueDisplay)
          .plus(item.totalValueDisplay ?? 0)
          .toString(),
      }),
      { share: 0, totalValueDisplay: "0" },
    )
  }, [others])

  const compositionLayouts = useMemo(
    () =>
      getCompositionBlockLayouts(
        colorQueries,
        others,
        othersComposition,
        useCompositionMobileLayout,
      ),
    [colorQueries, others, othersComposition, useCompositionMobileLayout],
  )

  if (!primary.length) {
    return null
  }

  const compositionSkeletonSpecs = useCompositionMobileLayout
    ? MOBILE_INITIAL_SKELETON_SPECS
    : DESKTOP_INITIAL_SKELETON_SPECS

  return (
    <SCompositionGrid>
      {isLoading ? (
        compositionSkeletonSpecs.map((spec, index) => (
          <Skeleton
            key={index}
            height="100%"
            sx={{
              gridColumn: `span ${spec.colSpan}`,
              gridRow: `span ${spec.rowSpan}`,
            }}
          />
        ))
      ) : compositionLayouts.length ? (
        compositionLayouts.map(({ block, layout }) =>
          block.kind === "others" ? (
            <OthersCompositionBlock
              key={block.id}
              block={block}
              layout={layout}
            />
          ) : (
            <AssetCompositionBlock
              key={block.asset.id}
              block={block}
              layout={layout}
            />
          ),
        )
      ) : (
        <Text fs="p7" color={getToken("text.medium")}>
          {t("treasury.composition.empty")}
        </Text>
      )}
    </SCompositionGrid>
  )
}

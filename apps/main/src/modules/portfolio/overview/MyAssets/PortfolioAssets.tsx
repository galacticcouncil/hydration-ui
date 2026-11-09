import { Alert, Box } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { ComponentProps } from "react"
import { useTranslation } from "react-i18next"

import { MyAssets } from "@/modules/portfolio/overview/MyAssets/MyAssets"
import { mergePortfolioAssets } from "@/modules/portfolio/overview/MyAssets/PortfolioAssets.data"
import { MyStrategiesPositions } from "@/modules/portfolio/overview/MyStrategies/MyStrategies"
import { StrategyPosition } from "@/modules/portfolio/overview/MyStrategies/MyStrategies.data"
import { useAssets } from "@/providers/assetsProvider"

export const PortfolioAssets = (props: ComponentProps<typeof MyAssets>) => {
  const { isMobile } = useBreakpoints()
  const { t } = useTranslation("wallet")
  const { getAssetWithFallback } = useAssets()
  const renderAssets = (
    positions: StrategyPosition[],
    isLoading: boolean,
    isError: boolean,
  ) => {
    const data = mergePortfolioAssets(
      props.data,
      positions,
      getAssetWithFallback,
      isMobile,
    )
    return (
      <>
        {isError && (
          <Box p="m">
            <Alert
              variant="warning"
              description={t("myStrategies.readFailed")}
            />
          </Box>
        )}
        <MyAssets
          {...props}
          data={data}
          isEmpty={data.length === 0}
          isLoading={props.isLoading || isLoading}
        />
      </>
    )
  }

  return (
    <MyStrategiesPositions>
      {(positions) =>
        renderAssets(positions.data, positions.isLoading, positions.isError)
      }
    </MyStrategiesPositions>
  )
}

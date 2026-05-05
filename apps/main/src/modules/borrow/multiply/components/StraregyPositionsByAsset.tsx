import {
  CollapsibleContent,
  CollapsibleRoot,
  DataTable,
  Flex,
  Paper,
  SectionHeader,
  Separator,
  TableContainer,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { useTranslation } from "react-i18next"

import { StrategyPositionWrapper } from "@/modules/borrow/multiply/components/StrategyPosition"
import {
  getStrategyPositionsColumnsVisibility,
  useStrategyAssetsColumns,
  useStrategyGroupedPositions,
} from "@/modules/borrow/multiply/components/StrategyPositions.utils"

type StrategyPositionsByAssetProps = {
  assetId: string
  actionColumnHidden?: boolean
  className?: string
}

export const StrategyPositionsByAsset: React.FC<
  StrategyPositionsByAssetProps
> = ({ assetId, actionColumnHidden, className }) => {
  const { t } = useTranslation("common")
  const { data, isLoading } = useStrategyGroupedPositions()
  const assetsColumns = useStrategyAssetsColumns()
  const { isMobile } = useBreakpoints()

  const filteredData = data.find((item) => item.suppliedAssetId === assetId)

  return (
    <CollapsibleRoot open={!isLoading && data.length > 0}>
      <CollapsibleContent className={className}>
        <TableContainer as={Paper}>
          <SectionHeader
            title={t("myPositions")}
            noTopPadding
            hasDescription
            sx={{ px: ["base", "l"], pt: "l" }}
          />
          <Separator mt="m" />
          <DataTable
            size="small"
            data={filteredData ? [filteredData] : []}
            columns={assetsColumns}
            isLoading={isLoading}
            columnVisibility={getStrategyPositionsColumnsVisibility(
              isMobile,
              actionColumnHidden,
            )}
            expandable={"single"}
            getIsExpandable={({ positionsAmount }) => positionsAmount > 0}
            renderSubComponent={(row) => (
              <Flex direction="column" gap="m">
                {row.positions.map((position) => (
                  <StrategyPositionWrapper
                    key={position.proxyAddress}
                    position={position}
                  />
                ))}
              </Flex>
            )}
          />
        </TableContainer>
      </CollapsibleContent>
    </CollapsibleRoot>
  )
}

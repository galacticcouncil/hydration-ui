import {
  DataTable,
  Flex,
  Paper,
  TableContainer,
  Text,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { StrategyPositionWrapper } from "@/modules/borrow/multiply/components/StrategyPosition"
import {
  getStrategyPositionsColumnsVisibility,
  useStrategyAssetsColumns,
  useStrategyGroupedPositions,
} from "@/modules/borrow/multiply/components/StrategyPositions.utils"

export const StrategyPositionsByAsset = ({ assetId }: { assetId: string }) => {
  const { t } = useTranslation("common")
  const { data, isLoading } = useStrategyGroupedPositions()
  const assetsColumns = useStrategyAssetsColumns()
  const { isMobile } = useBreakpoints()

  const filteredData = data.find((item) => item.suppliedAssetId === assetId)

  return (
    <TableContainer as={Paper}>
      <Text
        fs="p3"
        fw={500}
        font="primary"
        color={getToken("text.high")}
        sx={{
          px: ["base", "l"],
          py: "l",
          borderBottom: "1px solid",
          borderColor: getToken("details.separators"),
        }}
      >
        {t("myPositions")}
      </Text>

      <DataTable
        size="small"
        data={filteredData ? [filteredData] : []}
        columns={assetsColumns}
        isLoading={isLoading}
        columnVisibility={getStrategyPositionsColumnsVisibility(isMobile)}
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
  )
}

import {
  DataTable,
  Paper,
  SectionHeader,
  TableContainer,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { useAccountOmnipoolPositionsData } from "@/states/account"
import { OmnipoolPositionData } from "@/states/liquidity"
import { numericallyStrDesc } from "@/utils/sort"

import { ClaimCard } from "./ClaimCard"
import { PositionsHeader } from "./PositionsHeader"
import { usePositionsTableColumns } from "./PositionsTable.columns"

export type PositionTableData = {
  positionId: string
} & Partial<OmnipoolPositionData>

export const PositionsTable = ({ assetId }: { assetId: string }) => {
  const { t } = useTranslation("liquidity")
  const { isTablet, isMobile } = useBreakpoints()
  const columns = usePositionsTableColumns()

  const { getAssetPositions } = useAccountOmnipoolPositionsData()

  const tableData = useMemo(() => {
    const omnipoolPositions = getAssetPositions(assetId)
    return [
      ...(omnipoolPositions?.omnipool ?? []),
      ...(omnipoolPositions?.omnipoolMining ?? []),
    ]
      .sort((a, b) => {
        return numericallyStrDesc(a.positionId, b.positionId)
      })
      .map((position): PositionTableData => {
        return {
          positionId: position.positionId,
          ...position.data,
        }
      })
  }, [assetId, getAssetPositions])

  if (tableData.length === 0) {
    return null
  }

  return (
    <>
      <SectionHeader>{t("details.section.yourPositions")}</SectionHeader>

      {(isTablet || isMobile) && <ClaimCard sx={{ mb: 12 }} />}
      <TableContainer as={Paper}>
        <PositionsHeader assetId={assetId} data={tableData} />
        <DataTable
          data={tableData}
          columns={columns}
          paginated
          pageSize={10}
          columnPinning={{
            left: ["position"],
          }}
        />
      </TableContainer>
    </>
  )
}

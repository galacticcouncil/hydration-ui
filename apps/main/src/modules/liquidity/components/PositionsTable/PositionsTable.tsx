import {
  Button,
  DataTable,
  Flex,
  Paper,
  SectionHeader,
  TableContainer,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { Link } from "@tanstack/react-router"
import { Minus } from "lucide-react"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import {
  AccountOmnipoolPosition,
  isOmnipoolDepositPosition,
  useAccountOmnipoolPositionsData,
} from "@/states/account"
import { numericallyStrDesc } from "@/utils/sort"

import { ClaimCard } from "./ClaimCard"
import { PositionsHeader } from "./PositionsHeader"
import { usePositionsTableColumns } from "./PositionsTable.columns"

export type PositionTableData = {
  poolId: string
  joinedFarms: string[]
} & AccountOmnipoolPosition

export const PositionsTable = ({ assetId }: { assetId: string }) => {
  const { t } = useTranslation("liquidity")
  const { isTablet, isMobile } = useBreakpoints()
  const columns = usePositionsTableColumns()

  const { getAssetPositions } = useAccountOmnipoolPositionsData()

  const tableData = useMemo(() => {
    const { all: omnipoolPositions } = getAssetPositions(assetId)

    return omnipoolPositions
      .sort((a, b) => {
        return numericallyStrDesc(a.positionId, b.positionId)
      })
      .map((position): PositionTableData => {
        const joinedFarms = isOmnipoolDepositPosition(position)
          ? position.yield_farm_entries.map((entry) =>
              entry.global_farm_id.toString(),
            )
          : []

        return {
          poolId: assetId,
          joinedFarms,
          ...position,
        }
      })
  }, [assetId, getAssetPositions])

  if (tableData.length === 0) {
    return null
  }

  return (
    <>
      <Flex align="center" justify="space-between">
        <SectionHeader>{t("details.section.yourPositions")}</SectionHeader>
        <Button variant="tertiary" outline asChild>
          <Link
            to="/liquidity/$id/remove/$positionId"
            params={{
              id: assetId,
              positionId: "all",
            }}
          >
            <Minus />
            {t("liquidity.positions.removeAll")}
          </Link>
        </Button>
      </Flex>

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

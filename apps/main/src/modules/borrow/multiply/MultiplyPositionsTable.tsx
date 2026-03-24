import {
  Box,
  DataTable,
  SectionHeader,
  TableContainer,
} from "@galacticcouncil/ui/components"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { TablePaper } from "@/modules/borrow/components/TablePaper"
import { MultiplyPositionManagerModal } from "@/modules/borrow/multiply/MultiplyPositionManagerModal"
import {
  MultiplyPositionRow,
  useMultiplyPositionsColumns,
} from "@/modules/borrow/multiply/MultiplyPositionsTable.columns"
import { useMultiplyPositionsData } from "@/modules/borrow/multiply/MultiplyPositionsTable.data"

export const MultiplyPositionsTable = () => {
  const { t } = useTranslation("borrow")
  const [selectedPosition, setSelectedPosition] =
    useState<MultiplyPositionRow | null>(null)

  const data = useMultiplyPositionsData()
  const columns = useMultiplyPositionsColumns(setSelectedPosition)

  return (
    <TablePaper>
      <Box p="xl" pb={0}>
        <SectionHeader title={t("multiply.positions.title")} noTopPadding />
      </Box>
      <TableContainer bg="transparent">
        <DataTable
          data={data}
          columns={columns}
          fixedLayout
          skeletonRowCount={5}
        />
      </TableContainer>

      <MultiplyPositionManagerModal
        position={selectedPosition}
        onClose={() => setSelectedPosition(null)}
      />
    </TablePaper>
  )
}

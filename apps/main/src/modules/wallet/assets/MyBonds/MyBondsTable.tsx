import {
  DataTable,
  Modal,
  Paper,
  TableContainer,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { FC, useState } from "react"

import { PaginationProps } from "@/hooks/useDataTableUrlPagination"
import { SortingProps } from "@/hooks/useDataTableUrlSorting"
import { BondDetailMobileModal } from "@/modules/wallet/assets/MyBonds/BondDetailMobileModal"
import { MyBondsEmptyState } from "@/modules/wallet/assets/MyBonds/MyBondsEmptyState"
import {
  MyBond,
  useMyBondsColumns,
} from "@/modules/wallet/assets/MyBonds/MyBondsTable.columns"
import { TransferPositionModal } from "@/modules/wallet/assets/Transfer/TransferPositionModal"

type Props = {
  readonly data: Array<MyBond>
  readonly isLoading: boolean
  readonly searchPhrase: string
  readonly paginationProps: PaginationProps
  readonly sortingProps: SortingProps
}

export const MyBondsTable: FC<Props> = ({
  data,
  isLoading,
  searchPhrase,
  paginationProps,
  sortingProps,
}) => {
  const { isMobile } = useBreakpoints()
  const columns = useMyBondsColumns()
  const [isDetailOpen, setIsDetailOpen] = useState<{
    readonly type: "detail" | "transfer"
    readonly detail: MyBond
  } | null>(null)

  return (
    <TableContainer as={Paper}>
      <DataTable
        isLoading={isLoading}
        paginated
        {...paginationProps}
        {...sortingProps}
        globalFilter={searchPhrase}
        globalFilterFn={(row) =>
          row.original.symbol
            .toLowerCase()
            .includes(searchPhrase.toLowerCase()) ||
          row.original.name.toLowerCase().includes(searchPhrase.toLowerCase())
        }
        data={data}
        columns={columns}
        emptyState={<MyBondsEmptyState />}
        onRowClick={
          isMobile
            ? (detail) => setIsDetailOpen({ type: "detail", detail })
            : undefined
        }
      />
      <Modal
        variant="popup"
        open={!!isDetailOpen}
        onOpenChange={() =>
          setIsDetailOpen(
            isDetailOpen?.type === "transfer"
              ? { type: "detail", detail: isDetailOpen.detail }
              : null,
          )
        }
      >
        {isDetailOpen?.type === "detail" && (
          <BondDetailMobileModal
            bond={isDetailOpen.detail}
            onTransfer={() =>
              setIsDetailOpen({ type: "transfer", detail: isDetailOpen.detail })
            }
          />
        )}
        {isDetailOpen?.type === "transfer" && (
          <TransferPositionModal
            assetId={isDetailOpen.detail.id}
            onClose={() =>
              setIsDetailOpen({ type: "detail", detail: isDetailOpen.detail })
            }
          />
        )}
      </Modal>
    </TableContainer>
  )
}

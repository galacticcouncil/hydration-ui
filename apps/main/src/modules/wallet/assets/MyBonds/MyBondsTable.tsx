import {
  DataTable,
  Paper,
  TableContainer,
} from "@galacticcouncil/ui/components"
import { FC } from "react"

import { PaginationProps } from "@/hooks/useDataTableUrlPagination"
import { SortingProps } from "@/hooks/useDataTableUrlSorting"
import { MyBondsEmptyState } from "@/modules/wallet/assets/MyBonds/MyBondsEmptyState"
import {
  MyBond,
  useMyBondsColumns,
} from "@/modules/wallet/assets/MyBonds/MyBondsTable.columns"

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
  const columns = useMyBondsColumns()

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
      />
    </TableContainer>
  )
}

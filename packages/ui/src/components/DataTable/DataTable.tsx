import {
  ColumnDef,
  ColumnPinningState,
  FilterFnOption,
  flexRender,
  OnChangeFn,
  RowData,
  SortingState,
  Table as TableDef,
} from "@tanstack/react-table"
import { ChevronDown, ChevronUp } from "lucide-react"
import {
  ComponentProps,
  FC,
  ForwardedRef,
  forwardRef,
  Fragment,
  ReactNode,
  Ref,
  useImperativeHandle,
  useMemo,
} from "react"

import { Box } from "@/components/Box"
import { Button } from "@/components/Button"
import { Flex } from "@/components/Flex"
import { Icon } from "@/components/Icon"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableProps,
  TableRow,
  TableRowOverride,
} from "@/components/Table"
import { Text } from "@/components/Text"
import { getToken } from "@/utils"

import {
  getPaginationRange,
  useDataTable,
  UseDataTableOwnOptions,
} from "./DataTable.utils"
import { ExternalLink } from "@/components/ExternalLink"

export type DataTableProps<TData extends RowData> = TableProps &
  UseDataTableOwnOptions & {
    pageSize?: number
    pageNumber?: number
    globalFilter?: string
    initialSorting?: SortingState
    sorting?: SortingState
    manualSorting?: boolean
    enableSortingRemoval?: boolean
    data: TData[]
    emptyState?: ReactNode
    columns:
      | {
          [K in keyof Required<TData>]: ColumnDef<TData, TData[K]>
        }[keyof TData][]
      | ColumnDef<TData>[]
    className?: string
    columnPinning?: ColumnPinningState | undefined
    globalFilterFn?: FilterFnOption<TData>
    multiExpandable?: boolean
    rowCount?: number
    getIsExpandable?: (item: TData) => boolean
    renderSubComponent?: (item: TData) => React.ReactElement
    renderOverride?: (item: TData) => React.ReactElement | undefined
    onRowClick?: (item: TData) => void
    onSortingChange?: OnChangeFn<SortingState>
    onPageClick?: (number: number) => void
    getExternalLink?: (item: TData) => string | undefined
  }

export type DataTableRef = {
  readonly onPaginationReset: () => void
}

const DataTable = forwardRef(
  <TData,>(
    {
      data,
      columns,
      className,
      size = "medium",
      fixedLayout = false,
      paginated = false,
      expandable = false,
      pageSize = 20,
      pageNumber = 1,
      borderless,
      hoverable,
      isLoading,
      skeletonRowCount,
      globalFilter,
      initialSorting,
      sorting,
      manualSorting,
      enableSortingRemoval,
      globalFilterFn,
      emptyState,
      columnPinning,
      rowCount,
      getIsExpandable,
      renderSubComponent,
      renderOverride,
      onRowClick,
      onSortingChange,
      onPageClick,
      getExternalLink,
    }: DataTableProps<TData>,
    ref: ForwardedRef<DataTableRef>,
  ) => {
    const tableProps = {
      fixedLayout,
      size,
      borderless,
      hoverable,
    }

    const isControlledSorting =
      sorting !== undefined && onSortingChange !== undefined

    const table = useDataTable({
      data,
      columns,
      isLoading,
      paginated,
      expandable,
      skeletonRowCount,
      manualSorting,
      enableSortingRemoval,
      globalFilterFn: globalFilterFn ?? "auto",
      ...(rowCount && {
        rowCount,
        manualPagination: true,
      }),
      initialState: {
        pagination: {
          pageIndex: pageNumber - 1,
          pageSize,
        },
        sorting: initialSorting,
      },
      state: {
        globalFilter,
        columnPinning: columnPinning ?? {},
        // need this prevent disabling native sorting, cause undefined value disable it
        ...(isControlledSorting && {
          sorting,
        }),
      },
      ...(isControlledSorting && {
        onSortingChange,
      }),
    })

    useImperativeHandle(ref, () => ({
      onPaginationReset: () => table.resetPagination(),
    }))

    return (
      <>
        <Table {...tableProps} className={className}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const { meta } = header.getContext().column.columnDef
                  const isPinned = header.getContext().column.getIsPinned()
                  const size = header.getSize()

                  return (
                    <TableHead
                      key={header.id}
                      canSort={header.column.getCanSort()}
                      sortDirection={header.column.getIsSorted()}
                      onSort={header.column.getToggleSortingHandler()}
                      className={meta?.className}
                      sx={{
                        ...meta?.sx,
                        width: size !== 150 ? `${size}px` : "auto",
                      }}
                      isPinned={isPinned}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length || isLoading ? (
              table.getRowModel().rows.map((row) => {
                const override = isLoading
                  ? renderOverride?.(row.original)
                  : undefined

                const isRowExpanded = row.getIsExpanded()
                const isRowExpandable =
                  isRowExpanded ||
                  (!isLoading &&
                    !!expandable &&
                    !override &&
                    (getIsExpandable?.(row.original) ?? true))

                return (
                  <Fragment key={row.id}>
                    <DataTableExternalLink
                      sx={{
                        display: "contents",
                        textDecoration: "none",
                        color: "inherit",
                        "& td": {
                          verticalAlign: "middle",
                        },
                      }}
                      href={getExternalLink?.(row.original)}
                    >
                      <TableRow
                        data-expanded={isRowExpanded}
                        data-selected={row.getIsSelected()}
                        onClick={() => {
                          if (isRowExpandable) {
                            if (expandable === "single" && !isRowExpanded) {
                              table.resetExpanded()
                            }

                            row.toggleExpanded()
                          }
                          onRowClick?.(row.original)
                        }}
                        isExpandable={isRowExpandable}
                        hasOverride={!!override}
                        isClickable={!!onRowClick}
                      >
                        {row.getVisibleCells().map((cell) => {
                          const { meta } =
                            cell.getContext().cell.column.columnDef
                          const isPinned = cell
                            .getContext()
                            .cell.column.getIsPinned()

                          return (
                            <TableCell
                              key={cell.id}
                              className={meta?.className}
                              sx={meta?.sx}
                              isPinned={isPinned}
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </TableCell>
                          )
                        })}

                        {isRowExpandable && (
                          <TableCell>
                            <Flex justify="center" align="center">
                              <Icon
                                size={18}
                                color={getToken("icons.onSurface")}
                                component={
                                  isRowExpanded ? ChevronDown : ChevronUp
                                }
                              />
                            </Flex>
                          </TableCell>
                        )}
                      </TableRow>
                    </DataTableExternalLink>
                    {override && (
                      <TableRowOverride
                        colSpan={table.getVisibleLeafColumns().length + 1}
                      >
                        {override}
                      </TableRowOverride>
                    )}
                    {isRowExpandable && renderSubComponent && isRowExpanded && (
                      <TableRow>
                        <TableCell
                          colSpan={table.getVisibleLeafColumns().length + 1}
                        >
                          <Box py={16}>{renderSubComponent(row.original)}</Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                )
              })
            ) : (
              <TableRow isEmptyState>
                <TableCell colSpan={columns.length}>
                  {emptyState ?? "No results."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {!isLoading && paginated && table.getPageCount() > 1 && (
          <DataTablePagination table={table} onPageClick={onPageClick} />
        )}
      </>
    )
  },
)

type DataTablePaginationProps<T> = {
  table: TableDef<T>
  onPageClick?: (number: number) => void
}

export const DataTablePagination = <T,>({
  table,
  onPageClick,
}: DataTablePaginationProps<T>) => {
  const totalPages = table.getPageCount()
  const currentPage = table.getState().pagination.pageIndex + 1

  const pagination = useMemo(
    () => getPaginationRange(totalPages, currentPage),
    [currentPage, totalPages],
  )

  const onPageClickHandler = (number: number) => {
    table.setPageIndex(number - 1)
    onPageClick?.(number)
  }

  return (
    <Flex gap={6} p={10} justify="center">
      <Button
        size="small"
        variant="tertiary"
        disabled={!table.getCanPreviousPage()}
        onClick={() => table.previousPage()}
      >
        Prev
      </Button>
      {pagination.map((pageNumber, index) =>
        typeof pageNumber === "string" ? (
          <Text
            key={`${index}-dots`}
            width={32}
            fs={16}
            color={getToken("text.low")}
            sx={{ textAlign: "center" }}
          >
            &#8230;
          </Text>
        ) : (
          <Button
            key={`${index}-page`}
            minWidth={32}
            size="small"
            variant={pageNumber === currentPage ? "primary" : "tertiary"}
            onClick={() => onPageClickHandler(pageNumber)}
            sx={{ textAlign: "center" }}
          >
            {pageNumber}
          </Button>
        ),
      )}
      <Button
        size="small"
        variant="tertiary"
        disabled={!table.getCanNextPage()}
        onClick={() => table.nextPage()}
      >
        Next
      </Button>
    </Flex>
  )
}

type DataTableComponent = {
  <TData>(
    props: DataTableProps<TData> & { readonly ref?: Ref<DataTableRef> },
  ): JSX.Element
}

const DataTableWithType = DataTable as unknown as DataTableComponent

export { DataTableWithType as DataTable }

const DataTableExternalLink: FC<ComponentProps<typeof ExternalLink>> = ({
  href,
  ...props
}) => {
  return href ? <ExternalLink href={href} {...props} /> : props.children
}

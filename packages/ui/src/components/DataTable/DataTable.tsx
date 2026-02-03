import {
  ColumnDef,
  ColumnPinningState,
  FilterFnOption,
  flexRender,
  OnChangeFn,
  PaginationState,
  RowData,
  SortingState,
  Table as TableDef,
  VisibilityState,
} from "@tanstack/react-table"
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react"
import {
  ComponentProps,
  FC,
  Fragment,
  ReactNode,
  Ref,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react"

import { Box } from "@/components/Box"
import { Button } from "@/components/Button"
import { CollapsibleContent, CollapsibleRoot } from "@/components/Collapsible"
import {
  DataTableRowProvider,
  useDataTableRowContext,
} from "@/components/DataTable/DataTable.context"
import {
  SCollapsible,
  SPagination,
} from "@/components/DataTable/DataTable.styled"
import { ExternalLink } from "@/components/ExternalLink"
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
    columnVisibility?: VisibilityState
    pagination?: PaginationState
    globalFilterFn?: FilterFnOption<TData>
    multiExpandable?: boolean
    rowCount?: number
    isMultiSort?: boolean
    getIsExpandable?: (item: TData) => boolean
    getIsClickable?: (item: TData) => boolean
    renderSubComponent?: (item: TData) => React.ReactElement
    renderOverride?: (item: TData) => React.ReactElement | undefined
    onRowClick?: (item: TData) => void
    onSortingChange?: OnChangeFn<SortingState>
    onPageClick?: (number: number) => void
    getExternalLink?: (item: TData) => string | undefined
    ref?: Ref<DataTableRef>
  }

export type DataTableRef = {
  readonly onPaginationReset: () => void
}

export const DATA_TABLE_DEFAULT_PAGE_SIZE = 20

const DataTable = <TData,>({
  data,
  columns,
  className,
  size = "medium",
  fixedLayout = false,
  paginated = false,
  expandable = false,
  pageSize = DATA_TABLE_DEFAULT_PAGE_SIZE,
  pageNumber = 1,
  borderless,
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
  columnVisibility,
  pagination,
  rowCount,
  isMultiSort,
  getIsExpandable,
  getIsClickable,
  renderSubComponent,
  renderOverride,
  onRowClick,
  onSortingChange,
  onPageClick,
  getExternalLink,
  ref,
}: DataTableProps<TData>) => {
  const tableProps = {
    fixedLayout,
    size,
    borderless,
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
    ...(isMultiSort && { isMultiSortEvent: () => true }),
    ...(rowCount !== undefined && {
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
      ...(columnVisibility && {
        columnVisibility,
      }),
      ...(pagination && { pagination }),
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

              const isRowClickable =
                !isLoading &&
                !isRowExpandable &&
                (getIsClickable?.(row.original) ?? !!onRowClick)

              return (
                <DataTableRowProvider
                  table={table}
                  row={row}
                  expandable={expandable}
                  key={row.id}
                >
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
                        } else {
                          onRowClick?.(row.original)
                        }
                      }}
                      isExpandable={isRowExpandable}
                      hasOverride={!!override}
                      isClickable={isRowClickable}
                    >
                      {row.getVisibleCells().map((cell) => {
                        const { meta } = cell.getContext().cell.column.columnDef
                        const { className, sx, sxFn } = meta ?? {}
                        const isPinned = cell
                          .getContext()
                          .cell.column.getIsPinned()

                        return (
                          <TableCell
                            key={cell.id}
                            className={className}
                            sx={
                              sxFn ? sxFn(cell.getContext().row.original) : sx
                            }
                            isPinned={isPinned}
                            data-pinned={isPinned}
                            isClickable={isRowClickable}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        )
                      })}

                      {isRowExpandable && (
                        <TableCell sx={{ pl: "0 !important" }}>
                          <Flex justify="end" align="center">
                            <Icon
                              size="m"
                              color={getToken("icons.onSurface")}
                              component={
                                isRowExpanded ? ChevronUp : ChevronDown
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
                  {isRowExpandable && renderSubComponent && (
                    <DataTableCollapsibleRow
                      colSpan={table.getVisibleLeafColumns().length + 1}
                      isExpanded={isRowExpanded}
                    >
                      {renderSubComponent(row.original)}
                    </DataTableCollapsibleRow>
                  )}
                </DataTableRowProvider>
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
}

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
    <SPagination>
      <Button
        size="small"
        variant="tertiary"
        outline
        disabled={!table.getCanPreviousPage()}
        onClick={() => {
          onPageClick?.(table.getState().pagination.pageIndex)
          table.previousPage()
        }}
        sx={{ px: "l" }}
      >
        <Icon size="s" component={ChevronLeft} display={["block", "none"]} />
        <Text as="span" display={["none", "inline"]}>
          Prev
        </Text>
      </Button>
      {pagination.map((pageNumber, index) =>
        typeof pageNumber === "string" ? (
          <Text
            key={`${index}-dots`}
            width="l"
            fs="p2"
            color={getToken("text.low")}
            sx={{ textAlign: "center" }}
          >
            &#8230;
          </Text>
        ) : (
          <Button
            key={`${index}-page`}
            size="small"
            variant={pageNumber === currentPage ? "secondary" : "tertiary"}
            outline={pageNumber !== currentPage}
            onClick={() => onPageClickHandler(pageNumber)}
            sx={{ px: "base", minWidth: "1.5rem" }}
          >
            {pageNumber}
          </Button>
        ),
      )}
      <Button
        size="small"
        variant="tertiary"
        outline
        disabled={!table.getCanNextPage()}
        onClick={() => {
          onPageClick?.(table.getState().pagination.pageIndex + 2)
          table.nextPage()
        }}
        sx={{ px: "l" }}
      >
        <Text as="span" display={["none", "inline"]}>
          Next
        </Text>
        <Icon size="s" component={ChevronRight} display={["block", "none"]} />
      </Button>
    </SPagination>
  )
}

type DataTableComponent = {
  <TData>(
    props: DataTableProps<TData> & { readonly ref?: Ref<DataTableRef> },
  ): React.JSX.Element
}

const DataTableWithType = DataTable as unknown as DataTableComponent

export { DataTableWithType as DataTable }

const DataTableExternalLink: FC<ComponentProps<typeof ExternalLink>> = ({
  href,
  ...props
}) => {
  return href ? <ExternalLink href={href} {...props} /> : props.children
}

type DataTableCollapsibleRowProps = {
  colSpan: number
  isExpanded: boolean
  children: ReactNode
}

const DataTableCollapsibleRow: FC<DataTableCollapsibleRowProps> = ({
  colSpan,
  isExpanded,
  children,
}) => {
  const [isVisible, setIsVisible] = useState(isExpanded)

  useEffect(() => {
    if (isExpanded) {
      setIsVisible(true)
    }
  }, [isExpanded])

  const handleAnimationEnd = () => {
    if (!isExpanded) {
      setIsVisible(false)
    }
  }

  return (
    <TableRow sx={{ display: isVisible ? "table-row" : "none" }}>
      <TableCell colSpan={colSpan} sx={{ p: "0!important" }}>
        <CollapsibleRoot open={isExpanded}>
          <CollapsibleContent onAnimationEnd={handleAnimationEnd}>
            <SCollapsible>{children}</SCollapsible>
          </CollapsibleContent>
        </CollapsibleRoot>
      </TableCell>
    </TableRow>
  )
}

export const DataTableExpandTrigger: FC<{
  readonly children: ReactNode
}> = ({ children }) => {
  const { table, row, expandable } = useDataTableRowContext()

  return (
    <Box
      onClick={() => {
        if (expandable === "single" && !row.getIsExpanded()) {
          table.resetExpanded()
        }

        row.toggleExpanded()
      }}
      asChild
    >
      {children}
    </Box>
  )
}

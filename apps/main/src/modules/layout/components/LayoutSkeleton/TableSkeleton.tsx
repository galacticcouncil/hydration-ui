import {
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableSize,
} from "@galacticcouncil/ui/components"
import { useResponsiveValue } from "@galacticcouncil/ui/theme"
import type { ResponsiveStyleValue } from "@galacticcouncil/ui/types"
import { FC } from "react"

type TableSkeletonProps = {
  readonly size?: TableSize
  readonly rows?: ResponsiveStyleValue<number>
  readonly cols?: ResponsiveStyleValue<number>
}

export const TableSkeleton: FC<TableSkeletonProps> = ({
  size = "medium",
  ...props
}) => {
  const rows = useResponsiveValue(props.rows, 5)
  const cols = useResponsiveValue(props.cols, 4)

  return (
    <TableContainer as={Paper}>
      <Table size={size}>
        <TableHeader>
          <TableRow>
            {Array.from({ length: cols }, (_, i) => (
              <TableHead key={i}>
                <Skeleton height="1em" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }, (_, rowIndex) => (
            <TableRow key={rowIndex}>
              {Array.from({ length: cols }, (_, colIndex) => (
                <TableCell key={colIndex}>
                  <Skeleton height="1em" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

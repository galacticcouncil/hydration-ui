import {
  Box,
  DataTable,
  Paper,
  SectionHeader,
  Separator,
  TableContainer,
  TableRowAction,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { Link } from "@tanstack/react-router"
import { ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { TBond } from "@/api/assets"
import { AssetLabelFull } from "@/components/AssetLabelFull"
import { getDefaultBondApr } from "@/modules/strategies/stable-bonds/utils/apr"

const columnHelper = createColumnHelper<TBond>()

const useColumns = () => {
  const { t } = useTranslation(["common", "strategies"])

  return useMemo(
    () =>
      [
        columnHelper.accessor("symbol", {
          id: "asset",
          header: t("common:bond"),
          cell: ({ row }) => <AssetLabelFull asset={row.original} />,
        }),
        columnHelper.accessor("maturity", {
          id: "maturity",
          header: t("strategies:bonds.position.maturityDate"),
          cell: ({ row }) =>
            t("common:date.date", { value: new Date(row.original.maturity) }),
        }),
        columnHelper.display({
          id: "apr",
          header: t("common:apr"),
          cell: ({ row }) => {
            const apr = getDefaultBondApr(row.original.id)
            return apr ? (
              <Text as="span" color={getToken("accents.success.emphasis")}>
                {t("common:percent", {
                  value: apr,
                  maximumFractionDigits: 2,
                  suffix: "+",
                })}
              </Text>
            ) : (
              "-"
            )
          },
        }),
        columnHelper.display({
          id: "actions",
          cell: ({ row }) => (
            <Box display="flex">
              <TableRowAction asChild ml="auto">
                <Link
                  to="/strategies/hollar-bonds/$bondId"
                  params={{ bondId: row.original.id }}
                >
                  {t("common:details")}
                </Link>
              </TableRowAction>
            </Box>
          ),
        }),
      ] as Array<ColumnDef<TBond>>,
    [t],
  )
}

export type StableBondsPastSalesProps = {
  bonds: TBond[]
}

export const StableBondsPastSales: React.FC<StableBondsPastSalesProps> = ({
  bonds,
}) => {
  const { t } = useTranslation("strategies")
  const columns = useColumns()

  return (
    <Paper>
      <Box p="xl">
        <SectionHeader
          title={t("bonds.pastSales.title")}
          as="h2"
          noTopPadding
          hasDescription
        />
      </Box>
      <Separator />
      <TableContainer borderRadius="xl">
        <DataTable data={bonds} columns={columns} />
      </TableContainer>
    </Paper>
  )
}

import { Add } from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  DataTable,
  Flex,
  Paper,
  SectionHeader,
  TableContainer,
} from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import {
  useWalletLiquidityColumns,
  WalletLiquidityRow,
} from "@/modules/wallet/WalletLiquidity.columns"

const data: WalletLiquidityRow[] = [
  {
    id: "1",
    numberOfPositions: 1,
    currentValue: {
      balance: 2855.24,
      asset1Id: "0",
      asset1Amount: "152000000000000",
      asset2Id: "2",
      asset2Amount: "200000000000000000000",
    },
  },
  {
    id: "2",
    numberOfPositions: 2,
    currentValue: {
      balance: 2855.24,
      asset1Id: "0",
      asset1Amount: "152000000000000",
      asset2Id: "2",
      asset2Amount: "200000000000000000000",
    },
  },
  {
    id: "3",
    numberOfPositions: 3,
    currentValue: {
      balance: 2855.24,
      asset1Id: "0",
      asset1Amount: "152000000000000",
      asset2Id: "2",
      asset2Amount: "200000000000000000000",
    },
  },
]

type Props = {
  readonly search: string
}

export const WalletLiquidity: FC<Props> = ({ search }) => {
  const { t } = useTranslation("wallet")
  const columns = useWalletLiquidityColumns()

  return (
    <div>
      <Flex justify="space-between" align="center">
        <SectionHeader>{t("liquidity.table.header.title")}</SectionHeader>
        <Button size="medium" iconStart={Add}>
          {t("liquidity.table.header.cta")}
        </Button>
      </Flex>
      <TableContainer as={Paper}>
        <DataTable
          data={data}
          columns={columns}
          paginated
          pageSize={10}
          globalFilter={search}
        />
      </TableContainer>
    </div>
  )
}

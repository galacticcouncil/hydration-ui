import { FileDown } from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  DataTable,
  Flex,
  Paper,
  Separator,
  TableContainer,
} from "@galacticcouncil/ui/components"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { useQuery } from "@tanstack/react-query"
import { useSearch } from "@tanstack/react-router"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { useWalletTransactionsColumns } from "@/modules/wallet/transactions/WalletTransactionsTable.columns"
import { walletTransactionsQuery } from "@/modules/wallet/transactions/WalletTransactionsTable.data"
import { groupTransactionsByDate } from "@/modules/wallet/transactions/WalletTransactionsTable.utils"
type Props = {
  readonly searchPhrase: string
}

export const WalletTransactionsTable = ({ searchPhrase }: Props) => {
  const { t } = useTranslation()

  const { type } = useSearch({
    from: "/_wallet/wallet/transactions",
  })

  const columns = useWalletTransactionsColumns()
  const { data = [], isLoading } = useQuery(walletTransactionsQuery(type))
  const groupedTransactions = useMemo(
    () => groupTransactionsByDate(data),
    [data],
  )

  return (
    <TableContainer as={Paper}>
      <Flex
        px={20}
        py={getTokenPx("scales.paddings.m")}
        justify="flex-end"
        align="center"
      >
        <Button variant="accent" outline iconStart={FileDown}>
          {t("downloadCsv")}
        </Button>
      </Flex>
      <Separator />
      <DataTable
        paginated
        data={groupedTransactions}
        columns={columns}
        isLoading={isLoading}
        globalFilter={searchPhrase}
      />
    </TableContainer>
  )
}

import {
  Button,
  DataTable,
  Flex,
  Paper,
  Separator,
  TableContainer,
} from "@galacticcouncil/ui/components"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { sleep } from "@galacticcouncil/utils"
import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import {
  TransactionMock,
  useWalletTransactionsColumns,
} from "@/modules/wallet/transactions/WalletTransactionsTable.columns"
type Props = {
  readonly searchPhrase: string
}

export const WalletTransactionsTable = ({ searchPhrase }: Props) => {
  const { t } = useTranslation()
  const columns = useWalletTransactionsColumns()

  const { data = [], isLoading } = useQuery({
    queryKey: ["wallet-transactions"],
    queryFn: () =>
      sleep(1000).then(
        (): Array<TransactionMock> => [
          {
            type: "Deposit",
            timestamp: "2025-03-24",
            assetId: "1",
            total: "100000000000000000",
            transferable: "100000000000000000",
            addressFrom: "0x10e0271ec47d55511a047516f2a7301801d55eab",
            addressTo: "0xb5643598496b159263c67bd0d25728713f5aad04",
          },
          {
            type: "Withdraw",
            timestamp: "2025-03-24",
            assetId: "10",
            total: "100000000000000",
            transferable: "100000000000000",
            addressFrom: "0x10e0271ec47d55511a047516f2a7301801d55eab",
            addressTo: "0xb5643598496b159263c67bd0d25728713f5aad04",
          },
        ],
      ),
  })

  return (
    <TableContainer as={Paper}>
      <Flex
        px={20}
        py={getTokenPx("scales.paddings.m")}
        justify="flex-end"
        align="center"
      >
        <Button variant="accent" outline size="small">
          {t("downloadCsv")}
        </Button>
      </Flex>
      <Separator />
      <DataTable
        paginated
        data={data}
        columns={columns}
        isLoading={isLoading}
      />
    </TableContainer>
  )
}

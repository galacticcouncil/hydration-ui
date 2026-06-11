import {
  DataTable,
  Flex,
  Paper,
  TableContainer,
  Text,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import {
  HYDRATION_OCN_URN,
  XcBalance,
  XcOcnUrn,
} from "@/modules/balances/api/xcBalanceTypes"
import { useBalancesTableColumns } from "@/modules/balances/components/BalancesTable.columns"
import { useBalancesTableData } from "@/modules/balances/components/BalancesTable.data"
import { resolveChainFromUrn } from "@/modules/xcm/history/utils/claim"

type Props = {
  chainId: XcOcnUrn
  balances: XcBalance[]
}

export const BalancesChainTable: FC<Props> = ({ chainId, balances }) => {
  const { t } = useTranslation("common")
  const isHydration = chainId === HYDRATION_OCN_URN
  const columns = useBalancesTableColumns(isHydration)
  const { data, totalUsd, isPriceLoading } = useBalancesTableData(
    chainId,
    balances,
  )
  const chainName = resolveChainFromUrn(chainId)?.name ?? chainId

  return (
    <TableContainer as={Paper}>
      <Flex
        justify="space-between"
        align="center"
        gap="base"
        pt="xl"
        px="xl"
        wrap
      >
        <Text fs="base" font="primary" fw={500}>
          {chainName}
        </Text>
        {isHydration && (
          <ValueStats
            wrap
            size="small"
            label={t("totalValue")}
            isLoading={isPriceLoading}
            value={t("currency", {
              value: totalUsd,
              maximumFractionDigits: 2,
            })}
          />
        )}
      </Flex>
      <DataTable
        data={data}
        columns={columns}
        initialSorting={[{ id: "balance", desc: true }]}
      />
    </TableContainer>
  )
}

import { BondsTable } from "./table/BondsTable"
import { Skeleton } from "./table/skeleton/Skeleton"
import { useTokensBalances } from "api/balances"
import { useAccountStore } from "state/store"
import { Bond } from "api/bonds"
import { pluck } from "utils/rx"
import { BondTableItem } from "./table/BondsTable.utils"
import { useTranslation } from "react-i18next"

interface Props {
  bonds: Bond[]
  isLoading?: boolean
}

export const MyActiveBonds = ({ bonds, ...props }: Props) => {
  const { t } = useTranslation()
  const { account } = useAccountStore()
  const balances = useTokensBalances(pluck("id", bonds), account?.address)

  const isLoading =
    pluck("isLoading", balances).some(Boolean) || props.isLoading

  const tableProps = {
    title: t("bonds.table.title"),
    showTransactions: false,
  }

  if (isLoading) {
    return <Skeleton {...tableProps} />
  }

  const bondMap = new Map(bonds.map((bond) => [bond.id, bond]))

  const data = balances
    .filter((balance) => balance.data?.assetId)
    .map<BondTableItem>((balance) => {
      const id = balance.data?.assetId?.toString() ?? ""
      const assetId = bondMap.get(id)?.assetId ?? ""

      return {
        assetId,
        maturity: bondMap.get(id)?.maturity,
        balance: balance.data?.total?.toString(),
        price: "",
      }
    })

  return <BondsTable {...tableProps} data={data} />
}

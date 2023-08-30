import { BondsTable } from "./table/BondsTable"
import { Skeleton } from "./table/skeleton/Skeleton"
import { useTokensBalances } from "api/balances"
import { useAccountStore } from "state/store"
import { Bond } from "api/bonds"
import { pluck } from "utils/rx"
import { BondTableItem } from "./table/BondsTable.utils"
import { useTranslation } from "react-i18next"
import { u32 } from "@polkadot/types-codec"
import { u8 } from "@polkadot/types"

interface Props {
  bonds: Bond[]
  metas: { id: string; decimals: u32 | u8 }[]
  isLoading?: boolean
}

export const MyActiveBonds = ({ bonds, metas, ...props }: Props) => {
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
  const metaMap = new Map(metas.map((meta) => [meta.id, meta]))

  const data = balances
    .filter((balance) => balance.data?.assetId)
    .map<BondTableItem>((balance) => {
      const id = balance.data?.assetId?.toString() ?? ""
      const assetId = bondMap.get(id)?.assetId ?? ""

      const assetMeta = metaMap.get(assetId)
      const shiftBy = assetMeta?.decimals
        ? assetMeta.decimals.neg().toNumber()
        : -12

      return {
        assetId,
        maturity: bondMap.get(id)?.maturity,
        balance: balance.data?.total?.shiftedBy(shiftBy).toString(),
        price: "",
      }
    })

  return <BondsTable {...tableProps} data={data} />
}

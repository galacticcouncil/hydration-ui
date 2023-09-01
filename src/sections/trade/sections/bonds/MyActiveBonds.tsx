import { BondsTable } from "./table/BondsTable"
import { Skeleton } from "./table/skeleton/Skeleton"
import { useTokensBalances } from "api/balances"
import { useAccountStore } from "state/store"
import { useBonds } from "api/bonds"
import { pluck } from "utils/rx"
import { BondTableItem } from "./table/BondsTable.utils"
import { useTranslation } from "react-i18next"
import { Placeholder } from "./table/placeholder/Placeholder"
import { BN_0 } from "utils/constants"
import { useAssetMetaList } from "api/assetMeta"

type Props = {
  showTransactions?: boolean
  showTransfer?: boolean
  id?: string
}

export const MyActiveBonds = ({
  showTransactions,
  showTransfer,
  id,
}: Props) => {
  const { t } = useTranslation()
  const { account } = useAccountStore()

  const bonds = useBonds(id)
  const metas = useAssetMetaList(bonds.data?.map((bond) => bond.assetId) ?? [])

  const bondsData = bonds?.data ?? []
  const metasData = metas?.data ?? []

  const balances = useTokensBalances(pluck("id", bondsData), account?.address)

  const isLoading =
    pluck("isLoading", balances).some(Boolean) || bonds.isLoading

  const tableProps = {
    title: t("bonds.table.title"),
    showTransactions,
    showTransfer,
  }

  if (!account) {
    return <Placeholder {...tableProps} />
  }

  if (isLoading) {
    return <Skeleton {...tableProps} />
  }

  const bondMap = new Map(bondsData.map((bond) => [bond.id, bond]))
  const metaMap = new Map(metasData.map((meta) => [meta.id, meta]))

  const data = balances
    .filter((balance) => balance.data?.assetId && balance.data?.total?.gt(BN_0))
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

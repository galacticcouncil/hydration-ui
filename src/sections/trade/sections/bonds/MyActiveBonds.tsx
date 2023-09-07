import { BondsTable } from "./table/BondsTable"
import { Skeleton } from "./table/skeleton/Skeleton"
import { useTokensBalances } from "api/balances"
import { useAccountStore } from "state/store"
import { useBonds, useLbpPool } from "api/bonds"
import { pluck } from "utils/rx"
import { BondTableItem } from "./table/BondsTable.utils"
import { useTranslation } from "react-i18next"
import { Placeholder } from "./table/placeholder/Placeholder"
import { BN_0 } from "utils/constants"
import { useAssetMetaList } from "api/assetMeta"
import { useBestNumber } from "api/chain"

type Props = {
  showTransactions?: boolean
  showTransfer?: boolean
  assetId?: string
}

export const MyActiveBonds = ({
  showTransactions,
  showTransfer,
  assetId,
}: Props) => {
  const { t } = useTranslation()
  const { account } = useAccountStore()

  const bestNumber = useBestNumber()
  const lbpPools = useLbpPool()
  const bonds = useBonds()
  const bondsData =
    (assetId
      ? bonds.data?.filter((bond) => bond.assetId === assetId)
      : bonds.data) ?? []

  const metas = useAssetMetaList(
    assetId ? [assetId] : bonds.data?.map((bond) => bond.assetId) ?? [],
  )

  const metasData = metas?.data ?? []

  const balances = useTokensBalances(pluck("id", bondsData), account?.address)

  const isLoading =
    pluck("isLoading", balances).some(Boolean) ||
    bonds.isLoading ||
    lbpPools.isLoading

  const tableProps = {
    title: assetId
      ? t("bonds.table.title.withSymbol", { symbol: metasData[0].symbol })
      : t("bonds.table.title"),
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

  const currentBlockNumber =
    bestNumber.data?.relaychainBlockNumber.toNumber() ?? 0

  const data = balances
    .filter((balance) => balance.data?.assetId && balance.data?.total?.gt(BN_0))
    .map<BondTableItem>((balance) => {
      const id = balance.data?.assetId?.toString() ?? ""
      const bond = bondMap.get(id)
      const assetId = bond?.assetId ?? ""

      const lbpPool = lbpPools.data?.find((lbpPool) =>
        lbpPool.assets.some((asset) => asset === bond?.id),
      )
      const isSale = lbpPool
        ? currentBlockNumber > Number(lbpPool.start) &&
          currentBlockNumber < Number(lbpPool.end)
        : false

      const assetIn = lbpPool?.assets.find((asset) => asset !== bond?.id)

      const assetMeta = metaMap.get(assetId)
      const shiftBy = assetMeta?.decimals
        ? assetMeta.decimals.neg().toNumber()
        : -12

      return {
        assetId,
        assetIn,
        maturity: bondMap.get(id)?.maturity,
        balance: balance.data?.total,
        balanceHuman: balance.data?.total?.shiftedBy(shiftBy).toString(),
        price: "",
        bondId: bond?.id,
        isSale,
      }
    })

  return <BondsTable {...tableProps} data={data} />
}

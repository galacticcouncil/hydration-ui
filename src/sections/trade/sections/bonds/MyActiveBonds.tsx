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
import { useBestNumber } from "api/chain"
import { useState } from "react"
import { useRpcProvider } from "providers/rpcProvider"

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
  const { assets } = useRpcProvider()
  const { account } = useAccountStore()

  const [allAssets, setAllAssets] = useState(false)

  const bestNumber = useBestNumber()
  const lbpPools = useLbpPool()
  const bonds = useBonds()
  const bondsData =
    (assetId
      ? bonds.data?.filter((bond) => bond.assetId === assetId)
      : bonds.data) ?? []

  const metas = assets.getAssets(
    assetId ? [assetId] : bonds.data?.map((bond) => bond.assetId) ?? [],
  )

  const metasData = metas ?? []

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

  const data =
    bonds.data?.reduce<BondTableItem[]>((acc, item) => {
      const balance = balances.find(
        (balance) => balance.data?.assetId.toString() === item.id,
      )

      const { assetId, total } = balance?.data ?? {}

      if (balance && (allAssets ? total?.gte(BN_0) : total?.gt(BN_0))) {
        const id = assetId?.toString() ?? ""
        const bond = bondMap.get(id)
        const bondAssetId = bond?.assetId ?? ""

        const lbpPool = lbpPools.data?.find((lbpPool) =>
          lbpPool.assets.some((asset: number) => asset === Number(bond?.id)),
        )

        const isSale = lbpPool
          ? currentBlockNumber > Number(lbpPool.start) &&
            currentBlockNumber < Number(lbpPool.end)
          : false

        const assetIn = lbpPool?.assets
          .find((asset: number) => asset !== Number(bond?.id))
          ?.toString()

        const assetMeta = metaMap.get(bondAssetId)
        const shiftBy = assetMeta?.decimals ? assetMeta.decimals : 12

        acc.push({
          assetId: bondAssetId,
          assetIn,
          maturity: bondMap.get(id)?.maturity,
          balance: balance.data?.total,
          balanceHuman: balance.data?.total?.shiftedBy(-shiftBy).toString(),
          price: "",
          bondId: bond?.id,
          isSale,
        })
      }

      return acc
    }, []) ?? []

  return (
    <BondsTable
      {...tableProps}
      data={data}
      allAssets={allAssets}
      setAllAssets={setAllAssets}
    />
  )
}

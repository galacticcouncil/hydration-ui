import { BondsTable } from "./table/BondsTable"
import { Skeleton } from "./table/skeleton/Skeleton"
import { useTokensBalances } from "api/balances"
import { useAccountStore } from "state/store"
import { useBondsEvents, useLbpPool } from "api/bonds"
import { pluck } from "utils/rx"
import { useTranslation } from "react-i18next"
import { Placeholder } from "./table/placeholder/Placeholder"
import { useBestNumber } from "api/chain"
import { useState } from "react"
import { useRpcProvider } from "providers/rpcProvider"
import { isNotNil } from "utils/helpers"
import { BN_0 } from "utils/constants"
import BN from "bignumber.js"
import { format } from "date-fns"
import { Transaction } from "./table/transactions/Transactions.utils"
import { BondTableItem } from "./table/BondsTable.utils"

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
  const { assets } = useRpcProvider()
  const { account } = useAccountStore()

  const [allAssets, setAllAssets] = useState(false)

  const bestNumber = useBestNumber()
  const lbpPools = useLbpPool()
  const bonds = assets.bonds
  const bondsData = (id ? bonds.filter((bond) => bond.id === id) : bonds) ?? []

  const balances = useTokensBalances(pluck("id", bondsData), account?.address)

  const bondsBalances = balances.filter((balance) => balance.data?.total.gt(0))

  const bondEvents = useBondsEvents(
    bondsBalances.map((bondBalance) => bondBalance.data?.assetId.toString()) ??
      [],
    true,
  )

  const isLoading =
    pluck("isLoading", balances).some(Boolean) ||
    lbpPools.isLoading ||
    bondEvents.some((event) => event.isLoading)

  const tableProps = {
    title: t("bonds.table.title"),
    showTransactions,
    showTransfer,
  }

  if (!isLoading && !bondsBalances.length) return null

  if (!account) {
    return <Placeholder {...tableProps} />
  }

  if (isLoading) {
    return <Skeleton {...tableProps} />
  }

  const bondMap = new Map(bondsData.map((bond) => [bond.id, bond]))

  const currentBlockNumber =
    bestNumber.data?.relaychainBlockNumber.toNumber() ?? 0

  let data: BondTableItem[]

  const bondsWithBalance = bondsBalances
    .map((bondBalance) => {
      const id = bondBalance.data?.assetId.toString() ?? ""
      const bond = bondMap.get(id)

      const isLoaded = bondEvents.every((bondEvent) => bondEvent.data)

      if (!bond || !isLoaded) return undefined

      const eventsQuery = bondEvents.find(
        (bondEvent) => bondEvent.data?.bondId === id,
      )
      let accumulatedAssetId: string | undefined

      const events =
        eventsQuery?.data?.events.reduce((acc, event) => {
          const date = format(
            new Date(event.block.timestamp),
            "dd/MM/yyyy HH:mm",
          )

          const assetInId = event.args.assetIn
          const assetOutId = event.args.assetOut

          const metaIn = assets.getAsset(assetInId.toString())
          const metaOut = assets.getAsset(assetOutId.toString())

          const isBuy = event.name === "LBP.BuyExecuted"
          const amountIn = BN(event.args.amount).shiftedBy(-metaIn.decimals)

          const amountOut = BN(
            event.args[isBuy ? "buyPrice" : "salePrice"],
          ).shiftedBy(-metaOut.decimals)

          const price =
            event.args.assetOut !== Number(id)
              ? amountOut.div(amountIn)
              : amountIn.div(amountOut)

          const assetIn = {
            assetId: assets.isBond(metaIn) ? metaIn.assetId : metaIn.id,
            symbol: metaIn.symbol,
            amount: amountIn.toString(),
          }

          const assetOut = {
            assetId: assets.isBond(metaOut) ? metaOut.assetId : metaOut.id,
            symbol: metaOut.symbol,
            amount: amountOut.toString(),
          }

          const link = `https://hydradx.subscan.io/extrinsic/${event.extrinsic.hash}`

          accumulatedAssetId = assets.isBond(metaIn) ? metaOut.id : metaIn.id

          acc.push({
            date,
            in: assetIn,
            out: assetOut,
            isBuy,
            price,
            link,
          })

          return acc
        }, [] as Transaction[]) ?? []

      const averagePrice = events
        ?.reduce((acc, event) => acc.plus(event.price), BN_0)
        .div(events.length)

      const bondAssetId = bond.assetId
      const lbpPool = lbpPools.data?.find((lbpPool) =>
        lbpPool.assets.some((asset: number) => asset === Number(bond?.id)),
      )

      const isSale = lbpPool
        ? currentBlockNumber > Number(lbpPool.start) &&
          currentBlockNumber < Number(lbpPool.end)
        : false

      return {
        assetId: bondAssetId,
        assetIn: accumulatedAssetId,
        maturity: bondMap.get(id)?.maturity,
        balance: bondBalance.data?.total,
        balanceHuman: bondBalance.data?.total
          ?.shiftedBy(-bond.decimals)
          .toString(),
        price: "",
        bondId: bond.id,
        isSale,
        averagePrice,
        events,
      }
    })
    .filter(isNotNil)

  data = bondsWithBalance

  if (allAssets) {
    const bondsWithoutBalance = bonds.reduce<BondTableItem[]>((acc, bond) => {
      const isBalance = bondsWithBalance.some(
        (bondWithBalance) => bondWithBalance.bondId === bond.id,
      )

      if (!isBalance) {
        const id = bond.id
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

        acc.push({
          assetId: bond.assetId,
          assetIn,
          maturity: bondMap.get(id)?.maturity,
          balance: BN_0,
          balanceHuman: "0",
          price: "",
          bondId: id,
          isSale,
          averagePrice: BN_0,
          events: [],
        })
      }

      return acc
    }, [])

    data = [...bondsWithBalance, ...bondsWithoutBalance]
  }

  return (
    <BondsTable
      {...tableProps}
      data={data}
      allAssets={allAssets}
      setAllAssets={setAllAssets}
    />
  )
}

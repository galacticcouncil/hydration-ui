import { WhTransfer } from "@galacticcouncil/xcm-sdk"
import { createColumnHelper } from "@tanstack/react-table"
import { useEthereumTokens } from "api/external/ethereum"
import { differenceInHours } from "date-fns"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useMedia } from "react-use"
import { TransferAmountColumn } from "sections/wallet/assets/wormhole/components/TransferAmountColumn"
import { TransferChainPairColumn } from "sections/wallet/assets/wormhole/components/TransferChainPairColumn"
import { TransferStatusColumn } from "sections/wallet/assets/wormhole/components/TransferStatusColumn"
import { theme } from "theme"

const columnHelper = createColumnHelper<WhTransfer>()

export const useWormholeTransfersColumns = () => {
  const { t } = useTranslation()
  const tokens = useEthereumTokens()
  const isMobile = useMedia(theme.viewport.lt.md)

  return useMemo(() => {
    const amount = columnHelper.display({
      id: "amount",
      header: t("amount"),
      cell: ({ row }) => {
        const { amount, asset, assetSymbol } = row.original

        const assetData = tokens.get(asset.toLowerCase())

        if (!assetData) {
          return t("value.tokenWithSymbol", {
            value: amount,
            symbol: assetSymbol,
          })
        }

        return <TransferAmountColumn asset={assetData} amount={amount} />
      },
    })

    const fromTo = columnHelper.display({
      id: "fromTo",
      header: t("wormhole.transfers.table.column.pair"),
      cell: ({ row }) => {
        const { fromChain, toChain, from, to } = row.original
        return (
          fromChain &&
          toChain && (
            <TransferChainPairColumn
              fromChain={fromChain}
              toChain={toChain}
              from={from}
              to={to}
            />
          )
        )
      },
    })

    const time = columnHelper.display({
      id: "time",
      header: t("wormhole.transfers.table.column.time"),
      cell: ({ row }) => {
        const { operation } = row.original
        const date = new Date(operation.sourceChain.timestamp)
        return (
          <time
            title={t("date.datetime", { value: date })}
            dateTime={date.toISOString()}
          >
            {differenceInHours(Date.now(), date) >= 24
              ? t("date.datetime", {
                  value: date,
                })
              : t("date.relative", {
                  value: date,
                })}
          </time>
        )
      },
    })

    const status = columnHelper.display({
      id: "status",
      header: t("wormhole.transfers.table.column.status"),
      meta: {
        sx: {
          textAlign: "right",
        },
      },
      cell: ({ row }) => {
        return <TransferStatusColumn transfer={row.original} />
      },
    })

    return isMobile ? [fromTo, amount, status] : [fromTo, amount, time, status]
  }, [isMobile, t, tokens])
}

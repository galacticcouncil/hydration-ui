import { createColumnHelper } from "@tanstack/react-table"
import { Transfer } from "api/wormhole/types"
import { Spinner } from "components/Spinner/Spinner"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { TransferStatusColumn } from "sections/xcm/wormhole/components/TransferStatusColumn"
import { TransferStatusMap } from "sections/xcm/wormhole/WormholePage.query"
import { useEthereumTokens } from "api/external/ethereum"
import { useMedia } from "react-use"
import { TransferAmountColumn } from "sections/xcm/wormhole/components/TransferAmountColumn"
import { TransferChainColumn } from "sections/xcm/wormhole/components/TransferChainColumn"
import { TransferChainPairColumn } from "sections/xcm/wormhole/components/TransferChainPairColumn"
import { theme } from "theme"

const columnHelper = createColumnHelper<Transfer>()

export const useWormholeTransfersColumns = (statusMap: TransferStatusMap) => {
  const { t } = useTranslation()
  const isMobile = useMedia(theme.viewport.lt.sm)
  const tokens = useEthereumTokens()

  return useMemo(() => {
    const amount = columnHelper.display({
      id: "amount",
      header: t("amount"),
      cell: ({ row }) => {
        const { data } = row.original

        const asset = tokens.get(data.id.toLowerCase())

        return (
          asset && (
            <TransferAmountColumn asset={asset} amount={data.tokenAmount} />
          )
        )
      },
    })

    const fromTo = columnHelper.display({
      id: "fromTo",
      header: t("wormhole.transfers.table.column.pair"),
      cell: ({ row }) => {
        const { content } = row.original
        const { fromChain, toChain } = content.info
        return (
          <TransferChainPairColumn fromChain={fromChain} toChain={toChain} />
        )
      },
    })

    const from = columnHelper.display({
      id: "from",
      header: t("wormhole.transfers.table.column.from"),
      cell: ({ row }) => {
        const { content } = row.original
        const { fromChain, from } = content.info
        return <TransferChainColumn chain={fromChain} address={from} />
      },
    })

    const to = columnHelper.display({
      id: "to",
      header: t("wormhole.transfers.table.column.to"),
      cell: ({ row }) => {
        const { content } = row.original
        const { toChain, to } = content.info
        return <TransferChainColumn chain={toChain} address={to} />
      },
    })

    const time = columnHelper.display({
      id: "time",
      header: t("wormhole.transfers.table.column.time"),
      cell: ({ row }) => {
        const { sourceChain } = row.original
        const date = new Date(Number(sourceChain.timestamp) * 1000)
        return t("toast.date", {
          value: date,
        })
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
        const status = statusMap.get(row.original.id)
        if (!status) {
          return <Spinner size={14} css={{ display: "inline-flex" }} />
        }
        return <TransferStatusColumn status={status} />
      },
    })

    return isMobile
      ? [amount, fromTo, status]
      : [amount, from, to, time, status]
  }, [isMobile, statusMap, t, tokens])
}

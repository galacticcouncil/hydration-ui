import request from "graphql-request"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { u8aToHex } from "@polkadot/util"
import { decodeAddress } from "@polkadot/util-crypto"
import { MoneyMarketEventsDocument } from "graphql/__generated__/squid/graphql"
import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { BorrowTransactionType } from "sections/lending/subsections/transactions/LendingTransactionsFilter.utils"
import { EventName } from "sections/lending/subsections/transactions/types"
import { PaginationState } from "@tanstack/react-table"
import { useAssets } from "providers/assets"
import { useMemo } from "react"

export const useMoneyMarketEvents = (
  filter: BorrowTransactionType | null,
  searchPhrase: string,
  pagination: PaginationState,
) => {
  const { all } = useAssets()

  const { account } = useAccount()
  const hexAddress = !!account?.address
    ? u8aToHex(decodeAddress(account.address))
    : ""

  const eventNames = ((): Array<EventName> | undefined => {
    switch (filter) {
      case "borrow":
        return ["Borrow"]
      case "repay":
        return ["Repay"]
      case "supply":
        return ["Supply"]
      case "withdraw":
        return ["Withdraw"]
      case "collateral":
        return [
          "ReserveUsedAsCollateralEnabled",
          "ReserveUsedAsCollateralDisabled",
        ]
      case "liquidation":
        return ["LiquidationCall"]
      case "emode":
        return ["UserEModeSet"]
      default:
        return undefined
    }
  })()

  const assetIds = useMemo(
    () =>
      searchPhrase.length
        ? all
            .values()
            .filter(
              (asset) =>
                asset.name.toLowerCase().includes(searchPhrase) ||
                asset.symbol.toLowerCase().includes(searchPhrase),
            )
            .map((asset) => asset.id)
            .toArray()
        : undefined,
    [all, searchPhrase],
  )

  return useQuery({
    queryKey: QUERY_KEYS.accountMoneyMarketEvents(
      hexAddress,
      filter,
      searchPhrase,
      pagination,
    ),
    queryFn: () =>
      request(import.meta.env.VITE_SQUID_URL, MoneyMarketEventsDocument, {
        first: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize,
        filter: {
          allInvolvedParticipants: {
            contains: [hexAddress],
          },
          eventName: eventNames && {
            in: eventNames,
          },
          allInvolvedAssetIds: assetIds && {
            containedBy: assetIds,
          },
        },
      }),
    enabled: !!hexAddress,
  })
}

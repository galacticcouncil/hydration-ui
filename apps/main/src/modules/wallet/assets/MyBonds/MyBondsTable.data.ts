import { bigShift } from "@galacticcouncil/utils"
import { useMemo } from "react"

import { AssetType } from "@/api/assets"
import { MyBond } from "@/modules/wallet/assets/MyBonds/MyBondsTable.columns"
import {
  Balance,
  useAccountBalancesWithPriceByAssetType,
} from "@/states/account"
import { numericallyStrDesc } from "@/utils/sort"

export const useMyBondsTableData = () => {
  const { data: balancesWithPrice, isLoading } =
    useAccountBalancesWithPriceByAssetType([AssetType.BOND])

  const bonds = useMemo(() => {
    if (isLoading) {
      return []
    }

    return (balancesWithPrice?.bondBalances ?? [])
      .map<MyBond>(({ meta, balance, price }) => {
        const total = getTotalBalance(balance, meta.decimals)
        const totalDisplay = price ? total.times(price).toString() : undefined

        return {
          ...meta,
          total: total.toString(),
          totalDisplay,
        }
      })
      .sort((asset, other) =>
        numericallyStrDesc(
          asset.totalDisplay ?? "0",
          other.totalDisplay ?? "0",
        ),
      )
  }, [balancesWithPrice?.bondBalances, isLoading])

  return {
    data: bonds,
    isLoading,
  }
}

const getTotalBalance = (balance: Balance, decimals: number) => {
  return bigShift(balance.total.toString(), -decimals)
}
